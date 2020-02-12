const fs = require('fs');
const path = require('path');

function parseDirectoryToRoutes(directory) {
	const resultRoutes = parseDirectoryToRoutesRecursively();

	function parseDirectoryToRoutesRecursively(currentDirectory = '') {
		const routes = [];

		const filesNames = fs.readdirSync(
			path.resolve(directory, currentDirectory),
		);

		const filesFullPaths = filesNames.map(fileName =>
			path.resolve(directory, currentDirectory, fileName),
		);

		filesFullPaths.forEach((routePath, index) => {
			if (!fs.statSync(routePath).isDirectory()) {
				const routeHandler = require(routePath);

				const [parsedPath, parsedMethod] = parseFilename(filesNames[index]);

				routes.push({
					path: createPath(currentDirectory, parsedPath),
					method: parsedMethod,
					handler: routeHandler,
				});
			} else {
				const nextDirectoryToParse = routePath
					.split(path.sep)
					.slice(-1)
					.join('');

				const nestedRoutes = parseDirectoryToRoutesRecursively(
					currentDirectory
						? path.join(currentDirectory, nextDirectoryToParse)
						: nextDirectoryToParse,
				);

				routes.push(...nestedRoutes);
			}
		});

		return routes;
	}

	return resultRoutes;
}

function parseFilename(route) {
	const [parsedPath, parsedMethod] = route.split('.').map((part, index) => {
		if (index === 0) {
			if (part === 'index') {
				return '/';
			}

			return '/' + part;
		}

		return part.toUpperCase();
	});

	return [parsedPath, parsedMethod];
}

function createPath(directory, path) {
	// add base path fragment
	let result = '/api';

	// if we are in root directory currently we skip adding it to result path
	result += directory.length > 0 ? '/' + directory : '';

	// finally we add path parsed from filename
	result += path;

	result = convertDynamicParams(result);

	return ensureNoTrailingSlash(result);
}

function ensureNoTrailingSlash(path) {
	return path.split('/').length > 2 && path.endsWith('/')
		? path.slice(0, -1)
		: path;
}

function convertDynamicParams(path) {
	const result = path
		.split('')
		.map(character => {
			switch (character) {
				case '[':
					return ':';
				case ']':
					return '';
				default:
					return character;
			}
		})
		.join('');

	return result;
}

module.exports = {
	parseDirectoryToRoutes,
};
