import { Stroke } from "../../utils/geometry";
import { arc, join, line } from "./builders";

/**
 * Simplified stroke skeletons for the Devanagari (Hindi) digits, in the
 * same spirit as the Latin templates: best-effort simplified guide shapes
 * for tracing practice, not exact font outlines.
 */
export const DEVANAGARI_DIGITS: Record<string, Stroke[]> = {
  "०": [arc(50, 50, 22, 28, 0, 360, 20)], // 0
  "१": [join(arc(42, 22, 16, 13, 180, 400, 10), line({ x: 58, y: 25 }, { x: 60, y: 88 }))], // 1
  "२": [join(arc(50, 28, 26, 16, 200, 400, 12), line({ x: 70, y: 40 }, { x: 20, y: 82 }, { x: 38, y: 78 }))], // 2
  "३": [arc(38, 30, 24, 17, -80, 100, 10), arc(38, 70, 24, 17, -100, 80, 10)], // 3
  "४": [line({ x: 68, y: 15 }, { x: 33, y: 35 }, { x: 70, y: 50 }, { x: 33, y: 65 }, { x: 60, y: 85 })], // 4
  "५": [join(line({ x: 55, y: 12 }, { x: 30, y: 12 }, { x: 30, y: 45 }), arc(45, 65, 26, 22, -110, 120, 14))], // 5
  "६": [join(line({ x: 68, y: 15 }, { x: 38, y: 40 }, { x: 30, y: 65 }), arc(48, 70, 22, 20, 150, 510, 16))], // 6
  "७": [join(arc(45, 25, 22, 13, 160, 20, 10), line({ x: 65, y: 20 }, { x: 32, y: 88 }))], // 7
  "८": [join(arc(50, 30, 20, 16, 300, 90, 10), arc(50, 68, 22, 18, 90, 300, 10))], // 8
  "९": [join(arc(52, 34, 22, 18, 320, 680, 16), line({ x: 74, y: 34 }, { x: 68, y: 60 }, { x: 42, y: 88 }))], // 9
};
