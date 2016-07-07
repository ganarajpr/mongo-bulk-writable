# mongo-bulk-writable
expose mongodb BulkOp as a writable stream

## Install 

> npm install --save mongo-bulk-writable

## Usage 

Simple use case :

```js
var BulkWritable = require('mongo-bulk-writable');
var col; // get a collection object from driver
var writable = new BulkWritable(col.initializeOrderedBulkOp(), function write(chunk, next) {
  this.bulk.insert(chunk);
  next();
});

```
Or

```js
var BulkWritable = require('mongo-bulk-writable');
var col; // get a collection object from driver
var writable = new BulkWritable(col.initializeOrderedBulkOp(), function write(chunk, next) {
  this.bulk.find( { status: "P" } ).update( { $set: { comment: chunk.comment} } );
  next();
});

```

