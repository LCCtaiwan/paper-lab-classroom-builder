import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // vinext applies this request gate before App Router handlers. Leave room
      // for a 20 MB PDF plus multipart metadata while the API re-checks 20 MB.
      bodySizeLimit: "24mb",
    },
  },
};

export default nextConfig;
