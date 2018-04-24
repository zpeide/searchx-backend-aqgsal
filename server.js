'use strict';

// Default to development environment if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === 'production') {
    require('newrelic');
}

// Load the config
const config = require('./app/config/config');

// Load dependencies
const express      = require('express');
const bodyParser   = require('body-parser');
const app          = express();
const http         = require('http').Server(app);
const router       = express.Router();
const io           = require('socket.io').listen(http);

// Run initializers
require('./app/config/initializers/mongoose')(config.db);
require('./app/api/routes/v1/rest')(router);
require('./app/api/routes/v1/socket')(io);

// Setup server
app.set('port', (process.env.PORT || config.port));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
});
app.use('/v1', router);
app.get('/', function(req, res) {
    res.status(418).json({
        error: false,
        message: 'The API is up and running.'
    });
});

// Start the server
console.log('Starting Server');
http.listen(app.get('port'), function() {
    console.log('SearchX API is running on port', app.get('port'));
});
