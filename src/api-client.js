const http = require('http');
const {pathToRegexp} = require('path-to-regexp');
const {createResponse} = require('./response');
const {createRequest} = require('./request');
const {createRoutesRegistry} = require('./routes-registry');
const {parseDirectoryToRoutes} = require('./parse-directory-to-routes');
const packageJson = require('../package.json');

function createApiClient() {
	const routesRegistry = createRoutesRegistry();

	const httpClient = http.createServer((request, response) => {
		response.setHeader('X-Node-Json-Api-Version', packageJson.version);

		const {url, method} = request;

		if (!url) {
			return;
		}

		const routes = routesRegistry.getAll();

		const routeKey = Object.keys(routes).find(path => {
			const pathRegexp = pathToRegexp(path);
			return pathRegexp.test(url) && routes[path][method];
		});

		if (routeKey) {
			console.log(`Found handler for ${method} ${url}`);
			routes[routeKey][method](
				createRequest(request, routeKey),
				createResponse(response),
			);
		}
	});

	const fileBasedRoutes = parseDirectoryToRoutes('api');

	fileBasedRoutes.forEach(({path, method, handler}) => {
		console.log(`Adding handler for ${method} ${path}`);
		routesRegistry.add({
			path,
			method,
			handler,
		});
	});

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
			console.log(`Adding handler for ${method} ${path}`);
			routesRegistry.add({
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
