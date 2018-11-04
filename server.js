const http = require('http');
const bodyParser = require('body-parser');
const port = process.env.port || 3001;

const app = require('./app')

const server = http.createServer(app);

server.listen(port);