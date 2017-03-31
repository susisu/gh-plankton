let randomStdGaussianCache = undefined;

export function randomStdGaussian() {
  if (typeof randomStdGaussianCache === "number") {
    const cache = randomStdGaussianCache;
    randomStdGaussianCache = undefined;
    return cache;
  }
  else {
    const x = Math.random();
    const y = Math.random();
    const r = Math.sqrt(-2 * Math.log(x));
    const t = 2 * Math.PI * y;
    const u = r * Math.cos(t);
    const v = r * Math.sin(t);
    randomStdGaussianCache = v;
    return u;
  }
}

export function randomGaussian(mean = 0, sigma = 1) {
  return randomStdGaussian() * sigma + mean;
}
