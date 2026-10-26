import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// Keep the SVG coordinate system when CSS changes an icon's rendered size.
const svgLoader = { loader: "@svgr/webpack", options: { dimensions: false } };

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    proxyClientMaxBodySize: "65mb",
    authInterrupts: true,
    serverActions: { bodySizeLimit: "22mb" },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [svgLoader],
    });
    return config;
  },
  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.svg": {
        loaders: [svgLoader],
        as: "*.js",
      },
    },
  },
};

export default withNextIntl(nextConfig);
