import { isCanvasPage } from "./canvas-pages.js";

const scenes = new Map();

function getScene(key) {
  if (!scenes.has(key)) {
    scenes.set(key, { generation: 0, status: null, listeners: new Set() });
  }
  return scenes.get(key);
}

/** Start a scene generation; stale imports and draws cannot settle a newer one. */
export function beginSceneLoad(key) {
  const scene = getScene(key);
  const generation = ++scene.generation;
  scene.status = null;
  let settled = false;

  return (status) => {
    if (settled || scene.generation !== generation) return;
    settled = true;
    scene.status = status === "ready" ? "ready" : "fallback";
    for (const notify of [...scene.listeners]) notify(scene.status);
  };
}

/** Wait for actual first-frame readiness, even if the scene has not mounted yet. */
export function waitForSceneReady(pathname, { signal } = {}) {
  if (signal?.aborted) return Promise.resolve({ status: "fallback" });
  if (pathname?.startsWith("/admin"))
    return Promise.resolve({ status: "ready" });
  // canvas detail pages have no 3D scene to wait for
  if (pathname !== "/" && isCanvasPage(pathname))
    return Promise.resolve({ status: "ready" });

  const scene = getScene(pathname === "/" ? "home" : "moonlit");
  if (scene.status) return Promise.resolve({ status: scene.status });

  return new Promise((resolve) => {
    const finish = (status) => {
      signal?.removeEventListener("abort", abort);
      scene.listeners.delete(finish);
      resolve({ status });
    };
    const abort = () => finish("fallback");
    scene.listeners.add(finish);
    signal?.addEventListener("abort", abort, { once: true });
  });
}
