import * as PIXI from "pixi.js";

import Config from "./config.js";

window.addEventListener("load", main);

function main() {
  window.removeEventListener("load", main);

  const app = new PIXI.Application(
    Config.canvasWidth,
    Config.canvasHeight,
    {
      antialias  : true,
      autoResize : true,
      resolution : Config.resolution,
      transparent: false
    }
  );

  const wrapper = document.getElementById("canvas-wrapper");
  if (wrapper) {
    wrapper.appendChild(app.view);
  }
}
