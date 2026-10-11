/** Public address of this deployment, without a trailing slash. Empty means "use the page's own origin". */
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");

export const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/andrebarros6/ten-a-day";
