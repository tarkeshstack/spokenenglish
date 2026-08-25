import { Stroke } from "../../utils/geometry";
import { arc, join, line } from "./builders";

/**
 * Simplified block-letter "stencil" stroke skeletons for the Latin
 * alphabet and digits, in natural writing order. These aren't traced from
 * a real font - they're deliberately simple guide shapes (like the dotted
 * stroke-order guides on a kids' tracing worksheet), which is also exactly
 * what the recognizer compares the user's drawing against.
 */
export const LATIN_LETTERS: Record<string, Stroke[]> = {
  A: [line({ x: 20, y: 88 }, { x: 50, y: 12 }, { x: 80, y: 88 }), line({ x: 30, y: 58 }, { x: 70, y: 58 })],
  B: [
    line({ x: 25, y: 12 }, { x: 25, y: 88 }),
    arc(30, 31, 27, 19, -90, 90, 12),
    arc(30, 69, 29, 19, -90, 90, 12),
  ],
  C: [arc(50, 50, 32, 38, 40, 320, 18)],
  D: [line({ x: 25, y: 12 }, { x: 25, y: 88 }), arc(25, 50, 35, 38, -90, 90, 20)],
  E: [
    line({ x: 22, y: 12 }, { x: 22, y: 88 }),
    line({ x: 22, y: 12 }, { x: 78, y: 12 }),
    line({ x: 22, y: 50 }, { x: 65, y: 50 }),
    line({ x: 22, y: 88 }, { x: 78, y: 88 }),
  ],
  F: [
    line({ x: 22, y: 12 }, { x: 22, y: 88 }),
    line({ x: 22, y: 12 }, { x: 78, y: 12 }),
    line({ x: 22, y: 50 }, { x: 65, y: 50 }),
  ],
  G: [arc(50, 50, 32, 38, 40, 320, 18), line({ x: 80, y: 50 }, { x: 80, y: 65 }, { x: 50, y: 65 })],
  H: [
    line({ x: 22, y: 12 }, { x: 22, y: 88 }),
    line({ x: 78, y: 12 }, { x: 78, y: 88 }),
    line({ x: 22, y: 50 }, { x: 78, y: 50 }),
  ],
  I: [line({ x: 50, y: 12 }, { x: 50, y: 88 })],
  J: [join(line({ x: 65, y: 12 }, { x: 65, y: 68 }), arc(50, 68, 15, 15, 0, 150, 10))],
  K: [
    line({ x: 25, y: 12 }, { x: 25, y: 88 }),
    line({ x: 25, y: 50 }, { x: 75, y: 12 }),
    line({ x: 25, y: 50 }, { x: 75, y: 88 }),
  ],
  L: [line({ x: 25, y: 12 }, { x: 25, y: 88 }), line({ x: 25, y: 88 }, { x: 75, y: 88 })],
  M: [line({ x: 18, y: 88 }, { x: 18, y: 12 }, { x: 50, y: 55 }, { x: 82, y: 12 }, { x: 82, y: 88 })],
  N: [line({ x: 20, y: 88 }, { x: 20, y: 12 }, { x: 80, y: 88 }, { x: 80, y: 12 })],
  O: [arc(50, 50, 32, 38, 0, 360, 24)],
  P: [line({ x: 25, y: 12 }, { x: 25, y: 88 }), arc(30, 31, 27, 19, -90, 90, 12)],
  Q: [arc(50, 50, 32, 38, 0, 360, 24), line({ x: 58, y: 65 }, { x: 85, y: 92 })],
  R: [
    line({ x: 25, y: 12 }, { x: 25, y: 88 }),
    arc(30, 31, 27, 19, -90, 90, 12),
    line({ x: 30, y: 50 }, { x: 78, y: 88 }),
  ],
  S: [
    line(
      { x: 72, y: 18 },
      { x: 55, y: 12 },
      { x: 35, y: 15 },
      { x: 25, y: 25 },
      { x: 28, y: 38 },
      { x: 42, y: 46 },
      { x: 58, y: 54 },
      { x: 72, y: 62 },
      { x: 75, y: 75 },
      { x: 65, y: 85 },
      { x: 45, y: 88 },
      { x: 28, y: 82 }
    ),
  ],
  T: [line({ x: 20, y: 12 }, { x: 80, y: 12 }), line({ x: 50, y: 12 }, { x: 50, y: 88 })],
  U: [join(line({ x: 22, y: 12 }, { x: 22, y: 60 }), arc(50, 60, 28, 25, 180, 360, 14), line({ x: 78, y: 60 }, { x: 78, y: 12 }))],
  V: [line({ x: 20, y: 12 }, { x: 50, y: 88 }, { x: 80, y: 12 })],
  W: [line({ x: 15, y: 12 }, { x: 32, y: 88 }, { x: 50, y: 40 }, { x: 68, y: 88 }, { x: 85, y: 12 })],
  X: [line({ x: 20, y: 12 }, { x: 80, y: 88 }), line({ x: 80, y: 12 }, { x: 20, y: 88 })],
  Y: [line({ x: 20, y: 12 }, { x: 50, y: 50 }), line({ x: 80, y: 12 }, { x: 50, y: 50 }), line({ x: 50, y: 50 }, { x: 50, y: 88 })],
  Z: [line({ x: 20, y: 12 }, { x: 80, y: 12 }, { x: 20, y: 88 }, { x: 80, y: 88 })],
  // Spanish adds N with a tilde on top of the base N stroke.
  "Ñ": [
    line({ x: 20, y: 88 }, { x: 20, y: 12 }, { x: 80, y: 88 }, { x: 80, y: 12 }),
    arc(50, 4, 14, 5, 200, 340, 8),
  ],
};

export const LATIN_DIGITS: Record<string, Stroke[]> = {
  "0": [arc(50, 50, 28, 38, 0, 360, 24)],
  "1": [line({ x: 38, y: 25 }, { x: 50, y: 12 }, { x: 50, y: 88 }), line({ x: 35, y: 88 }, { x: 65, y: 88 })],
  "2": [
    join(arc(50, 28, 27, 16, 200, 400, 12), line({ x: 70, y: 40 }, { x: 20, y: 85 })),
    line({ x: 20, y: 85 }, { x: 82, y: 85 }),
  ],
  "3": [arc(35, 30, 26, 18, -80, 100, 10), arc(35, 70, 26, 18, -100, 80, 10)],
  "4": [line({ x: 65, y: 12 }, { x: 20, y: 65 }, { x: 80, y: 65 }), line({ x: 65, y: 12 }, { x: 65, y: 88 })],
  "5": [line({ x: 75, y: 12 }, { x: 25, y: 12 }), join(line({ x: 25, y: 12 }, { x: 25, y: 52 }), arc(35, 70, 27, 20, -100, 110, 12))],
  "6": [join(line({ x: 70, y: 15 }, { x: 35, y: 45 }, { x: 28, y: 68 }), arc(48, 72, 24, 20, 140, 500, 16))],
  "7": [line({ x: 20, y: 12 }, { x: 80, y: 12 }, { x: 35, y: 88 })],
  "8": [arc(50, 32, 20, 18, 0, 360, 14), arc(50, 68, 24, 20, 0, 360, 14)],
  "9": [join(arc(52, 32, 24, 20, 320, 680, 16), line({ x: 76, y: 32 }, { x: 70, y: 60 }, { x: 45, y: 88 }))],
};
