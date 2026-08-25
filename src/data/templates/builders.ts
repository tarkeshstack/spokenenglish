import { Point, Stroke } from "../../utils/geometry";

/**
 * All templates live on a fixed 0-100 x 0-100 grid (x: left->right,
 * y: top->bottom) so they're easy to author and reason about; the
 * recognizer normalizes both the template and the user's drawing before
 * comparing, so the absolute grid size doesn't matter.
 */

/** Points along an elliptical arc, degrees, 0=right/+x, 90=down/+y. */
export function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startDeg: number,
  endDeg: number,
  steps = 12
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = startDeg + ((endDeg - startDeg) * i) / steps;
    const rad = (t * Math.PI) / 180;
    pts.push({ x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) });
  }
  return pts;
}

/** A straight polyline through the given key points. */
export function line(...pts: Point[]): Point[] {
  return pts;
}

/** Concatenates point sequences into a single continuous stroke. */
export function join(...parts: Point[][]): Stroke {
  return parts.flat();
}
