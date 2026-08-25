import { Stroke } from "../../utils/geometry";
import { arc, join, line } from "./builders";

/**
 * Simplified stroke skeletons for Devanagari vowels and consonants, in the
 * same spirit as the other templates: best-effort simplified guide shapes
 * for tracing practice (most Devanagari letters hang from a horizontal
 * "shirorekha" head-line, reproduced here as a shared top bar), not exact
 * font outlines.
 */

const BAR_LEFT = 15;
const BAR_RIGHT = 82;
const BAR_Y = 15;

function bar(x1 = BAR_LEFT, x2 = BAR_RIGHT): Stroke {
  return line({ x: x1, y: BAR_Y }, { x: x2, y: BAR_Y });
}

function withBar(body: Stroke[], x1 = BAR_LEFT, x2 = BAR_RIGHT): Stroke[] {
  return [bar(x1, x2), ...body];
}

export const DEVANAGARI_VOWELS: Record<string, Stroke[]> = {
  "अ": withBar([
    join(line({ x: 30, y: 15 }, { x: 30, y: 65 }), arc(37, 72, 10, 10, 140, 320, 8)),
    line({ x: 35, y: 45 }, { x: 78, y: 85 }),
  ]),
  "आ": withBar([
    join(line({ x: 28, y: 15 }, { x: 28, y: 65 }), arc(35, 72, 10, 10, 140, 320, 8)),
    line({ x: 33, y: 45 }, { x: 74, y: 82 }),
    line({ x: 82, y: 15 }, { x: 82, y: 85 }),
  ]),
  "इ": [arc(45, 30, 18, 14, 140, 400, 10), arc(55, 65, 20, 16, -40, 220, 10)],
  "ई": [
    arc(40, 30, 16, 13, 140, 400, 10),
    arc(50, 65, 18, 15, -40, 220, 10),
    line({ x: 70, y: 22 }, { x: 85, y: 18 }),
  ],
  "उ": [arc(50, 40, 25, 20, 180, 400, 12), line({ x: 70, y: 55 }, { x: 55, y: 80 })],
  "ऊ": [
    arc(48, 38, 24, 18, 180, 400, 12),
    line({ x: 68, y: 52 }, { x: 55, y: 72 }),
    line({ x: 55, y: 72 }, { x: 45, y: 90 }),
  ],
  "ऋ": [line({ x: 35, y: 15 }, { x: 35, y: 68 }), arc(45, 75, 15, 12, 180, 420, 8)],
  "ए": withBar([
    line({ x: 40, y: 15 }, { x: 40, y: 85 }),
    line({ x: 40, y: 50 }, { x: 70, y: 50 }),
    arc(45, 78, 14, 10, 0, 140, 6),
  ]),
  "ऐ": withBar([
    line({ x: 25, y: 15 }, { x: 25, y: 85 }),
    arc(30, 78, 10, 8, 0, 140, 6),
    line({ x: 55, y: 15 }, { x: 55, y: 85 }),
    line({ x: 55, y: 50 }, { x: 78, y: 50 }),
  ]),
  "ओ": withBar([
    line({ x: 30, y: 15 }, { x: 30, y: 85 }),
    join(arc(50, 45, 22, 20, -90, 90, 10)),
  ]),
  "औ": withBar([
    line({ x: 25, y: 15 }, { x: 25, y: 85 }),
    arc(45, 45, 18, 18, -90, 90, 10),
    line({ x: 82, y: 15 }, { x: 82, y: 85 }),
  ]),
  "अं": [
    ...withBar([
      join(line({ x: 30, y: 15 }, { x: 30, y: 65 }), arc(37, 72, 10, 10, 140, 320, 8)),
      line({ x: 35, y: 45 }, { x: 78, y: 85 }),
    ]),
    arc(85, 18, 3, 3, 0, 360, 8),
  ],
  "अः": [
    ...withBar([
      join(line({ x: 30, y: 15 }, { x: 30, y: 65 }), arc(37, 72, 10, 10, 140, 320, 8)),
      line({ x: 35, y: 45 }, { x: 70, y: 85 }),
    ]),
    arc(85, 40, 3, 3, 0, 360, 8),
    arc(85, 58, 3, 3, 0, 360, 8),
  ],
};

export const DEVANAGARI_CONSONANTS: Record<string, Stroke[]> = {
  "क": withBar([line({ x: 32, y: 15 }, { x: 32, y: 85 }), arc(48, 45, 22, 18, -90, 90, 10), line({ x: 48, y: 63 }, { x: 65, y: 85 })]),
  "ख": withBar([line({ x: 32, y: 15 }, { x: 32, y: 85 }), arc(50, 42, 24, 22, -100, 100, 12), arc(55, 30, 8, 8, 0, 360, 6)]),
  "ग": withBar([line({ x: 30, y: 15 }, { x: 30, y: 55 }), arc(45, 55, 20, 20, 180, 0, 10), line({ x: 65, y: 55 }, { x: 45, y: 85 })]),
  "घ": withBar([line({ x: 28, y: 15 }, { x: 28, y: 45 }), arc(45, 55, 24, 28, -160, 60, 14)]),
  "ङ": [arc(45, 35, 18, 15, 60, 300, 10), arc(52, 55, 6, 6, 0, 360, 6)],
  "च": withBar([arc(50, 48, 26, 30, -70, 250, 14)]),
  "छ": withBar([arc(50, 48, 26, 30, -70, 250, 14), line({ x: 74, y: 30 }, { x: 84, y: 18 })]),
  "ज": withBar([arc(48, 42, 22, 18, 180, 420, 10), line({ x: 65, y: 55 }, { x: 40, y: 85 })]),
  "झ": withBar([arc(48, 42, 24, 22, 180, 430, 10), line({ x: 68, y: 58 }, { x: 42, y: 88 }), line({ x: 42, y: 88 }, { x: 30, y: 78 })]),
  "ञ": [arc(45, 35, 18, 15, 60, 300, 10), line({ x: 45, y: 50 }, { x: 45, y: 70 })],
  "ट": withBar([arc(50, 50, 24, 24, -60, 260, 14)]),
  "ठ": withBar([arc(50, 50, 24, 24, -60, 260, 14), arc(50, 50, 10, 10, -60, 200, 8)]),
  "ड": withBar([arc(48, 50, 24, 24, -80, 240, 14)]),
  "ढ": withBar([arc(48, 50, 24, 24, -80, 240, 14), line({ x: 65, y: 65 }, { x: 78, y: 82 })]),
  "ण": withBar([arc(46, 50, 22, 22, -80, 240, 12), line({ x: 62, y: 62 }, { x: 82, y: 55 }, { x: 82, y: 85 })]),
  "त": withBar([line({ x: 32, y: 15 }, { x: 32, y: 50 }), line({ x: 32, y: 50 }, { x: 72, y: 50 }), line({ x: 72, y: 50 }, { x: 45, y: 85 })]),
  "थ": withBar([arc(50, 50, 26, 26, 0, 360, 16)]),
  "द": withBar([arc(48, 55, 24, 22, -150, 130, 12), line({ x: 30, y: 45 }, { x: 62, y: 40 })]),
  "ध": withBar([arc(48, 50, 24, 26, -140, 140, 14), arc(48, 30, 10, 8, 0, 360, 6)]),
  "न": withBar([line({ x: 30, y: 15 }, { x: 30, y: 85 }), arc(48, 68, 20, 17, -160, 90, 10)]),
  "प": withBar([line({ x: 32, y: 15 }, { x: 32, y: 85 }), arc(50, 32, 22, 17, -90, 90, 10)]),
  "फ": withBar([line({ x: 32, y: 15 }, { x: 32, y: 85 }), arc(52, 35, 24, 20, -90, 90, 10), arc(50, 60, 8, 8, 0, 360, 6)]),
  "ब": withBar([line({ x: 30, y: 15 }, { x: 30, y: 85 }), arc(50, 50, 22, 35, -95, 95, 12)]),
  "भ": withBar([line({ x: 28, y: 15 }, { x: 28, y: 45 }), arc(46, 50, 24, 28, -160, 60, 14), arc(60, 30, 10, 10, 0, 360, 6)]),
  "म": withBar([
    line({ x: 25, y: 15 }, { x: 25, y: 85 }),
    line({ x: 25, y: 85 }, { x: 40, y: 55 }),
    line({ x: 40, y: 55 }, { x: 55, y: 85 }),
    line({ x: 55, y: 55 }, { x: 82, y: 55 }, { x: 82, y: 85 }),
  ]),
  "य": withBar([line({ x: 35, y: 15 }, { x: 35, y: 55 }), line({ x: 35, y: 55 }, { x: 55, y: 85 }), line({ x: 55, y: 55 }, { x: 75, y: 85 }), line({ x: 55, y: 55 }, { x: 68, y: 30 })]),
  "र": withBar([line({ x: 35, y: 15 }, { x: 35, y: 55 }), arc(50, 55, 15, 12, 180, 340, 8)]),
  "ल": withBar([line({ x: 35, y: 15 }, { x: 35, y: 65 }), arc(50, 72, 16, 13, 180, 400, 8)]),
  "व": withBar([arc(50, 50, 26, 26, -100, 220, 14)]),
  "श": withBar([line({ x: 32, y: 15 }, { x: 32, y: 85 }), arc(48, 32, 18, 15, -90, 90, 8), line({ x: 48, y: 47 }, { x: 65, y: 85 })]),
  "ष": withBar([arc(46, 45, 22, 22, -90, 200, 12), line({ x: 55, y: 60 }, { x: 78, y: 50 }, { x: 78, y: 85 })]),
  "स": withBar([line({ x: 30, y: 15 }, { x: 30, y: 40 }), arc(48, 45, 20, 18, -160, 90, 10), line({ x: 48, y: 63 }, { x: 68, y: 85 })]),
  "ह": withBar([line({ x: 30, y: 15 }, { x: 30, y: 85 }), arc(52, 45, 24, 22, -110, 140, 12)]),
};
