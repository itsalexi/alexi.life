// Going between home and About keeps the header still: the page wrapper skips its fade, and
// the page that arrives plays its own short entrance (home's hero and folders rise back in;
// About starts building straight away). PageTransition sets this while it renders the new
// page, so the page's own mount code can read it.
const PAIR = new Set(["/", "/about"]);
let soft = false;

export const isSoftPair = (from, to) =>
  from !== to && PAIR.has(from) && PAIR.has(to);
export const setSoftEnter = (value) => {
  soft = value;
};
export const softEnter = () => soft;
