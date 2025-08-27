// Entry point for Vercel deployment
const { createServer } = require('http');
const app = require('./dist/app.js');

const server = createServer(app.default || app);

module.exports = server;