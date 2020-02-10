const {createApiClient} = require('../../');

const server = createApiClient();

server.get('/', (req, res) => res.ok({ok: true}));

server.start();
