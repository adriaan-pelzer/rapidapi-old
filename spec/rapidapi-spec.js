var routes = require ( '../routes.js' );
var _ = require ( 'underscore' );

describe ( 'rapidapi', function () {
    describe ( 'POST', function () {
        var redisStub, resStub, keysAdded;

        beforeEach ( function () {
            keysAdded = {};

            redisStub = {
                zadd: jasmine.createSpy ( 'zadd' ).andCallFake ( function ( args, callBack ) {
                    if ( _.isUndefined ( keysAdded[args[0]] ) ) {
                        keysAdded[args[0]] = [];
                    }

                    if ( ! _.contains ( keysAdded[args[0]], args[2] ) ) {
                        keysAdded[args[0]].push ( args[2] );
                        callBack ( null, 1 );
                    } else {
                        callBack ( null, 0 );
                    }
                } )
            };

            resStub = {
                set: jasmine.createSpy ( 'set' ).andCallFake ( function () {
                    return resStub;
                } ),
                status: jasmine.createSpy ( 'status' ).andCallFake ( function () {
                    return resStub;
                } ),
                send: jasmine.createSpy ( 'send' ).andCallFake ( function () {
                    return resStub;
                } ),
                end: jasmine.createSpy ( 'end' )
            };

            routes.setRedis ( redisStub );
        } );

        afterEach ( function () {
            delete redisStub;
            delete resStub;
        } );

        it ( 'should save a key value specified in the body', function () {
            routes.route ( 'post', 'testKey', {}, 'testValue', resStub );

            expect ( redisStub.zadd ).toHaveBeenCalledWith ( [ 'testKey', jasmine.any ( Number ), 'testValue' ], jasmine.any ( Function ) );
            expect ( resStub.set ).toHaveBeenCalledWith ( {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'cache-control': 'max-age=0, no-cache, no-store, must-revalidate',
                'expires': 0,
                'pragma': 'no-cache'
            } );
            expect ( resStub.status ).toHaveBeenCalledWith ( 200 );
            expect ( resStub.send ).toHaveBeenCalledWith ( { success : true, data : { added : 1 } } );
            expect ( resStub.end ).toHaveBeenCalled ();
        } );

        it ( 'should save a key value specified in the query', function () {
            routes.route ( 'post', 'testKey', { value: 'testValue' }, '', resStub );

            expect ( redisStub.zadd ).toHaveBeenCalledWith ( [ 'testKey', jasmine.any ( Number ), 'testValue' ], jasmine.any ( Function ) );
            expect ( resStub.set ).toHaveBeenCalledWith ( {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'cache-control': 'max-age=0, no-cache, no-store, must-revalidate',
                'expires': 0,
                'pragma': 'no-cache'
            } );
            expect ( resStub.status ).toHaveBeenCalledWith ( 200 );
            expect ( resStub.send ).toHaveBeenCalledWith ( { success : true, data : { added : 1 } } );
            expect ( resStub.end ).toHaveBeenCalled ();
        } );

        it ( 'should fail when no value is specified', function () {
            routes.route ( 'post', 'testKey', {}, '', resStub );

            expect ( redisStub.zadd ).not.toHaveBeenCalled ();
            expect ( resStub.set ).toHaveBeenCalledWith ( {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'cache-control': 'max-age=0, no-cache, no-store, must-revalidate',
                'expires': 0,
                'pragma': 'no-cache'
            } );
            expect ( resStub.status ).toHaveBeenCalledWith ( 400 );
            expect ( resStub.send ).toHaveBeenCalledWith ( { success : false, error : 'HTTP POST has to be accompanied by the "value" query parameter, or a body' } );
            expect ( resStub.end ).toHaveBeenCalled ();
        } );

        it ( 'should not fail when the same value is stored twice', function () {
            keysAdded = {};
            routes.route ( 'post', 'testKey', { value: 'testValue' }, '', resStub );

            expect ( resStub.status ).toHaveBeenCalledWith ( 200 );
            expect ( resStub.send ).toHaveBeenCalledWith ( { success : true, data : { added : 1 } } );
            expect ( resStub.end ).toHaveBeenCalled ();

            routes.route ( 'post', 'testKey', { value: 'testValue' }, '', resStub );

            expect ( resStub.status ).toHaveBeenCalledWith ( 200 );
            expect ( resStub.send ).toHaveBeenCalledWith ( { success : true, data : { added : 0 } } );
            expect ( resStub.end ).toHaveBeenCalled ();
        } );
    } );

    xdescribe ( 'GET', function () {
    } );

    describe ( 'DELETE', function () {
        var redisStub, resStub;

        beforeEach ( function () {
            redisStub = {
                zremrangebyscore: jasmine.createSpy ( 'zremrangebyscore' ).andCallFake ( function ( args, callBack ) {
                    callBack ( null, 2 );
                } )
            };

            resStub = {
                set: jasmine.createSpy ( 'set' ).andCallFake ( function () {
                    return resStub;
                } ),
                status: jasmine.createSpy ( 'status' ).andCallFake ( function () {
                    return resStub;
                } ),
                send: jasmine.createSpy ( 'send' ).andCallFake ( function () {
                    return resStub;
                } ),
                end: jasmine.createSpy ( 'end' )
            };

            routes.setRedis ( redisStub );
        } );

        afterEach ( function () {
            delete redisStub;
            delete resStub;
        } );

        it ( 'should delete values before the specified date', function () {
            routes.route ( 'delete', 'testKey', { before: 1391985295921 }, '', resStub );

            expect ( redisStub.zremrangebyscore ).toHaveBeenCalledWith ( [ 'testKey', '-inf', '(' + 1391985295921 ], jasmine.any ( Function ) );
            expect ( resStub.set ).toHaveBeenCalledWith ( {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'cache-control': 'max-age=0, no-cache, no-store, must-revalidate',
                'expires': 0,
                'pragma': 'no-cache'
            } );
            expect ( resStub.status ).toHaveBeenCalledWith ( 200 );
            expect ( resStub.send ).toHaveBeenCalledWith ( { success : true, data : { removed : 2 } } );
            expect ( resStub.end ).toHaveBeenCalled ();
        } );

        it ( 'should fail when no "before" value is specified', function () {
            routes.route ( 'delete', 'testKey', {}, '', resStub );

            expect ( redisStub.zremrangebyscore ).not.toHaveBeenCalled ();
            expect ( resStub.set ).toHaveBeenCalledWith ( {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'cache-control': 'max-age=0, no-cache, no-store, must-revalidate',
                'expires': 0,
                'pragma': 'no-cache'
            } );
            expect ( resStub.status ).toHaveBeenCalledWith ( 400 );
            expect ( resStub.send ).toHaveBeenCalledWith ( { success : false, error : 'HTTP DELETE has to be accompanied by the "before" query parameter' } );
            expect ( resStub.end ).toHaveBeenCalled ();
        } );
    } );
} );
