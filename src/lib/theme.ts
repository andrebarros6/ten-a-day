import { THEME_KEY } from "./storage";

/** Runs before first paint so an explicit choice never flashes the other theme. */
export const themeScript =
  "try{var t=localStorage.getItem('" +
  THEME_KEY +
  "');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}";
