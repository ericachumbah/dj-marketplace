import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["en", "fr"];
const DEFAULT_LOCALE = "en";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if pathname already has a locale
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Get user's preferred language from Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  let preferredLocale = DEFAULT_LOCALE;

  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2).toLowerCase());
    
    for (const lang of languages) {
      if (LOCALES.includes(lang)) {
        preferredLocale = lang;
        break;
      }
    }
  }

  // Redirect to locale-prefixed path
  return NextResponse.redirect(
    new URL(`/${preferredLocale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)",
  ],
};
