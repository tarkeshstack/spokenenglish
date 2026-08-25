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

/** Translates points so their centroid sits at the origin. */
export function translateToOrigin(points: Point[]): Point[] {
  const c = centroid(points);
  return points.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));
}

/** Uniformly scales points (independently per axis) into a `size`x`size` box. */
export function scaleToSquare(points: Point[], size: number): Point[] {
  const box = boundingBox(points);
  const width = box.width || 1;
  const height = box.height || 1;
  return points.map((p) => ({
    x: ((p.x - box.minX) / width) * size,
    y: ((p.y - box.minY) / height) * size,
  }));
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

export function averagePointDistance(a: Point[], b: Point[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return Infinity;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += distance(a[i], b[i]);
  }
  return sum / n;
}
