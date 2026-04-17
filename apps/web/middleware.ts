import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedDealer = createRouteMatcher([
  "/dealer/dashboard(.*)",
  "/dealer/preise(.*)",
  "/dealer/liefergebiet(.*)",
  "/dealer/profil(.*)",
]);
const isProtectedAdmin = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedDealer(req) || isProtectedAdmin(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/dealer/login", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
