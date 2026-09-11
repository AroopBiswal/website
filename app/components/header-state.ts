/**
 * Where the header was last painted, shared between the home page and the
 * page shell for the app's lifetime (a plain module variable: it survives
 * client-side navigation and resets on a hard load, which is exactly when a
 * fresh arrival animation is right anyway).
 *
 * The header has two states — rule through the nav (home) and rule below it
 * (About, and every page with its own route). A page arriving in the state
 * the header is already in must not animate, or the move replays between two
 * identical positions. This is how the page shell knows it came from About,
 * and how the home page could know it came from the blog.
 */
export const header = { below: false };
