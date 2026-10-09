import type { NextConfig } from "next";
import path from "path";

// GITHUB_PAGES=1 produces a fully static export (served at /trialfit-ai on GitHub Pages).
const pages = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(__dirname) },
  ...(pages && {
    output: "export",
    basePath: "/trialfit-ai",
    images: { unoptimized: true },
    trailingSlash: true,
  }),
};

export default nextConfig;
