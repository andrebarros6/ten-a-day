import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is static, so the build is a plain folder (`out/`) any host can serve.
  // Remove this line if a backend is added and server features are needed.
  output: "export",
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
