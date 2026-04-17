import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedDealer = createRouteMatcher([
  "/dealer/dashboard(.*)",
  "/dealer/preise(.*)",
  "/dealer/liefergebiet(.*)",
  "/dealer/profil(.*)",
]);
const isProtectedAdmin = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedDealer(req) || isProtectedAdmin(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
