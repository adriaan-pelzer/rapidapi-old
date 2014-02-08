rapidapi
========

A schema-less API, which lets storing &amp; retrieving your stuff get out of your way.

rapidapi (pronounced *rah-pee-dah-pee*) is a simple key/value store behind an HTTP API, that supports a CREATE/READ model (no explicit UPDATE or DELETE), and segregates duplicate key values by timestamp.

It does, however, support an EXPIRE function on each key, to delete old entries.

CREATE
------

POST http://*host*:*port*/*key* ( value in the body of the POST )

READ
----

GET http://*host*:*port*/*key*?timestamp=*specific_timestamp*&before=*before_timestamp*&after=*after_timestamp*

With any parameters, GET will return the latest key value stored

- *specific_timestamp* (optional): Retrieve a historical key value stored at the specified time
- *before_timestamp* (optional): Retrieve a list of stored key value URI's (with *specific_timestamp* specified), stored before the specified time. (Can be used in conjunction with *after_timestamp*)
- *after_timestamp* (optional): Retrieve a list of stored key value URI's (with *specific_timestamp* specified), stored after the specified time.  (Can be used in conjunction with *before_timestamp*)


EXPIRE
------

DELETE http://host:port/key?before=*before_timestamp*

- *before_timestamp* (mandatory): Delete all values stored before the specified time.
