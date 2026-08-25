export interface Point {
  x: number;
  y: number;
}

export type Stroke = Point[];

/** Total length of a polyline. */
export function pathLength(points: Point[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += distance(points[i - 1], points[i]);
  }
  return length;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Flattens multiple strokes into a single point sequence, inserting a
 * duplicated-point "seam" between strokes so pen-lifts don't get treated
 * as a straight jump when we later resample at equal spacing. */
export function flattenStrokes(strokes: Stroke[]): Point[] {
  const points: Point[] = [];
  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    points.push(...stroke);
  }
  return points;
}

/** Resamples a polyline into exactly `n` equidistant points. */
export function resample(points: Point[], n: number): Point[] {
  if (points.length === 0) return [];
  if (points.length === 1) return new Array(n).fill(points[0]);

  const totalLength = pathLength(points);
  if (totalLength === 0) return new Array(n).fill(points[0]);

  const interval = totalLength / (n - 1);
  let distanceSoFar = 0;
  const resampled: Point[] = [points[0]];
  const working = points.map((p) => ({ ...p }));

  for (let i = 1; i < working.length; i++) {
    const prev = working[i - 1];
    const curr = working[i];
    const segmentLength = distance(prev, curr);

    if (distanceSoFar + segmentLength >= interval) {
      const t = (interval - distanceSoFar) / segmentLength;
      const nx = prev.x + t * (curr.x - prev.x);
      const ny = prev.y + t * (curr.y - prev.y);
      const newPoint = { x: nx, y: ny };
      resampled.push(newPoint);
      working.splice(i, 0, newPoint);
      distanceSoFar = 0;
    } else {
      distanceSoFar += segmentLength;
    }
  }

  // Floating point drift can leave us one point short.
  while (resampled.length < n) {
    resampled.push(working[working.length - 1]);
  }
  return resampled.slice(0, n);
}

/** Total ink length across all strokes - unlike pathLength(flattenStrokes(...)),
 * this never counts the "jump" between one stroke's end and the next
 * stroke's start as real ink. */
export function strokesPathLength(strokes: Stroke[]): number {
  return strokes.reduce((sum, stroke) => sum + pathLength(stroke), 0);
}

/**
 * Resamples every stroke independently into a combined cloud of `n` points
 * total, allocated proportionally to each stroke's share of the total ink
 * length (minimum 2 points per non-empty stroke so short strokes, like a
 * crossbar, aren't resampled away entirely).
 *
 * This matters because resampling the flattened (concatenated) points
 * directly - i.e. resample(flattenStrokes(strokes), n) - treats the
 * straight-line "jump" between one stroke's end and the next stroke's
 * start as if it were real ink, wasting resample points on empty space
 * and making the result depend on what order the strokes happen to be in.
 * Resampling per-stroke and combining avoids both problems.
 */
export function resampleStrokes(strokes: Stroke[], n: number): Point[] {
  const nonEmpty = strokes.filter((s) => s.length > 0);
  if (nonEmpty.length === 0) return [];

  const lengths = nonEmpty.map((s) => Math.max(pathLength(s), 0.01));
  const totalLength = lengths.reduce((a, b) => a + b, 0);
  const minPerStroke = Math.min(2, Math.floor(n / nonEmpty.length) || 1);

  const counts = lengths.map((len) =>
    Math.max(minPerStroke, Math.round((len / totalLength) * n))
  );

  const result: Point[] = [];
  for (let i = 0; i < nonEmpty.length; i++) {
    result.push(...resample(nonEmpty[i], counts[i]));
  }
  return result;
}

export function centroid(points: Point[]): Point {
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  return { x: sum.x / points.length, y: sum.y / points.length };
}

export function boundingBox(points: Point[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];
  const idx = (sortedValues.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedValues[lo];
  return sortedValues[lo] + (sortedValues[hi] - sortedValues[lo]) * (idx - lo);
}

/**
 * Bounding box using the 5th/95th percentile of each axis instead of the
 * true min/max. A single shaky touch point near the end of a short stroke
 * can otherwise shift the true min/max noticeably more on one axis than
 * the other (e.g. a small letter's height jumping 40 -> 45 while its width
 * barely moves), and since scaleToSquare scales each axis independently,
 * that one outlier point ends up warping the whole shape's aspect ratio -
 * worse the smaller/more compact the character, which is common for many
 * Devanagari/Tamil/Kannada letters built from a couple of short strokes.
 */
export function robustBoundingBox(points: Point[]) {
  const xs = points.map((p) => p.x).sort((a, b) => a - b);
  const ys = points.map((p) => p.y).sort((a, b) => a - b);
  const minX = percentile(xs, 0.05);
  const maxX = percentile(xs, 0.95);
  const minY = percentile(ys, 0.05);
  const maxY = percentile(ys, 0.95);
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

/** Translates points so their centroid sits at the origin. */
export function translateToOrigin(points: Point[]): Point[] {
  const c = centroid(points);
  return points.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));
}

/** Uniformly scales points (independently per axis) into a `size`x`size` box,
 * using a percentile-trimmed bounding box (see robustBoundingBox) so outlier
 * points land slightly outside the square instead of dictating the scale. */
export function scaleToSquare(points: Point[], size: number): Point[] {
  const box = robustBoundingBox(points);
  const width = box.width || 1;
  const height = box.height || 1;
  return points.map((p) => ({
    x: ((p.x - box.minX) / width) * size,
    y: ((p.y - box.minY) / height) * size,
  }));
}

/** Scale-to-square + translate-to-origin, the standard normalization for
 * comparing two point clouds regardless of their original position/size.
 * Deliberately doesn't rotate - see recognizer.ts for why. */
export function normalize(points: Point[], size: number): Point[] {
  return translateToOrigin(scaleToSquare(points, size));
}

export function rotateBy(points: Point[], radians: number): Point[] {
  const c = centroid(points);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return points.map((p) => {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    return {
      x: dx * cos - dy * sin + c.x,
      y: dx * sin + dy * cos + c.y,
    };
  });
}

/** Angle (radians) from centroid to the first point. */
export function indicativeAngle(points: Point[]): number {
  const c = centroid(points);
  return Math.atan2(points[0].y - c.y, points[0].x - c.x);
}

/** Mean distance from each point in `from` to its nearest point in `to`. */
function meanNearestDistance(from: Point[], to: Point[]): number {
  if (from.length === 0 || to.length === 0) return Infinity;
  let sum = 0;
  for (const p of from) {
    let best = Infinity;
    for (const q of to) {
      const d = distance(p, q);
      if (d < best) best = d;
    }
    sum += best;
  }
  return sum / from.length;
}

/**
 * Order-invariant shape distance between two point clouds: for every point
 * in `a`, distance to its nearest neighbor in `b`, averaged, and
 * symmetrically the other way, then combined. Unlike an index-aligned
 * point-to-point distance, this doesn't care what order or direction the
 * points were traced in - two strokes drawn in a different (but equally
 * valid) order, or a single stroke traced backwards, still compare as
 * identical shapes. That matters a lot for multi-stroke characters, where
 * there's no single "correct" stroke order a real writer will reliably
 * match.
 */
export function symmetricNearestDistance(a: Point[], b: Point[]): number {
  return (meanNearestDistance(a, b) + meanNearestDistance(b, a)) / 2;
}
