// Sistema de tema (claro/oscuro) con persistencia en localStorage.
// Oscuro por defecto. Usa una clase `.dark` en <html>, que es lo que
// espera Tailwind (ver @custom-variant dark en theme.css).

export type Theme = "light" | "dark";

const STORAGE_KEY = "voxmentor_theme";
const listeners = new Set<() => void>();

function readInitial(): Theme {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  }
  return "dark"; // oscuro por defecto
}

let current: Theme = readInitial();

export function getTheme(): Theme {
  return current;
}

function applyThemeToDOM(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function setTheme(theme: Theme) {
  current = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* modo incógnito / storage bloqueado: seguimos igual */
  }
  applyThemeToDOM(theme);
  listeners.forEach((l) => l());
}

export function toggleTheme() {
  setTheme(current === "dark" ? "light" : "dark");
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// Aplica el tema guardado inmediatamente al arrancar (evita parpadeo).
export function initTheme() {
  applyThemeToDOM(current);
}
