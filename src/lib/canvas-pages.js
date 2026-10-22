// Pages on the light canvas design (home and the rebuilt detail pages). On these the old
// dark chrome (navbar, footer, night sky) is hidden and the preloader uses its light look.
// Detail sections are added here as each one moves over.
const CANVAS_DETAIL = /^\/(projects|hackathons|blog|talks|work)\/[^/]+\/?$/;

export function isCanvasPage(pathname) {
  if (!pathname) return false;
  return (
    pathname === "/" || pathname === "/about" || CANVAS_DETAIL.test(pathname)
  );
}
