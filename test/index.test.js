/* jslint node: true, nomen: true, plusplus: true, vars: true, eqeq: true */
'use strict';

var MongoClient = require('mongodb').MongoClient;
var es = require('event-stream');
var MongoBulkWriteStream = require('../lib/index');
var arr = require('./sample.js');
var expect = require('chai').expect;

// Connection URL
var url = 'mongodb://localhost:27017/ecommerce';

var db, col;
describe('Simple Case', () => {
  beforeEach((done) => {
    MongoClient.connect(url)
      .then((mongo) => {
        db = mongo;
        col = db.collection('test');
      })
      .then(() => {
        col.remove({});
      })
      .catch((err) => {
        console.log(err);
      })
      .then(() => {
        done();
      });
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
  });
  it('should insert 21 records with pipe', (done) => {
    var reader = es.readArray(arr);
    var writable = new MongoBulkWriteStream({
      callback: function write (bulk, chunk, next) {
        bulk.insert(chunk);
        next();
      },
      collection: col,
      highWaterMark: 21
    });
    writable.on('finish', function () {
      col.find({}).toArray(
        function (err, res) {
          expect(err).to.eql(null);
          expect(res).to.have.lengthOf(21);
          done();
        }
      );
    });
    writable.on('error', function (err) {
      console.log(err);
      done(err);
    });
    reader.pipe(writable);
  });

  it('should insert 21 records with write', (done) => {
    var writable = new MongoBulkWriteStream({
      callback: function write (bulk, chunk, next) {
        bulk.insert(chunk);
        next();
      },
      collection: col,
      highWaterMark: 21
    });
    writable.on('error', function (err) {
      done(err);
    });
    arr.forEach(function (el) {
      writable.write(el);
    });

    writable.end(function () {
      col.find({}).toArray(
        function (err, res) {
          expect(err).to.eql(null);
          expect(res).to.have.lengthOf(21);
          done();
        }
      );
    });
  });

  it('should insert empty records without issue', (done) => {
    var reader = es.readArray([]);
    var writable = new MongoBulkWriteStream({
      callback: function write (bulk, chunk, next) {
        bulk.insert(chunk);
        next();
      },
      collection: col
    });
    writable.on('finish', function () {
      done();
    });
    writable.on('error', function (err) {
      done(err);
    });
    reader.pipe(writable);
  });
});
