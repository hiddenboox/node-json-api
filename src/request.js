const {match} = require('path-to-regexp');

function createRequest(httpServerRequest, path) {
	const urlMatcher = match(path);

	return {
		params() {
			const match = urlMatcher(httpServerRequest.url);
			return match ? match.params : {};
		},
	};
}

module.exports = {
	createRequest,
};
