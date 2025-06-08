import createNextIntlPlugin from 'next-intl/plugin';
import { NextConfig } from "next";
import path from "path";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
    output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
    // https://nextjs.org/docs/app/guides/self-hosting#configuring-caching
    cacheHandler: path.resolve('./cache-handler.mjs'),
    cacheMaxMemorySize: 0,  // disable default in-memory caching
    // https://nextjs.org/docs/app/guides/self-hosting#build-cache
    generateBuildId: async () => {
        // This could be anything, using the latest git hash
        return process.env.GIT_HASH ?? null
    },
    webpack(config: any, options: any) {
        config.module.rules.push({
            test: /\.ya?ml$/,
            use: 'yaml-loader',
        });
        return config;
    },
    // Nginx will do gzip compression
    compress: false,
}

export default withNextIntl(nextConfig);
