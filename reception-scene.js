(() => {
  const scene = document.querySelector(".reception-approved");
  const photo = scene.querySelector(".photo");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const aim = {x: 0, y: 0};
  const pointer = {x: 0, y: 0};
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;

  function alignFloor() {
    const ground = photo.offsetTop + photo.offsetHeight * .885;
    scene.style.setProperty("--ground", `${ground}px`);
  }

  function paint(time) {
    const delta = lastTime ? Math.min(.05, (time - lastTime) / 1000) : 0;
    lastTime = time;
    elapsed += delta;
    const ease = 1 - Math.exp(-delta * 6);
    pointer.x += (aim.x - pointer.x) * ease;
    pointer.y += (aim.y - pointer.y) * ease;

    const drift = Math.sin(elapsed * .76);
    const lift = Math.sin(elapsed * .66);
    const depth = (.5 - .5 * Math.cos(elapsed * .76)) * .012;
    const x = drift + pointer.x * .48;
    const y = lift + pointer.y * .42;
    scene.style.setProperty("--camera-x", `${x * 9.5}px`);
    scene.style.setProperty("--camera-y", `${y * 3.2}px`);
    scene.style.setProperty("--camera-scale", (1 + depth).toFixed(5));
    scene.style.setProperty("--far-offset", `${x * -1.6}px`);
    scene.style.setProperty("--near-offset", `${x * .55}px`);
    frame = requestAnimationFrame(paint);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (scene.classList.contains("in") && !reducedMotion.matches && !document.hidden) {
      frame = requestAnimationFrame(paint);
    }
  }

  function resetPointer() {
    aim.x = 0;
    aim.y = 0;
  }

  scene.addEventListener("pointermove", event => {
    const b = scene.getBoundingClientRect();
    aim.x = 2 * (event.clientX - b.left) / b.width - 1;
    aim.y = 2 * (event.clientY - b.top) / b.height - 1;
  }, {passive: true});
  scene.addEventListener("pointerleave", resetPointer);
  scene.addEventListener("pointerup", resetPointer);
  scene.addEventListener("pointercancel", resetPointer);
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  let wasActive = scene.classList.contains("in");
  new MutationObserver(() => {
    const active = scene.classList.contains("in");
    if (active === wasActive) return;
    wasActive = active;
    if (!active) resetPointer();
    sync();
  }).observe(scene, {attributes:true, attributeFilter:["class"]});
  new ResizeObserver(alignFloor).observe(scene);
  alignFloor();
  sync();
})();
