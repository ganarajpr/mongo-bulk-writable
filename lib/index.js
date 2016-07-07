/*jslint node: true, nomen: true, plusplus: true, vars: true, eqeq: true*/
'use strict';

var Writable = require('stream').Writable;
var util = require('util');

function BulkWriteStream(bulk, opts, withbulk) {
    if (typeof opts == 'function') {
        withbulk = opts;
        opts = {};
    }
    Writable.call(this, {
        objectMode: true,
        highWaterMark: (opts.highWaterMark == null ? 16 : opts.highWaterMark)
    });
    this.bulk = bulk;
    this.withbulk = this.withbulk.bind(this);
    this.on('finish', function () {
        return this._doflush();
    });
}
util.inherits(BulkWriteStream, Writable);

BulkWriteStream.prototype._write = function (chunk, enc, next) {
    this.withbulk(chunk, next);
};

BulkWriteStream.prototype._doflush = function (next) {
    return this.bulk.execute(function (err) {
        return next && next(err);
    });
};

module.exports = function (bulk, opts, withbulk) {
    return new BulkWriteStream(bulk, opts, withbulk);
};
