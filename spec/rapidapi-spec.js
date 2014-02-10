var routes = require ( '../routes.js' );

describe ( 'rapidapi', function () {
    describe ( 'POST', function () {
        var redisStub, resStub;

        beforeEach ( function () {
            redisStub = {
                zadd: jasmine.createSpy ( 'zadd' ).andCallFake ( function ( args, callBack ) {
                    callBack ( null, 1 );
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
            expect ( resStub.send ).toHaveBeenCalledWith ( { success: true } );
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
            expect ( resStub.send ).toHaveBeenCalledWith ( { success: true } );
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
            routes.route ( 'delete', 'testKey', { timestamp_before: 1391985295921 }, '', resStub );

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

        it ( 'should fail when no timestamp_before value is specified', function () {
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
            expect ( resStub.send ).toHaveBeenCalledWith ( { success : false, error : 'HTTP DELETE has to be accompanied by the "timestamp_before" query parameter' } );
            expect ( resStub.end ).toHaveBeenCalled ();
        } );
    } );
} );
