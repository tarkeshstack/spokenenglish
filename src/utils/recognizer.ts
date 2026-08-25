import {
  Point,
  Stroke,
  averagePointDistance,
  flattenStrokes,
  pathLength,
  resample,
  rotateBy,
  scaleToSquare,
  translateToOrigin,
} from "./geometry";

const RESAMPLE_POINTS = 64;
const SQUARE_SIZE = 100;
// Letters are orientation-sensitive (M vs W, 6 vs 9, b vs p), so unlike a
// classic $1 gesture recognizer we deliberately do NOT rotate to the
// "indicative angle" first (that would cancel out orientation entirely).
// We only search a small window to tolerate natural hand tilt.
const MAX_ROTATION_DEGREES = 20;
const ROTATION_STEP_DEGREES = 2;

/** Translate + uniform-scale only (no rotation) - orientation must be preserved. */
function normalize(points: Point[]): Point[] {
  const scaled = scaleToSquare(points, SQUARE_SIZE);
  return translateToOrigin(scaled);
}

/** Best-fit average distance between two already-normalized point clouds,
 * searching a small window of rotation to tolerate natural hand tilt. */
function bestDistance(candidate: Point[], template: Point[]): number {
  let best = averagePointDistance(candidate, template);
  for (
    let deg = -MAX_ROTATION_DEGREES;
    deg <= MAX_ROTATION_DEGREES;
    deg += ROTATION_STEP_DEGREES
  ) {
    if (deg === 0) continue;
    const rotated = rotateBy(candidate, (deg * Math.PI) / 180);
    const d = averagePointDistance(rotated, template);
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
  threshold = 0.6
): MatchResult {
  const userPoints = flattenStrokes(userStrokes);
  const templatePoints = flattenStrokes(templateStrokes);

  if (userPoints.length < 2 || templatePoints.length < 2) {
    return { score: 0, coverage: 0, matched: false };
  }

  // Path-length ratio (on the un-resampled, translate+scale-normalized
  // points) catches sparse scribbles that happen to land near the right
  // silhouette: a real trace of a multi-stroke letter has comparable total
  // ink length to the template once both are scaled to the same box.
  const rawUserLen = pathLength(normalize(userPoints));
  const rawTemplateLen = pathLength(normalize(templatePoints));
  const lengthRatio =
    Math.min(rawUserLen, rawTemplateLen) / Math.max(rawUserLen, rawTemplateLen, 1);

  const normalizedUser = normalize(resample(userPoints, RESAMPLE_POINTS));
  const normalizedTemplate = normalize(resample(templatePoints, RESAMPLE_POINTS));

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
