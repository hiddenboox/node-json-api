const http = require('http');
const {pathToRegexp} = require('path-to-regexp');
const {createResponse} = require('./response');
const {createRequest} = require('./request');
const packageJson = require('../package.json');

function createApiClient() {
	const handlers = [];

	const httpClient = http.createServer((request, response) => {
		response.setHeader('X-Node-Json-Api-Version', packageJson.version);

		const {url, method} = request;

		const requestHandler = handlers.find(handler => {
			const pathRegexp = pathToRegexp(handler.path);
			return pathRegexp.test(url) && handler.method === method;
		});

		if (requestHandler) {
			console.log(`Found handler for ${method} ${url}`);
			requestHandler.handler(
				createRequest(request, requestHandler.path),
				createResponse(response),
			);
		}
	});

	function hasRoute(path, method) {
		return handlers.find(
			handler => handler.path === path && handler.method == method,
		);
	}

	return {
		start(port = 8080) {
			console.log('Starting server...');
			httpClient.listen(port, () => {
				console.log(`Server started at ${port}!`);
			});
		},

		close() {
			console.log('Closing server...');
			httpClient.close(() => {
				console.log('Server closed!');
			});
		},

		route({path, method, handler}) {
			if (hasRoute(path, method)) {
				console.warn(`Handler for ${method} ${path} already registered!`);
				return;
			}

			console.log(`Adding handler for ${method} ${path}`);
			handlers.push({
				path,
				method,
				handler,
			});
		},

		get(path, handler) {
			this.route({
				path,
				method: 'GET',
				handler,
			});
		},
	};
}

module.exports = {
	createApiClient,
};
