# mongo-bulk-writable
Expose mongodb BulkOp as a writable stream

## Install 

> npm install --save mongo-bulk-writable

## Usage 

Simple use case :

```js
var BulkWritable = require('mongo-bulk-writable');
var col; // get a collection object from driver
var writable = new BulkWritable( {
    collection :col,
    callback: function write(bulk, chunk, next) {
      bulk.insert(chunk);
      next();
    }
});
// pipe it
req.pipe(writable);

```
Or

```js
var BulkWritable = require('mongo-bulk-writable');
var col; // get a collection object from driver
var writable = new BulkWritable( {
  collection: col,
  ordered: true,
  callback: function write(bulk, chunk, next) {
    bulk
      .find( { status: "P" } )
      .update( { $set: { comment: chunk.comment} } );
    next();
  },
  highWaterMark: 10000
});
// pipe it
req.pipe(writable);

```
