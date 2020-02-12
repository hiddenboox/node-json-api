module.exports = function(req, res) {
	res.ok({
		data: {
			id: req.params().id,
			description: 'I can into dynamic parameters!',
		},
	});
};
