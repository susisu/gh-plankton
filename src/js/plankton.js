import * as PIXI from "pixi.js";

import { HSV } from "./colors.js";
import { randomGaussian } from "./random.js";
import { clip } from "./utils.js";

export class Gene {
  constructor(hue, blocks, size) {
    this.hue    = hue;
    this.blocks = blocks;
    this.size   = size;
  }

  static random() {
    const hue = Math.random();
    const blocks = new Array(15).fill().map(() =>
      clip(randomGaussian(0.5, 0.25), 0, 1)
    );
    const size = clip(randomGaussian(0.25, 0.125), 0, 1);
    return new Gene(hue, blocks, size);
  }

  static cross(x, y) {
    const hue = clip(
      (Math.random() > 0.5 ? x.hue : y.hue) + randomGaussian(0, 0.05),
      0,
      1
    );
    const blocks = x.blocks.map((xb, i) => {
      const yb = y.blocks[i];
      return clip(
        (Math.random() > 0.5 ? xb : yb) + randomGaussian(0, 0.05),
        0,
        1
      );
    });
    const size = clip(
      (Math.random() > 0.5 ? x.size : y.size) + randomGaussian(0, 0.05),
      0,
      1
    );
    return new Gene(hue, blocks, size);
  }

  mutate() {
    const hue = clip(this.hue + randomGaussian(0, 0.05), 0, 1);
    const blocks = this.blocks.map(b =>
      clip(b + randomGaussian(0, 0.05), 0, 1)
    );
    const size = clip(this.size + randomGaussian(0, 0.05), 0, 1);
    return new Gene(hue, blocks, size);
  }
}

export class Expression {
  constructor(color, blocks, size) {
    this.color  = color;
    this.blocks = blocks;
    this.size   = size;
  }

  static fromGene(gene) {
    const color = new HSV(
      gene.hue + randomGaussian(0, 0.01),
      randomGaussian(112 / 255, 16 / 255),
      randomGaussian(208 / 255, 16 / 255)
    ).toInteger();
    const blocks = gene.blocks.map(b =>
      b + randomGaussian(0, 0.01) > 0.5
    );
    const size = clip(gene.size + randomGaussian(0, 0.01), 0, 1);
    // die if empty
    if (blocks.every(b => !b)) {
      return null;
    }
    return new Expression(color, blocks, size);
  }
}

export class Plankton extends PIXI.Container {
  constructor(gene, expr, x, y, v, angle) {
    super();
    this.gene = gene;

    this.x     = x;
    this.y     = y;
    this.v     = v;
    this.angle = angle;

    this.maxSize = expr.size * 2 + 2;

    {
      let s = 0;
      let m = 0;
      for (let i = 0; i < expr.blocks.length; i++) {
        const r = i % 3;
        s += (expr.blocks[i] ? (1 + expr.size) ** 2 : 0) * r;
        m += expr.blocks[i] ? (1 + expr.size) ** 2 : 0;
      }
      this.speed = 4 / s;
      this.mass  = m;
    }

    this.motionRatio = 20;

    this.life   = randomGaussian(1600, 500);
    this.time   = 0;
    this.timing = Math.floor(Math.random() * this.motionRatio);

    // render
    this.graphics = new PIXI.Graphics();
    {
      const w = 3;
      const h = Math.floor(expr.blocks.length / w) + 1;
      for (let i = 0; i < expr.blocks.length; i++) {
        if (expr.blocks[i]) {
          const r = i % w;
          const y = Math.floor(i / w) - h / 2;
          if (r === 0) {
            this.graphics.beginFill(expr.color);
            this.graphics.drawRect(-0.5 + y, -0.5 + r, 1, 1);
            this.graphics.endFill();
          }
          else {
            this.graphics.beginFill(expr.color);
            this.graphics.drawRect(-0.5 + y, -0.5 + r, 1, 1);
            this.graphics.endFill();
            this.graphics.beginFill(expr.color);
            this.graphics.drawRect(-0.5 + y, -0.5 - r, 1, 1);
            this.graphics.endFill();
          }
        }
      }
      this.graphics.scale    = new PIXI.Point(0.5, 0.5);
      this.graphics.rotation = this.angle;
      this.graphics.alpha    = this.life < 100 ? this.life / 100 : 1;
    }
    this.addChild(this.graphics);
  }

  static fromGene(gene, x, y, v, angle) {
    const expr = Expression.fromGene(gene);
    if (!expr) {
      return null;
    }
    return new Plankton(gene, expr, x, y, v, angle);
  }

  clone() {
    return Plankton.fromGene(
      this.gene.mutate(),
      this.x,
      this.y,
      0,
      Math.random() * Math.PI * 2
    );
  }

  applyForce(f, angle) {
    const fx = f * Math.cos(angle);
    const fy = f * Math.sin(angle);
    const vx = this.v * Math.cos(this.angle) + fx / this.mass;
    const vy = this.v * Math.sin(this.angle) + fy / this.mass;
    this.v     = Math.sqrt(vx ** 2 + vy ** 2);
    this.angle = Math.atan2(vy, vx);
  }

  animate() {
    if (this.life > 0) {
      this.x += this.v * Math.cos(this.angle);
      this.y += this.v * Math.sin(this.angle);
      this.v *= 0.9;

      if (this.time % this.motionRatio === this.timing) {
        this.v     = this.speed;
        this.angle = this.angle + randomGaussian(0, Math.PI / 60);
      }

      this.life -= 1;
      this.time += 1;

      const size = this.time < 500
        ? this.maxSize * (0.5 + (this.time / 500) * 0.5)
        : this.maxSize;
      this.graphics.scale    = new PIXI.Point(size, size);
      this.graphics.rotation = this.angle;
      this.graphics.alpha    = this.life < 100 ? this.life / 100 : 1;

      return true;
    }
    else {
      return false;
    }
  }

  isReproducible() {
    return this.time > 500 && this.life >= 100;
  }
}
