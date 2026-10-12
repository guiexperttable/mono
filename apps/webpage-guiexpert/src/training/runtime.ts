// Client runtime of the training pages: starts the live demos (LiveDemo.astro) on click.
// (The CSS of the demos is imported by LiveDemo.astro – CSS imported here would be missing in the production build.)
import type { DemoContext, DemoFn } from "./demos/shared/demo";

const modules = import.meta.glob<{ default: DemoFn }>("./demos/*.ts");

function createContext(root: HTMLElement, host: HTMLDivElement): DemoContext {
  const controls = root.querySelector<HTMLElement>(".td-controls")!;
  const infoEl = root.querySelector<HTMLElement>(".td-info")!;
  const add = <T extends HTMLElement>(el: T): T => (controls.appendChild(el), el);
  return {
    host,
    root,
    info: text => { infoEl.textContent = text; },
    button(label, onClick) {
      const b = add(document.createElement("button"));
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", () => onClick(b));
      return b;
    },
    search(placeholder, onInput) {
      const input = add(document.createElement("input"));
      input.type = "search";
      input.placeholder = placeholder;
      input.addEventListener("input", () => onInput(input.value));
      return input;
    },
    range(label, min, max, step, onInput) {
      const wrap = add(document.createElement("label"));
      wrap.className = "td-range";
      wrap.append(`${label} `);
      const input = wrap.appendChild(document.createElement("input"));
      Object.assign(input, { type: "range", min: String(min), max: String(max), step: String(step), value: String(min) });
      input.addEventListener("input", () => onInput(Number(input.value)));
      return input;
    },
    toggle(label, checked, onChange) {
      const wrap = add(document.createElement("label"));
      wrap.className = "td-toggle";
      const input = wrap.appendChild(document.createElement("input"));
      input.type = "checkbox";
      input.checked = checked;
      wrap.append(` ${label}`);
      input.addEventListener("change", () => onChange(input.checked));
      return input;
    }
  };
}

async function start(root: HTMLElement): Promise<void> {
  if (root.dataset.started) return;
  root.dataset.started = "1";
  const name = root.dataset.demo!;
  const load = modules[`./demos/${name}.ts`];
  const host = root.querySelector<HTMLDivElement>(".td-host")!;
  const poster = root.querySelector<HTMLElement>(".td-poster")!;
  if (!load) {
    root.querySelector(".td-info")!.textContent = `demo "${name}" not found`;
    return;
  }
  root.querySelector(".td-info")!.textContent = "loading …";
  const { default: run } = await load();
  poster.hidden = true;
  host.hidden = false;
  root.querySelector(".td-info")!.textContent = "";
  // give the browser one frame to lay out the host (the table measures it)
  await new Promise(r => requestAnimationFrame(() => r(undefined)));
  try {
    run(createContext(root, host));
    root.dataset.ready = "1";
  } catch (e) {
    console.error(e);
    root.querySelector(".td-info")!.textContent = `error: ${(e as Error).message}`;
  }
}

export function initLiveDemos(): void {
  const autostartAll = new URLSearchParams(location.search).has("demos");   // ?demos → start all (screenshots)
  let autostartOne: string | null = null;                                     // a demo that reloaded the page
  try {
    autostartOne = sessionStorage.getItem("ge-training-autostart");
    sessionStorage.removeItem("ge-training-autostart");
  } catch { /* blocked storage */ }
  for (const root of document.querySelectorAll<HTMLElement>(".training-demo:not([data-init])")) {
    root.dataset.init = "1";
    root.querySelector(".td-run")?.addEventListener("click", () => start(root));
    if (autostartAll || root.dataset.demo === autostartOne) {
      start(root);
    } else if (root.dataset.autostart) {
      new IntersectionObserver((entries, observer) => {
        if (entries.some(e => e.isIntersecting)) {
          observer.disconnect();
          start(root);
        }
      }, { rootMargin: "200px" }).observe(root);
    }
  }
}
