import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Robust JWT payload parser for Edge runtime
function parseJwtPayload(
  token: string,
): { role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const parsed = JSON.parse(jsonPayload);
    // Token expiry check (exp is in seconds)
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read accessToken or refreshToken from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const accessPayload = accessToken ? parseJwtPayload(accessToken) : null;
  const refreshPayload = refreshToken ? parseJwtPayload(refreshToken) : null;

  // Active payload preferentially from valid access token, fallback to refresh token
  const payload = accessPayload || refreshPayload;
  const role = payload?.role;
  const isAuthenticated = Boolean(payload && role);

  const hasSearchParams = request.nextUrl.searchParams.toString().length > 0;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/account-verify");

  const isAdminRoute = pathname.startsWith("/admin");
  const isRecruiterRoute = pathname.startsWith("/recruiter");
  const isCandidateProtected =
    pathname.startsWith("/candidate") &&
    !pathname.startsWith("/candidate/assessment/") &&
    !pathname.startsWith("/candidate/exam/");

  // 1. If an authenticated user visits auth pages, redirect to dashboard UNLESS there are search params (redirect/error)
  if (isAuthRoute && isAuthenticated && !hasSearchParams) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (role === "RECRUITER") {
      return NextResponse.redirect(
        new URL("/recruiter/dashboard", request.url),
      );
    }
    return NextResponse.redirect(new URL("/candidate/dashboard", request.url));
  }

  // 2. Protect Admin routes (/admin/*) - strictly ADMIN only
  if (isAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      return res;
    }
    if (role !== "ADMIN") {
      if (role === "RECRUITER") {
        return NextResponse.redirect(
          new URL("/recruiter/dashboard", request.url),
        );
      }
      return NextResponse.redirect(
        new URL("/candidate/dashboard", request.url),
      );
    }
  }

  // 3. Protect Recruiter routes (/recruiter/*) - RECRUITER or ADMIN only
  if (isRecruiterRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      return res;
    }
    if (role !== "RECRUITER" && role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/candidate/dashboard", request.url),
      );
    }
  }

  // 4. Protect Candidate dashboard routes (/candidate/*) - DEVELOPER only
  if (isCandidateProtected) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      return res;
    }
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (role === "RECRUITER") {
      return NextResponse.redirect(
        new URL("/recruiter/dashboard", request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/account-verify",
    "/admin/:path*",
    "/recruiter/:path*",
    "/candidate/:path*",
  ],
};
