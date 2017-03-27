'use strict';
const Writable = require('flushwritable');

class MongoBulkWriteStream extends Writable {
    constructor(opts) {
        if (!opts || !opts.collection || !opts.callback) {
            throw new Error('collection and callback are mandatory options');
        }
        super({
            objectMode: true,
            highWaterMark: (
                opts.highWaterMark === undefined ?
                    1000 :
                    Number(opts.highWaterMark)
            )
        });
        this._cb = opts.callback;
        this._isEmpty = true;
        this._bulk = opts.ordered ?
            opts.collection.initializeOrderedBulkOp() :
            opts.collection.initializeUnorderedBulkOp();
    }

    _write(chunk, enc, next) {
        this._isEmpty = false;
        this._cb(this._bulk, chunk, next);
    }

    _flush(next) {
        if (!this._isEmpty) {
            try {
                return this._bulk.execute(next);
            } catch (e) {
                this.emit('error', e);
            }
        } else {
            next();
        }
    }
}

module.exports = MongoBulkWriteStream;