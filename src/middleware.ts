import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PREFIX = "/admin";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith(ADMIN_PREFIX)) {
    const path = request.nextUrl.pathname;
    if (path === "/admin" || path === "/admin/" || path === "/admin/login") {
      if (user) {
        const adminEmails = (process.env.LINK360_ADMIN_EMAILS ?? "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        const email = user.email?.toLowerCase();
        if (email && adminEmails.includes(email)) {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
      }
      return response;
    }
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const adminEmails = (process.env.LINK360_ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const email = user.email?.toLowerCase();
    if (!email || !adminEmails.includes(email)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
