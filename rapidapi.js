#!/usr/bin/env node

var spawn = require('child_process').spawn, redisServer = spawn ( 'redis-server' );
var express = require ( 'express' );
var app = express ();
var routes = require ( __dirname + '/routes.js' );
var argv = require ( 'optimist' )
    .usage ( 'Start rapidapi. \nUsage: $0' )
    .options ( 'p', {
        alias: 'port',
        default: 80
    } )
    .options ( 'h', {
        alias: 'host',
        default: '0.0.0.0'
    } )
    .options ( 'P', {
        alias: 'redis_port',
        default: 6379 
    } )
    .options ( 'H', {
        alias: 'redis_host',
        default: 'localhost'
    } )
    .describe ( 'p', 'rapidapi port' )
    .describe ( 'h', 'rapidapi host' )
    .describe ( 'P', 'redis server port' )
    .describe ( 'H', 'redis server host' )
    .argv;

routes.init ( argv );

app.all ( '/:key', function ( req, res ) {
    var query = req.query;
    var key = req.params.key;
    var method = req.route.method;
    var body = '';

    req.on ( 'data', function ( data ) {
        body += data;
    } );

    req.on ( 'end', function () {
        routes.route ( method, key, query, body, res );
    } );
} );

app.listen ( argv.port, argv.host );
