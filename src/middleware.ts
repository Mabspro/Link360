import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminEmails } from "@/lib/admin-emails";

const ADMIN_PREFIX = "/admin";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // If Supabase sent the OAuth code to the root URL (wrong redirect), send it to the callback.
  const path = request.nextUrl.pathname;
  const code = request.nextUrl.searchParams.get("code");
  if (path === "/" && code) {
    const url = new URL("/auth/callback", request.url);
    url.searchParams.set("code", code);
    url.searchParams.set("next", request.nextUrl.searchParams.get("next") ?? "/admin/dashboard");
    return NextResponse.redirect(url);
  }

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

  if (path.startsWith(ADMIN_PREFIX)) {
    if (path === "/admin" || path === "/admin/" || path === "/admin/login") {
      if (user) {
        const adminEmails = getAdminEmails(process.env.LINK360_ADMIN_EMAILS);
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
    const adminEmails = getAdminEmails(process.env.LINK360_ADMIN_EMAILS);
    const email = user.email?.toLowerCase();
    if (!email || !adminEmails.includes(email)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
