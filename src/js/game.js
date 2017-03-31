import * as PIXI from "pixi.js";

import Config from "./config.js";
import { Gene, Plankton } from "./plankton.js";

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

    this.planktons = [];
    this.initPlanktons();

    this.app.ticker.add(() => {
      this.move();
    });

    this.app.stage.interactive = true;
    this.app.stage.on("click", event => {
      const { x: mouseX, y: mouseY } = event.data.global;
      // attractive force to the mouse
      for (let i = 0; i < this.planktons.length; i++) {
        const plankton = this.planktons[i];
        const distSq = (plankton.x - mouseX) ** 2 + (plankton.y - mouseY) ** 2;
        if (distSq > 0) {
          const f = MOUSE_FORCE;
          const t = Math.atan2(
            mouseY - plankton.y,
            mouseX - plankton.x
          );
          plankton.applyForce(f * plankton.mass, t);
        }
      }
    });
  }

  initPlanktons() {
    for (let i = 0; i < 5; i++) {
      const gene = Gene.random();
      const plankton = Plankton.fromGene(
        gene,
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
  }

  move() {
    for (let i = 0; i < this.planktons.length; i++) {
      const plankton = this.planktons[i];
      const alive = plankton.animate();
      if (!alive) {
        plankton.destroy();
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
    if (this.planktons.length < 50) {
      for (let i = 0; i < this.planktons.length; i++) {
        const plankton = this.planktons[i];
        if (plankton.isReproducible() && Math.random() < CLONE_RATE) {
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
    // re-initialize if there are no planktons
    if (this.planktons.length === 0) {
      this.initPlanktons();
    }
  }
}
