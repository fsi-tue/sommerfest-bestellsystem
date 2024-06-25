export const rateLimit = (limit, windowMs) => {
	const requests = new Map();

	return (req, res, next) => {
		const now = Date.now();
		const windowStart = now - windowMs;

		// Clean up old requests
		for (const [ip, timestamps] of requests.entries()) {
			requests.set(ip, timestamps.filter(timestamp => timestamp > windowStart));
			if (requests.get(ip).length === 0) {
				requests.delete(ip);
			}
		}

		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

		if (!requests.has(ip)) {
			requests.set(ip, []);
		}

		const timestamps = requests.get(ip);

		if (timestamps.length >= limit) {
			return res.status(429).json({ message: 'Too many requests, please try again later.' });
		}

		timestamps.push(now);
		next();
	};
};
