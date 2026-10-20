// dsh-h5-adapter — node half: no-op host entry so the client bundle loads.
// All behaviour lives in ./client.js (global CSS + composer overflow logic).
export const name = "dsh-h5-adapter";
export const inject = [];
export function apply() {
  console.log("[dsh-h5-adapter] host half mounted");
}
