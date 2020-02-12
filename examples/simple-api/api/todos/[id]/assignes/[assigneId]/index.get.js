module.exports = function(req, res) {
	res.ok({
		data: {
			id: req.params().assigneId,
			todoId: req.params().id,
			description: 'Guess what, I can also into nested dynamic params!',
		},
	});
};
