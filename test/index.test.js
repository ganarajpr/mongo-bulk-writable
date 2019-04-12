/* jslint node: true, nomen: true, plusplus: true, vars: true, eqeq: true */
'use strict';

const MongoClient = require('mongodb').MongoClient;
const es = require('event-stream');
const MongoBulkWriteStream = require('../lib/index');
const arr = require('./sample.js');
const expect = require('chai').expect;

// Connection URL
const url = 'mongodb://localhost:27017/ecommerce';

let db, col;
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
    const reader = es.readArray(arr);
    const writable = new MongoBulkWriteStream({
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
    const writable = new MongoBulkWriteStream({
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
    const reader = es.readArray([]);
    const writable = new MongoBulkWriteStream({
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
