import {
  Point,
  Stroke,
  flattenStrokes,
  normalize,
  resampleStrokes,
  robustBoundingBox,
  rotateBy,
  strokesPathLength,
  symmetricNearestDistance,
} from "./geometry";

const RESAMPLE_POINTS = 64;
const SQUARE_SIZE = 100;
// Letters are orientation-sensitive (M vs W, 6 vs 9, b vs p), so unlike a
// classic $1 gesture recognizer we deliberately do NOT rotate to the
// "indicative angle" first (that would cancel out orientation entirely).
// We only search a small window to tolerate natural hand tilt.
const MAX_ROTATION_DEGREES = 20;
const ROTATION_STEP_DEGREES = 2;

/** Scales every stroke into the fixed comparison square using ONE shared
 * transform derived from the combined bounding box of all strokes (so
 * relative proportions between strokes are preserved), keeping strokes
 * separate rather than flattening them into one point list. */
function normalizeStrokes(strokes: Stroke[]): Stroke[] {
  const box = robustBoundingBox(flattenStrokes(strokes));
  const width = box.width || 1;
  const height = box.height || 1;
  return strokes.map((stroke) =>
    stroke.map((p) => ({
      x: ((p.x - box.minX) / width) * SQUARE_SIZE,
      y: ((p.y - box.minY) / height) * SQUARE_SIZE,
    }))
  );
}

/** Best-fit order-invariant distance between two already-normalized point
 * clouds, searching a small window of rotation to tolerate natural hand
 * tilt. Order-invariance (see symmetricNearestDistance) means this doesn't
 * care what order or direction strokes were drawn in - only overall shape. */
function bestDistance(candidate: Point[], template: Point[]): number {
  let best = symmetricNearestDistance(candidate, template);
  for (
    let deg = -MAX_ROTATION_DEGREES;
    deg <= MAX_ROTATION_DEGREES;
    deg += ROTATION_STEP_DEGREES
  ) {
    if (deg === 0) continue;
    const rotated = rotateBy(candidate, (deg * Math.PI) / 180);
    const d = symmetricNearestDistance(rotated, template);
    if (d < best) best = d;
  }
  return best;
}

export interface MatchResult {
  /** 0..1 shape-similarity score. */
  score: number;
  /** 0..1 how much of the template's ink the user actually covered. */
  coverage: number;
  matched: boolean;
}

const DIAGONAL = Math.SQRT2 * SQUARE_SIZE;

/** How much of the template is "covered": fraction of template points that
 * have a nearby user point, using a generous radius relative to the
 * normalized square. Cheap stand-in for a full raster IoU. */
function coverageRatio(userPoints: Point[], templatePoints: Point[]): number {
  const radius = SQUARE_SIZE * 0.13;
  let covered = 0;
  for (const t of templatePoints) {
    let hit = false;
    for (const u of userPoints) {
      const d = Math.hypot(t.x - u.x, t.y - u.y);
      if (d <= radius) {
        hit = true;
        break;
      }
    }
    if (hit) covered++;
  }
  return covered / templatePoints.length;
}

export function scoreAttempt(
  userStrokes: Stroke[],
  templateStrokes: Stroke[],
  threshold = 0.85
): MatchResult {
  const userPoints = flattenStrokes(userStrokes);
  const templatePoints = flattenStrokes(templateStrokes);

  if (userPoints.length < 2 || templatePoints.length < 2) {
    return { score: 0, coverage: 0, matched: false };
  }

  // Path-length ratio, computed per-stroke and summed (not on a flattened/
  // concatenated point list) so the straight-line "jump" between one
  // stroke's end and the next stroke's start never gets counted as ink -
  // that jump's length depends entirely on what order the strokes happen
  // to be drawn in, which has nothing to do with how much was actually
  // written.
  const userLen = strokesPathLength(normalizeStrokes(userStrokes));
  const templateLen = strokesPathLength(normalizeStrokes(templateStrokes));
  const lengthRatio = Math.min(userLen, templateLen) / Math.max(userLen, templateLen, 1);

  // Resample each stroke independently (proportional to its own length)
  // rather than resampling the flattened point list, for the same reason:
  // a phantom inter-stroke jump would otherwise soak up resample points
  // and shift depending on stroke order.
  const normalizedUser = normalize(resampleStrokes(userStrokes, RESAMPLE_POINTS), SQUARE_SIZE);
  const normalizedTemplate = normalize(
    resampleStrokes(templateStrokes, RESAMPLE_POINTS),
    SQUARE_SIZE
  );

  const dist = bestDistance(normalizedUser, normalizedTemplate);
  const shapeScore = Math.max(0, 1 - dist / (0.5 * DIAGONAL));
  const coverage = coverageRatio(normalizedUser, normalizedTemplate);

  // Blend: shape closeness matters most (and is the only term sensitive to
  // wrong orientation), coverage catches "right bbox, ink in the wrong
  // place", length ratio catches "too few points to actually be a real
  // trace of the letter".
  const score = shapeScore * 0.6 + coverage * 0.2 + lengthRatio * 0.2;

  return {
    score: Math.min(1, Math.max(0, score)),
    coverage,
    // Coverage/length alone can't carry a match - shapeScore must also be
    // decent, otherwise a wrong-orientation trace that happens to fill the
    // same bounding box could slip through.
    matched: score >= threshold && coverage >= 0.5 && shapeScore >= 0.55,
  };
}
