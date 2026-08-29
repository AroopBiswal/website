import type { NextConfig } from "next";

// The Bull and Bear trading dashboard lives at /trading. It is a separate
// Vercel project built from AroopBiswal/BullAndBear (root directory `web`),
// not code in this repo, so a broken dashboard build cannot take this site
// down. That project is mounted at basePath "/trading", which is why the
// prefix is kept in the destination rather than stripped: strip it and the
// dashboard returns 404 for everything.
//
// It proxies onward to the Mac mini over a Cloudflare Tunnel, server side, so
// the tunnel hostname never reaches a browser and the whole path stays same
// origin. This is the only thing this site needs to know about any of that.
const DASHBOARD = "https://bullandbear-dashboard.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // The bare path needs its own rule. With `:path*` matching zero
      // segments, "/trading" rewrites to "<dashboard>/trading/" with a
      // trailing slash, the dashboard 308s that back to "/trading", and the
      // two bounce off each other until the browser gives up. Matching the
      // bare path first keeps the slash off and breaks the loop.
      {
        source: "/trading",
        destination: `${DASHBOARD}/trading`,
      },
      {
        source: "/trading/:path*",
        destination: `${DASHBOARD}/trading/:path*`,
      },
    ];
  },
};

export default nextConfig;
