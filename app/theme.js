// manage theme and toggle between light and dark  
const THEME_KEY = "recipe-app:theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  saveTheme(theme); 
}

function currentSystemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// Call once on startup. Restores a saved preference, if any.
export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    applyTheme(saved);
  } else { // apply a default theme
    applyTheme("dark"); // starting theme 
  }
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

// Flips light<->dark and remembers the choice. 
export function toggleTheme() {
  const current =
    document.documentElement.getAttribute("data-theme") ||
    (currentSystemPrefersDark() ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
