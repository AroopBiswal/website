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
  images: {
    // The photo gallery serves from a Vercel Blob store; next/image only
    // optimizes hosts it has been told about.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
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
      // Vercel Web Analytics for the dashboard. Its script and beacon are
      // requested from the SITE ROOT, not from under /trading, so without this
      // they land on this project instead and the dashboard reports nothing.
      //
      // The path is an obfuscated per-project prefix Vercel generates so ad
      // blockers cannot pattern-match "/_vercel/insights". It is specific to
      // the dashboard project, so it cannot collide with this site's own
      // analytics, which keep using /_vercel/insights here.
      //
      // If dashboard analytics ever goes quiet again, check this hash first:
      // it is Vercel-generated and nothing guarantees it is stable forever.
      // The current value is visible in the dashboard's client bundle as
      // NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH, and a wrong one fails
      // silently, with the script 404ing and the pageview sitting unsent in
      // window.vaq.
      {
        source: "/2289c7240943bbb3/:path*",
        destination: `${DASHBOARD}/2289c7240943bbb3/:path*`,
      },
    ];
  },
};

export default nextConfig;
