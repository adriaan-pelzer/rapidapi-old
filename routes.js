var _ = require ( 'underscore' );
var Redis = require ( 'redis' );
var redis;
var globalConf;

var debug = true;

var log = function ( message ) {
    if ( debug ) {
        console.log ( message );
    }
};

var init = function ( config ) {
    redis = Redis.createClient ( config.redis_port, config.redis_host );
    globalConf = config;
};

var handleGet = function ( key, query, res ) {
    var before = '+inf';
    var after = '-inf';
    var count = 1;
    var redisArgs = [];

    log ( 'GET ' + key + ' ' + JSON.stringify ( query ) );

    if ( ! _.isUndefined ( query.timestamp_before ) ) {
        before = '(' + query.timestamp_before;
        count = 0;
    }

    if ( ! _.isUndefined ( query.timestamp_after ) ) {
        after = '(' + query.timestamp_after;
        count = 0;
    }

    if ( ! _.isUndefined ( query.timestamp ) ) {
        before = query.timestamp;
        after = query.timestamp;
    }

    if ( ! _.isUndefined ( query.count ) ) {
        count = parseInt ( query.count, 10 );
    }

    redisArgs = [ key, before, after, 'WITHSCORES' ];

    if ( count ) {
        redisArgs.push ( 'LIMIT' );
        redisArgs.push ( 0 );
        redisArgs.push ( count );
    }

    log ( 'ZREVRANGEBYSCORE' );
    log ( redisArgs );

    redis.zrevrangebyscore ( redisArgs, function ( error, response ) {
        var i;
        var results = []

        if ( error ) {
            res.status ( 500 ).send ( error ).end ();
        } else {
            if ( response.length == 2 ) {
                results.push ( response[0] );
            } else {
                for ( i = 0; i < response.length; i += 2 ) {
                    results.push ( '/' + key + '?timestamp=' + response[i+1] );
                }
            }

            res.status ( 200 ).send ( results ).end ();
        }
    } );
};

var handlePost = function ( key, query, body, res ) {
    var redisArgs = [];
    var value = '';

    var saveValue = function ( key, value, res ) {
        var redisArgs = [ key, new Date ().getTime (), value ];

        log ( 'ZADD' );
        log ( redisArgs );

        redis.zadd ( redisArgs, function ( error, response ) {
            if ( error ) {
                res.status ( 500 ).send ( error ).end ();
            } else {
                res.status ( 200 ).send ( response ).end ();
            }
        } );
    };

    log ( 'POST ' + key + ' ' + JSON.stringify ( query ) );

    if ( _.isUndefined ( query.value ) ) {
        if ( _.isUndefined ( body ) || _.isEmpty ( body ) ) {
            res.status ( 400 ).send ( 'HTTP POST has to be accompanied by the "value" query parameter, or a body' ).end ();
        } else {
            saveValue ( key, body, res );
        }
    } else {
        saveValue ( key, query.value, res );
    }
};

var handleDel = function ( key, query, res ) {
    var redisArgs = [];

    log ( 'DELETE ' + key + ' ' + JSON.stringify ( query ) );

    if ( _.isUndefined ( query.timestamp_before ) ) {
        res.status ( 400 ).send ( 'HTTP DELETE has to be accompanied by the "timestamp_before" query parameter' ).end ();
    } else {
        redisArgs = [ key, '-inf', query.timestamp_before ];

        log ( 'ZREMRANGEBYSCORE' );
        log ( redisArgs );

        redis.zremrangebyscore ( redisArgs, function ( error, response ) {
            if ( error ) {
                res.status ( 500 ).send ( error ).end ();
            } else {
                res.status ( 200 ).send ( response ).end ();
            }
        } );
    }
};

var route = function ( method, key, query, body, res ) {
    switch ( method ) {
        case 'get':
            handleGet ( key, query, res );
            break;
        case 'post':
            handlePost ( key, query, body, res );
            break;
        case 'delete':
            handleDel ( key, query, res );
            break;
        default:
            res.status ( 405 ).send ( 'HTTP method "' + method + '" not supported' ).end ();
    }
};

exports.init = init;
exports.route = route;
