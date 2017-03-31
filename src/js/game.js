import * as PIXI from "pixi.js";

import Config from "./config.js";
import { Gene, Plankton } from "./plankton.js";

const EDGE       = 32;
const EDGE_FORCE = 0.1;
const INT_FORCE  = 64;

export default class Game {
  constructor(app) {
    this.app = app;

    this.bg = new PIXI.Graphics();
    this.bg.beginFill(0xF0F0F0);
    this.bg.drawShape(app.screen);
    this.bg.endFill();
    this.app.stage.addChild(this.bg);

    this.planktons = [];
    const gene = Gene.random();
    for (let i = 0; i < 5; i++) {
      const plankton = Plankton.fromGene(
        gene.mutate(),
        Math.random() * Config.canvasWidth,
        Math.random() * Config.canvasHeight,
        0,
        Math.random() * 2 * Math.PI
      );
      if (plankton) {
        this.app.stage.addChild(plankton);
        this.planktons.push(plankton);
      }
    }

    this.app.ticker.add(() => {
      this.move();
    });
  }

  move() {
    for (let i = 0; i < this.planktons.length; i++) {
      const plankton = this.planktons[i];
      const alive = plankton.animate();
      if (!alive) {
        this.app.stage.removeChild(plankton);
        this.planktons.splice(i, 1);
        i -= 1;
        continue;
      }
      // repulsive force from the edges
      if (plankton.x < EDGE) {
        plankton.applyForce(
          EDGE_FORCE * (EDGE - plankton.x),
          0
        );
      }
      else if (plankton.x >= Config.canvasWidth - EDGE) {
        plankton.applyForce(
          EDGE_FORCE * (plankton.x - (Config.canvasWidth - EDGE)),
          -Math.PI
        );
      }
      if (plankton.y < EDGE) {
        plankton.applyForce(
          EDGE_FORCE * (EDGE - plankton.y),
          Math.PI / 2
        );
      }
      else if (plankton.y >= Config.canvasHeight - EDGE) {
        plankton.applyForce(
          EDGE_FORCE * (plankton.y - (Config.canvasHeight - EDGE)),
          -Math.PI / 2
        );
      }
    }
    // interactions
    for (let i = 0; i < this.planktons.length; i++) {
      for (let j = i + 1; j < this.planktons.length; j++) {
        const planktonA = this.planktons[i];
        const planktonB = this.planktons[j];
        const distSq = (planktonA.x - planktonB.x) ** 2
          + (planktonA.y - planktonB.y) ** 2;
        if (0 < distSq && distSq < 32 * 32) {
          const f = Math.min(INT_FORCE / distSq, 1);
          const t = Math.atan2(
            planktonA.y - planktonB.y,
            planktonA.x - planktonB.x
          );
          planktonA.applyForce(f, t);
          planktonB.applyForce(f, -t);
        }
      }
    }
    // cloning
    for (let i = 0; i < this.planktons.length; i++) {
      const plankton = this.planktons[i];
      if (plankton.life >= 100 && Math.random() < 0.001) {
        const clone = this.planktons[i].clone();
        if (clone) {
          this.app.stage.addChild(clone);
          this.planktons.push(clone);
          if (this.planktons.length >= 50) {
            break;
          }
        }
      }
    }
  }
}
