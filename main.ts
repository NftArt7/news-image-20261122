// news-image-20261122 — "The World in One Day"
// A self-contained Node 22 program (standard library only) that draws a
// one-page newspaper front page summing up Sunday 22 November 2026 and
// writes it as a deterministic PNG to /output/entry.png (or
// $MAKEFUN_OUTPUT_DIR/entry.png). No network, no fonts, no dependencies:
// text is rendered with a small 5x7 bitmap font defined below, and the PNG
// is encoded by hand (zlib deflate + CRC32), so two runs write identical
// bytes. All six stories were verified against live reporting dated
// 22 November 2026 before drawing (see README.md for the source list).

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------- palette
const PAPER = [247, 242, 231];
const INK = [20, 20, 20];
const RED = [179, 38, 30];
const BLUE = [29, 78, 137];
const TEAL = [15, 118, 110];
const GOLD = [201, 141, 32];
const GREEN = [46, 125, 50];
const SKY = [135, 190, 220];
const WHITE = [255, 255, 255];
const GREY = [90, 90, 84];
const LIGHT = [232, 226, 210];

// ---------------------------------------------------------------- 5x7 font
// Each glyph: 7 rows of 5 cells, '#' = on. Only capitals, digits and
// punctuation are defined; the renderer upper-cases all text, which suits
// a newspaper front page.
const FONT: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  ';': ['00000', '01100', '01100', '00000', '01100', '00100', '01000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'],
  '\u2022': ['00000', '00000', '01100', '01100', '01100', '00000', '00000'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};

// ------------------------------------------------------------------- canvas
const W = 1024;
const H = 1024;
type RGB = number[];

class Canvas {
  px = new Uint8Array(W * H * 3);
  constructor() {
    this.fill(0, 0, W, H, PAPER);
  }
  set(x: number, y: number, c: RGB) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 3;
    this.px[i] = c[0]; this.px[i + 1] = c[1]; this.px[i + 2] = c[2];
  }
  fill(x: number, y: number, w: number, h: number, c: RGB) {
    for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) {
      for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) this.set(i, j, c);
    }
  }
  rect(x: number, y: number, w: number, h: number, c: RGB) { this.fill(x, y, w, h, c); }
  border(x: number, y: number, w: number, h: number, c: RGB, t = 2) {
    this.fill(x, y, w, t, c); this.fill(x, y + h - t, w, t, c);
    this.fill(x, y, t, h, c); this.fill(x + w - t, y, t, h, c);
  }
  circle(cx: number, cy: number, r: number, c: RGB) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) this.set(cx + x, cy + y, c);
    }
  }
  ring(cx: number, cy: number, r: number, t: number, c: RGB) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const d = x * x + y * y;
      if (d <= r * r && d > (r - t) * (r - t)) this.set(cx + x, cy + y, c);
    }
  }
  line(x0: number, y0: number, x1: number, y1: number, c: RGB, t = 1) {
    const dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy), 1);
    for (let s = 0; s <= n; s++) {
      const x = Math.round(x0 + (dx * s) / n), y = Math.round(y0 + (dy * s) / n);
      this.fill(x - Math.floor(t / 2), y - Math.floor(t / 2), t, t, c);
    }
  }
  tri(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, c: RGB) {
    const minX = Math.min(x0, x1, x2), maxX = Math.max(x0, x1, x2);
    const minY = Math.min(y0, y1, y2), maxY = Math.max(y0, y1, y2);
    const d = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const a = ((x1 - x) * (y2 - y) - (y1 - y) * (x2 - x)) / d;
      const b = ((x2 - x) * (y0 - y) - (y2 - y) * (x0 - x)) / d;
      const cc = 1 - a - b;
      if (a >= 0 && b >= 0 && cc >= 0) this.set(x, y, c);
    }
  }
  text(str: string, x: number, y: number, scale: number, c: RGB) {
    let cx = x;
    for (const raw of str.toUpperCase()) {
      const g = FONT[raw] ?? FONT['?'];
      for (let r = 0; r < 7; r++) for (let col = 0; col < 5; col++) {
        if (g[r][col] === '1') this.fill(cx + col * scale, y + r * scale, scale, scale, c);
      }
      cx += 6 * scale;
    }
    return cx;
  }
  textWidth(str: string, scale: number) { return str.length * 6 * scale - scale; }
  wrap(str: string, maxW: number, scale: number): string[] {
    const words = str.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (this.textWidth(test, scale) <= maxW || !cur) cur = test;
      else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines;
  }
  para(str: string, x: number, y: number, maxW: number, scale: number, c: RGB, lh?: number) {
    const lines = this.wrap(str, maxW, scale);
    const step = lh ?? Math.round(9 * scale);
    lines.forEach((ln, i) => this.text(ln, x, y + i * step, scale, c));
    return y + lines.length * step;
  }
}

// ------------------------------------------------------------- panel helper
function panel(cv: Canvas, x: number, y: number, w: number, h: number, tag: string, tagBg: RGB) {
  cv.fill(x, y, w, h, WHITE);
  cv.border(x, y, w, h, INK, 2);
  cv.fill(x, y, w, 26, tagBg);
  cv.text(tag, x + 10, y + 5, 2, WHITE);
}

// ------------------------------------------------------------------ drawing
function draw(): Buffer {
  const cv = new Canvas();

  // Masthead
  cv.fill(0, 0, W, 10, RED);
  const mast = 'THE WORLD IN ONE DAY';
  cv.text(mast, Math.round((W - cv.textWidth(mast, 4)) / 2), 26, 4, INK);
  const date = 'SUNDAY 22 NOVEMBER 2026';
  cv.text(date, Math.round((W - cv.textWidth(date, 5)) / 2), 66, 5, RED);
  cv.fill(24, 116, 976, 3, INK);
  const sub = 'SIX STORIES FROM AROUND THE GLOBE, AS REPORTED ON THE DAY';
  cv.text(sub, Math.round((W - cv.textWidth(sub, 2)) / 2), 128, 2, GREY);
  cv.fill(24, 152, 976, 3, INK);

  // ---- LEAD: COP31, Antalya (x24 y168 w628 h252)
  panel(cv, 24, 168, 628, 252, 'LEAD STORY  •  CLIMATE  •  TURKEY', RED);
  // globe icon
  cv.circle(588, 268, 52, BLUE);
  cv.circle(572, 252, 16, GREEN); cv.circle(600, 282, 18, GREEN); cv.circle(606, 248, 9, GREEN);
  cv.ring(588, 268, 52, 3, INK);
  cv.line(536, 268, 640, 268, WHITE, 2); // equator hint
  cv.circle(648, 214, 18, GOLD); // hot sun
  for (let a = 0; a < 8; a++) {
    const t = (a * Math.PI) / 4;
    cv.line(648 + Math.round(Math.cos(t) * 24), 214 + Math.round(Math.sin(t) * 24),
      648 + Math.round(Math.cos(t) * 32), 214 + Math.round(Math.sin(t) * 32), GOLD, 3);
  }
  cv.text('COP31 COLLAPSES', 40, 208, 4, INK);
  cv.text('IN ANTALYA', 40, 244, 4, INK);
  cv.para('UN CLIMATE TALKS END WITH NO FINAL DEAL. THE EU AND ISLAND NATIONS REJECTED A DRAFT THAT LEFT OUT FOSSIL FUELS. THE FIRST COP TO FAIL SINCE 2009.', 40, 292, 470, 2, INK);
  cv.text('NEARLY 200 COUNTRIES - TWO DAYS INTO OVERTIME', 40, 392, 1, GREY);

  // ---- GULF: Bahrain / Hormuz (x668 y168 w332 h252)
  panel(cv, 668, 168, 332, 252, 'MIDDLE EAST  •  THE GULF', BLUE);
  // tanker + flames (icon strip at the bottom of the panel)
  cv.fill(692, 366, 200, 26, INK); // hull
  cv.fill(850, 348, 42, 18, RED); // bridge
  cv.fill(700, 348, 60, 18, LIGHT); // tanks
  cv.tri(720, 366, 734, 344, 748, 366, [230, 126, 34]);
  cv.tri(774, 366, 786, 350, 798, 366, GOLD);
  cv.line(684, 400, 984, 400, BLUE, 4);
  cv.text('GULF FLARES UP', 684, 208, 3, INK);
  cv.text('AGAIN', 684, 238, 3, INK);
  cv.para('BAHRAIN SAYS IRAN STRUCK A CIVILIAN SITE, STARTING A FIRE. TWO TANKERS HIT IN HORMUZ.', 684, 272, 300, 2, INK);

  // ---- UKRAINE talks (x24 y436 w320 h252)
  panel(cv, 24, 436, 320, 252, 'EUROPE  •  UKRAINE', TEAL);
  cv.fill(40, 616, 288, 16, [0, 87, 184]); // Ukraine flag blue
  cv.fill(40, 632, 288, 16, [255, 213, 0]); // yellow
  cv.text('PEACE TALKS', 40, 476, 3, INK);
  cv.text('STALL', 40, 506, 3, INK);
  cv.para('US-BROKERED TALKS IN ABU DHABI END WITH NO BREAKTHROUGH. ENVOYS HEAD TO MOSCOW.', 40, 540, 288, 2, INK);

  // ---- INDONESIA factory fire (x360 y436 w320 h252)
  panel(cv, 360, 436, 320, 252, 'ASIA  •  INDONESIA', RED);
  cv.fill(376, 630, 110, 26, GREY); // factory
  cv.fill(486, 622, 52, 34, [70, 70, 66]);
  cv.tri(392, 656, 404, 622, 416, 656, [230, 126, 34]);
  cv.tri(432, 656, 442, 628, 452, 656, GOLD);
  cv.text('FACTORY FIRE:', 376, 476, 3, INK);
  cv.text('SEARCH GOES ON', 376, 506, 3, INK);
  cv.para('RESCUERS SEARCH THE BURNED CANDY FACTORY IN CIKANDE ON SUNDAY. 3 DEAD; DOZENS MISSING.', 376, 540, 288, 2, INK);

  // ---- CRICKET (x696 y436 w304 h252)
  panel(cv, 696, 436, 304, 252, 'SPORT  •  CRICKET', GREEN);
  cv.line(720, 656, 720, 622, GOLD, 6); cv.line(734, 656, 734, 622, GOLD, 6); cv.line(748, 656, 748, 622, GOLD, 6);
  cv.circle(962, 636, 14, RED); cv.ring(962, 636, 14, 2, INK);
  cv.line(820, 656, 890, 622, [210, 180, 140], 10); // bat
  cv.text('INDIA PILE UP', 712, 476, 3, INK);
  cv.text('720-9', 712, 506, 3, INK);
  cv.para('INDIA DECLARE ON A RECORD TEST TOTAL AT WELLINGTON. RAHUL 136, PANT 128.', 712, 540, 272, 2, INK);

  // ---- NFL strip (x24 y704 w976 h150)
  panel(cv, 24, 704, 976, 150, 'SPORT  •  AMERICAN FOOTBALL  •  NFL WEEK 11', INK);
  cv.fill(40, 800, 90, 46, [139, 69, 19]); // football
  cv.line(52, 823, 118, 823, WHITE, 3);
  for (let i = 0; i < 4; i++) cv.line(64 + i * 14, 814, 64 + i * 14, 832, WHITE, 2);
  cv.text('COWBOYS 51 - 30 TITANS', 150, 752, 3, INK);
  cv.text('49ERS 35 - 10 VIKINGS IN MEXICO CITY', 150, 788, 3, INK);
  cv.para('PRESCOTT THROWS FOR FOUR TOUCHDOWNS AND RUNS IN ANOTHER AS DALLAS SCORES ON ITS FIRST SIX DRIVES. CHIEFS 34-7, BILLS 26-9.', 150, 824, 830, 1, GREY);

  // ---- Footer
  cv.fill(24, 872, 976, 3, INK);
  cv.para('ALL SIX STORIES HAPPENED OR WERE FIRST REPORTED ON SUNDAY 22 NOVEMBER 2026. SOURCES: REUTERS AND THE NEW YORK TIMES ON COP31; AP AND UKMTO REPORTS ON THE GULF; EUROPEAN NEWS WIRES ON THE ABU DHABI TALKS; AP ON THE CIKANDE FIRE; CRICINFO AND SKY SPORTS ON THE WELLINGTON TEST; NFL SCOREBOARDS FOR WEEK 11.', 24, 888, 976, 1, GREY);
  cv.text('THE WORLD IN ONE DAY  •  22 NOVEMBER 2026', 24, 980, 2, INK);

  return encodePng(cv.px);
}

// ------------------------------------------------------------ PNG encoding
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(rgb: Uint8Array): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    raw.set(rgb.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// --------------------------------------------------------------------- main
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), draw());
