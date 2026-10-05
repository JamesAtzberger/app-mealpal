// lets the user override it with a toggle button, remembering the choice in localStorage.

const THEME_KEY = "recipe-app:theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function currentSystemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Call once on startup. Restores a saved preference, if any. */
export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) applyTheme(saved);
  // if nothing saved, CSS's @media (prefers-color-scheme) rules already
  // handle it with no JS/attribute needed.
}

/* Flips light<->dark and remembers the choice. */
export function toggleTheme() {
  const current =
    document.documentElement.getAttribute("data-theme") ||
    (currentSystemPrefersDark() ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
  return next;
}
