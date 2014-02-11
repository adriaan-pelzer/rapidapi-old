rapidapi
========

Store your stuff, rapidly ... rapidapidly.
---------------------------------------

A schema-less API, which lets storing &amp; retrieving your stuff get out of your way.

rapidapi (pronounced *rah-pee-dah-pee*) is a simple key/value store behind an HTTP API, that supports a CREATE/READ model (no explicit UPDATE or DELETE). Every value you store is stored against the key, and a timestamp. Nothing is deleted or overwritten, so all your stuff is available ... forever.

It does, however, support an EXPIRE function on each key, to delete old entries.

###INSTALL

- Install redis. Head to the [redis download page](http://redis.io/download), and download and install the latest stable version.

- Install node.js. Head to the [node.js download page](http://nodejs.org/download/), and download and install the latest stable version.

- Install all rapidapi's dependencies, like so:

```
    cd wherever/you/installed/rapidapi
    npm install
```

- Start rapidapi, like so:

```
    ./rapidapi.js -h <hostname> -p <port> -H <redis hostname> -P <redis port>
```

Just like that, you're ready to store your stuff!

###CREATE

POST http://**host**:**port**/**key** ( raw **value** in the body of the POST )

####OR

POST http://**host**:**port**/**key**?value=**value** ( value as a query parameter - *this isn't very cool, I know, but it works, and improves the usability a lot for simple values - ap* )

    {
        success: true
    }

###SEARCH

Get a list of stored keys, against a wildcard match string.

GET http://**host**:**port**/search?keys=**keys_pattern**

    {
        "success": true,
        "data": {
            "keys": [
                "firstMatchingKey",
                "secondMatchingKey",
                "anotherMatchingKey"
            ]
        }
    }

####Parameters

- **keys_pattern**: Search will return a list of stored keys matching this pattern. Supported glob-style patterns are:
-- h?llo matches hello, hallo and hxllo
-- h*llo matches hllo and heeeello
-- h[ae]llo matches hello and hallo, but not hillo
-- use \ to escape special characters if you wnat to match them verbatim

###COUNT

Count the amount of values that have been stored gainst a specified key.

GET http://**host**:**port**/**key**/count

    {
        "success": true,
        "data": {
            "count": 4
        }
    }

###READ

Get the latest stored value against a given key:

GET http://**host**:**port**/**key**

    {
        success: true,
        data: {
            something: "I've saved earlier",
            and: "maybe a little bit more"
        },
        timestamp: 1391905486948
    }

Get the stored value against a given key, stored at a given time:

GET http://**host**:**port**/**key**?timestamp=**specific_timestamp**

    {
        success: true,
        data: {
            something: "I've saved even earlier",
            and: "maybe something else too"
        },
        timestamp: 1391905486535
    }

Get a list of values stored in a given time range:

GET http://**host**:**port**/**key**&before=**before_timestamp**&after=**after_timestamp**

    {
        success: true,
        data: [
            {
                data: 'lastValue',
                timestamp: 1391905486948
            },
            {
                data: 'secondLastValue',
                timestamp: 1391905486535
            },
            {
                data: 'thirdLastValue',
                timestamp: 1391905486381
            },
            {
                data: 'fourthLastValue',
                timestamp: 1391905485723
            },
            {
                data: 'fifthLastValue',
                timestamp: 1391878985495
            }
        ]
    }
        
Get a paginated list of values stored in a given time range, with a specified number of URI's per page:

GET http://**host**:**port**/**key**&before=**before_timestamp**&after=**after_timestamp**&count=**count**

    {
        success: true,
        data: [
            {
                data: 'thirdLastValue',
                timestamp: 1391905486381
            },
            {
                data: 'fourthLastValue',
                timestamp: 1391905485723
            }
        ],
        prev: "/myData?timestamp_before=1391905485723&count=2",
        next: "/myData?timestamp_after=1391905486381&count=2"
    }
        
####Parameters

- *specific_timestamp* (optional): Retrieve a historical key value stored at the specified time
- *before_timestamp* (optional): Retrieve a list of stored key value URI's (with *specific_timestamp* specified), stored before the specified time. (Can be used in conjunction with *after_timestamp*). *The values plus_inf and minus_inf could be used, and means **latest time ever** and **earliest time ever** respectively*
- *after_timestamp* (optional): Retrieve a list of stored key value URI's (with *specific_timestamp* specified), stored after the specified time.  (Can be used in conjunction with *before_timestamp*). *The values plus_inf and minus_inf could be used, and means **latest time ever** and **earliest time ever** respectively*
- *count* (optional): Specify how many results to return. This parameter works with all the other parameters. Pagination is achieved by specifying *count*, and using the last, or first url timestamp (depending on your direction of travel) as the *before_timestamp* or *after_timestamp* of the next query, with the same *count* parameter.


###EXPIRE

DELETE http://host:port/key?before=**before_timestamp**

    {
        success: true,
        data: {
            removed: 2
        }
    }

####Parameters

- *before_timestamp* (mandatory): Delete all values stored before the specified time. *The values plus_inf can be used, and means **latest time ever** (ie it deletes everything)
