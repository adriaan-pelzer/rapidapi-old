var _ = require ( 'underscore' );
var Redis = require ( 'redis' );
var redis;
var globalConf;

var debug = false;

var log = function ( message ) {
    if ( debug ) {
        console.log ( message );
    }
};

var init = function ( config ) {
    redis = Redis.createClient ( config.redis_port, config.redis_host );
    globalConf = config;
};

var setRedis = function ( newRedis ) {
    redis = newRedis;
};

var sendJsonHeaders = function ( res ) {
    res.set ( {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'cache-control': 'max-age=0, no-cache, no-store, must-revalidate',
        'expires': 0,
        'pragma': 'no-cache'
    } );
};

var sendResponse = function ( res, status, error, response, prev, next, timestamp ) {
    var resp;

    sendJsonHeaders ( res );

    if ( error ) {
        res.status ( status ).send ( { success: false, error: error } ).end ();
    } else if ( _.isUndefined ( response ) ) {
        resp = { success: ( status === 200 ) ? true : false };

        res.status ( 200 ).send ( resp ).end ();
    } else {
        resp = { success: true, data: response };

        if ( ! _.isUndefined ( prev ) ) {
            resp.prev = prev;
        }

        if ( ! _.isUndefined ( next ) ) {
            resp.next = next;
        }

        if ( ! _.isUndefined ( timestamp ) ) {
            resp.timestamp = timestamp;
        }

        res.status ( 200 ).send ( resp ).end ();
    }
};

var redisRevRangeByScore = function ( args, callBack ) {
    redis.zrevrangebyscore ( args, function ( error, result ) {
        if ( error ) {
            sendResponse ( res, 500, error );
        } else {
            callBack ( result );
        }
    } );
};

var getLatestValue = function ( key, res ) {
    redisRevRangeByScore ( [ key, '+inf', '-inf', 'WITHSCORES', 'LIMIT', 0, 1 ], function ( result ) {
        sendResponse ( res, 200, null, ( result.length > 0 ) ? result[0] : {}, undefined, undefined, ( result.length > 1 ) ? result[1] : undefined );
    } );
};

var getSingleValue = function ( key, timestamp, res ) {
    redisRevRangeByScore ( [ key, timestamp, timestamp, 'WITHSCORES', 'LIMIT', 0, 1 ], function ( result ) {
        sendResponse ( res, 200, null, ( result.length > 0 ) ? result[0] : {}, undefined, undefined, ( result.length > 1 ) ? result[1] : undefined );
    } );
};

var getMultiValue = function ( key, timestamp_before, timestamp_after, res ) {
    redisRevRangeByScore ( [ key, timestamp_before, timestamp_after, 'WITHSCORES' ], function ( result ) {
        var i, returnResult = [];

        for ( i = 0; i < result.length; i += 2 ) {
            returnResult.push ( { data: result[i], timestamp: result[i+1] } );
        }

        sendResponse ( res, 200, null, returnResult );
    } );
};

var getPaginatedMultiValue = function ( key, timestamp_before, timestamp_after, count, res ) {
    redisRevRangeByScore ( [ key, timestamp_before, timestamp_after, 'WITHSCORES', 'LIMIT', 0, count ], function ( result ) {
        var i, returnResult = [], next, prev;

        for ( i = 0; i < result.length; i += 2 ) {
            returnResult.push ( { data: result[i], timestamp: result[i+1] } );
        }

        prev = '/' + key + '?before=' + result[i-1] + '&count=' + count;
        next = '/  ' + key + '?after=' + result[1] + '&count=' + count;

        sendResponse ( res, 200, null, returnResult, prev, next );
    } );
};

var handleGet = function ( key, query, res ) {
    var before = '+inf';
    var after = '-inf';

    log ( 'GET ' + key + ' ' + JSON.stringify ( query ) );

    if ( ! _.isUndefined ( query.timestamp ) ) {
        getSingleValue ( key, query.timestamp, res );
        return;
    }

    if ( ! _.isUndefined ( query.before ) || ! _.isUndefined ( query.after ) ) {
        if ( ! _.isUndefined ( query.before ) ) {
            before = '(' + query.before;
        }

        if ( ! _.isUndefined ( query.after ) ) {
            after = '(' + query.after;
        }

        if ( _.isUndefined ( query.count ) ) {
            getMultiValue ( key, before, after, res );
            return;
        } else {
            getPaginatedMultiValue ( key, before, after, query.count, res );
            return;
        }
    }

    getLatestValue ( key, res );
};

var handlePost = function ( key, query, body, res ) {
    var redisArgs = [];
    var value = _.isUndefined ( query.value ) ? body : query.value;

    var saveValue = function ( key, value, res ) {
        var redisArgs = [ key, new Date ().getTime (), value ];

        log ( 'ZADD' );
        log ( redisArgs );

        redis.zadd ( redisArgs, function ( error, response ) {
            if ( error ) {
                sendResponse ( res, 500, error );
            } else {
                sendResponse ( res, 200, null, { added: response } );
            }
        } );
    };

    log ( 'POST ' + key + ' ' + JSON.stringify ( query ) );

    if ( _.isUndefined ( value ) || _.isEmpty ( value ) ) {
        sendResponse ( res, 400, 'HTTP POST has to be accompanied by the "value" query parameter, or a body' );
    } else {
        saveValue ( key, value, res );
    }
};

var handleDel = function ( key, query, res ) {
    var redisArgs = [];

    log ( 'DELETE ' + key + ' ' + JSON.stringify ( query ) );

    if ( _.isUndefined ( query.before ) ) {
        sendResponse ( res, 400, 'HTTP DELETE has to be accompanied by the "before" query parameter' );
    } else {
        redisArgs = [ key, '-inf', '(' + query.before ];

        log ( 'ZREMRANGEBYSCORE' );
        log ( redisArgs );

        redis.zremrangebyscore ( redisArgs, function ( error, response ) {
            if ( error ) {
                sendResponse ( res, 500, error );
            } else {
                sendResponse ( res, 200, null, { removed: response } );
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
            sendResponse ( res, 405, 'HTTP method "' + method + '" not supported' );
    }
};

exports.init = init;
exports.route = route;
exports.setRedis = setRedis;
