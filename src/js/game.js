import * as PIXI from "pixi.js";

import Config from "./config.js";
import { Gene, Plankter } from "./plankton.js";

const EDGE        = 32;
const EDGE_FORCE  = 0.1;
const INT_FORCE   = 64;
const MOUSE_FORCE = 1;
const CLONE_RATE  = 0.0015;

export default class Game {
  constructor(app) {
    this.app = app;

    this.bg = new PIXI.Graphics();
    this.bg.beginFill(0xF0F0F0);
    this.bg.drawShape(app.screen);
    this.bg.endFill();
    this.app.stage.addChild(this.bg);

    this.plankton = [];
    this.initPlankton();

    this.app.ticker.add(() => {
      this.move();
    });

    this.app.stage.interactive = true;
    this.app.stage.on("click", event => {
      const { x: mouseX, y: mouseY } = event.data.global;
      // attractive force to the mouse
      for (let i = 0; i < this.plankton.length; i++) {
        const plankter = this.plankton[i];
        const distSq = (plankter.x - mouseX) ** 2 + (plankter.y - mouseY) ** 2;
        if (distSq > 0) {
          const f = MOUSE_FORCE;
          const t = Math.atan2(
            mouseY - plankter.y,
            mouseX - plankter.x
          );
          plankter.applyForce(f * plankter.mass, t);
        }
      }
    });
  }

  initPlankton() {
    for (let i = 0; i < 5; i++) {
      const gene = Gene.random();
      const plankter = Plankter.fromGene(
        gene,
        Math.random() * Config.canvasWidth,
        Math.random() * Config.canvasHeight,
        0,
        Math.random() * 2 * Math.PI
      );
      if (plankter) {
        this.app.stage.addChild(plankter);
        this.plankton.push(plankter);
      }
    }
  }

  move() {
    for (let i = 0; i < this.plankton.length; i++) {
      const plankter = this.plankton[i];
      const alive = plankter.animate();
      if (!alive) {
        plankter.destroy();
        this.plankton.splice(i, 1);
        i -= 1;
        continue;
      }
      // repulsive force from the edges
      if (plankter.x < EDGE) {
        plankter.applyForce(
          EDGE_FORCE * (EDGE - plankter.x),
          0
        );
      }
      else if (plankter.x >= Config.canvasWidth - EDGE) {
        plankter.applyForce(
          EDGE_FORCE * (plankter.x - (Config.canvasWidth - EDGE)),
          -Math.PI
        );
      }
      if (plankter.y < EDGE) {
        plankter.applyForce(
          EDGE_FORCE * (EDGE - plankter.y),
          Math.PI / 2
        );
      }
      else if (plankter.y >= Config.canvasHeight - EDGE) {
        plankter.applyForce(
          EDGE_FORCE * (plankter.y - (Config.canvasHeight - EDGE)),
          -Math.PI / 2
        );
      }
    }
    // interactions
    for (let i = 0; i < this.plankton.length; i++) {
      for (let j = i + 1; j < this.plankton.length; j++) {
        const plankterA = this.plankton[i];
        const plankterB = this.plankton[j];
        const distSq = (plankterA.x - plankterB.x) ** 2
          + (plankterA.y - plankterB.y) ** 2;
        if (0 < distSq && distSq < 32 * 32) {
          const f = Math.min(INT_FORCE / distSq, 1);
          const t = Math.atan2(
            plankterA.y - plankterB.y,
            plankterA.x - plankterB.x
          );
          plankterA.applyForce(f, t);
          plankterB.applyForce(f, -t);
        }
      }
    }
    // cloning
    if (this.plankton.length < 50) {
      const len = this.plankton.length;
      for (let i = 0; i < len; i++) {
        const plankter = this.plankton[i];
        if (plankter.isReproducible() && Math.random() < CLONE_RATE) {
          const clone = this.plankton[i].clone();
          if (clone) {
            this.app.stage.addChild(clone);
            this.plankton.push(clone);
            if (this.plankton.length >= 50) {
              break;
            }
          }
        }
      }
    }
    // re-initialize if there are no plankton
    if (this.plankton.length === 0) {
      this.initPlankton();
    }
  }
}
