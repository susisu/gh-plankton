import { clip, cycle } from "./utils.js";

export class RGB {
  constructor(r, g, b) {
    this.r = clip(r, 0, 1);
    this.g = clip(g, 0, 1);
    this.b = clip(b, 0, 1);
  }

  static fromHSV(hsv) {
    const i = hsv.h * 6;
    const c = hsv.s * hsv.v;
    const x = c * (1 - Math.abs(i % 2 - 1));
    const m = hsv.v - c;
    if (i < 1) {
      return new RGB(c + m, x + m, m);
    }
    else if (i < 2) {
      return new RGB(x + m, c + m, m);
    }
    else if (i < 3) {
      return new RGB(m, c + m, x + m);
    }
    else if (i < 4) {
      return new RGB(m, x + m, c + m);
    }
    else if (i < 5) {
      return new RGB(x + m, m, c + m);
    }
    else {
      return new RGB(c + m, m, x + m);
    }
  }

  clone() {
    return new RGB(this.r, this.g, this.b);
  }

  toString() {
    return `RGB(${this.r}, ${this.g}, ${this.b})`;
  }

  toHSV() {
    return HSV.fromRGB(this);
  }

  toHexCode() {
    const r = Math.floor(this.r * 0xFF).toString(16);
    const g = Math.floor(this.g * 0xFF).toString(16);
    const b = Math.floor(this.b * 0xFF).toString(16);
    return `#${r}${g}${b}`;
  }

  toInteger() {
    const r = Math.floor(this.r * 0xFF);
    const g = Math.floor(this.g * 0xFF);
    const b = Math.floor(this.b * 0xFF);
    return (r << 16) | (g << 8) | b;
  }
}

export class HSV {
  constructor(h, s, v) {
    this.h = cycle(h, 0, 1);
    this.s = clip(s, 0, 1);
    this.v = clip(v, 0, 1);
  }

  static fromRGB(rgb) {
    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const min = Math.min(rgb.r, rgb.g, rgb.b);
    const s = max === 0 ? 0 : max;
    const h = max === min   ? 0
            : min === rgb.b ? 1 / 6 * (rgb.g - rgb.r) / (max - min) + 1 / 6
            : min === rgb.r ? 1 / 6 * (rgb.b - rgb.g) / (max - min) + 3 / 6
                            : 1 / 6 * (rgb.r - rgb.b) / (max - min) + 5 / 6;
    return new HSV(h, s, max);
  }

  clone() {
    return new HSV(this.h, this.s, this.v);
  }

  toString() {
    return `HSV(${this.h}, ${this.s}, ${this.v})`;
  }

  toRGB() {
    return RGB.fromHSV(this);
  }

  toHexCode() {
    return this.toRGB().toHexCode();
  }

  toInteger() {
    return this.toRGB().toInteger();
  }
}

export function rgb(r, g, b) {
  return new RGB(r / 0xFF, g / 0xFF, b / 0xFF);
}

export function hsv(h, s, v) {
  return new HSV(h / 360, s / 0xFF, v / 0xFF);
}
