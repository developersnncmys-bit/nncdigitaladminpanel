import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CKEditor 5 ships CommonJS that Turbopack chokes on unless we explicitly
  // transpile it through the Next.js pipeline.
  transpilePackages: ["@ckeditor/ckeditor5-react", "@ckeditor/ckeditor5-build-classic"],
};

export default nextConfig;
