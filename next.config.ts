import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-eval' is required only in dev for React's debugging features (eval-based
      // stack traces from Turbopack HMR); React never uses eval() in production.
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    serverActions: {
      // Next's default (1MB) is too small for the admin Excel import Server Action, which can
      // receive several legacy timesheet files in one submission. The per-file 10MB/type check
      // in app/admin/import/actions.ts is the real validation layer; this just needs to be large
      // enough that a legitimate multi-file submission doesn't get rejected before reaching it.
      bodySizeLimit: "25mb",
    },
    // proxy.ts (matched on this route) buffers the request body up to this limit before it
    // reaches the Server Action, independent of serverActions.bodySizeLimit above — both need
    // to be raised together or large uploads get silently truncated mid-multipart-form.
    proxyClientMaxBodySize: "25mb",
  },
};

export default nextConfig;
