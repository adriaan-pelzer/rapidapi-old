rapidapi
========

Store your stuff, rapidly ... rapidapidly.
---------------------------------------

A schema-less API, which lets storing &amp; retrieving your stuff get out of your way.

rapidapi (pronounced *rah-pee-dah-pee*) is a simple key/value store behind an HTTP API, that supports a CREATE/READ model (no explicit UPDATE or DELETE). Every value you store is stored against the key, and a timestamp. Nothing is deleted or overwritten, so all your stuff is available ... forever.

It does, however, support an EXPIRE function on each key, to delete old entries.

###INSTALL

First, install redis. Head to the [redis download page](http://redis.io/download), and download and install the latest stable version.

Next, start rapidapi, like so:

    ./rapidapi.js -h <hostname> -p <port> -H <redis hostname> -P <redis port>

And, just like that, you're ready to store your stuff!

###CREATE

POST http://**host**:**port**/**key** ( raw **value** in the body of the POST )

####OR

POST http://**host**:**port**/**key**?value=**value** ( value as a query parameter - *this isn't very cool, I know, but it works, and improves the usability a lot for simple values - ap* )

###READ

GET http://**host**:**port**/**key**?timestamp=**specific_timestamp**&before=**before_timestamp**&after=**after_timestamp**&count=**count**

Without any parameters, GET will return the latest key value stored

- *specific_timestamp* (optional): Retrieve a historical key value stored at the specified time
- *before_timestamp* (optional): Retrieve a list of stored key value URI's (with *specific_timestamp* specified), stored before the specified time. (Can be used in conjunction with *after_timestamp*)
- *after_timestamp* (optional): Retrieve a list of stored key value URI's (with *specific_timestamp* specified), stored after the specified time.  (Can be used in conjunction with *before_timestamp*)
- *count* (optional): Specify how many results to return. This parameter works with all the other parameters. Pagination is achieved by specifying *count*, and using the last, or first url timestamp (depending on your direction of travel) as the *before_timestamp* or *after_timestamp* of the next query, with the same *count* parameter.


###EXPIRE

DELETE http://host:port/key?before=**before_timestamp**

- *before_timestamp* (mandatory): Delete all values stored before the specified time.
