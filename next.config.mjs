import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
	webpack(config, options) {
		config.module.rules.push({
			test: /\.ya?ml$/,
			use: 'yaml-loader',
		});
		return config;
	}
}

export default withNextIntl(nextConfig);
