/*jslint node: true, nomen: true, plusplus: true, vars: true, eqeq: true*/
'use strict';

var Writable = require('flushwritable'),
    util = require('util');

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
    this.isEmpty = true;
    this.withbulk = withbulk.bind(this);
}
util.inherits(BulkWriteStream, Writable);

BulkWriteStream.prototype._write = function (chunk, enc, next) {
    this.isEmpty = false;
    this.withbulk(chunk, next);
};

BulkWriteStream.prototype._flush = function (next) {
    if (!this.isEmpty) {
        try {
            return this.bulk.execute(next);
        } catch (e) {
            this.emit('error', e);
        }
    } else {
        next();
    }
};

module.exports = function (bulk, opts, withbulk) {
    return new BulkWriteStream(bulk, opts, withbulk);
};
