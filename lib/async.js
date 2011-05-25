/*
Async.js is a collection of simple async patterns
built to combat callback hell
*/
/*
ASYNC SEQUENCE
Allows a user to define a sequence of async functions.
EXAMPLE:
  async = require 'async'
  seq = async.seq
  seq.next ->
    seq.val1 = 'a'
    seq.next()
  seq.next ->
    seq.val2 = 'b'
    seq.next()
  seq.last ->
    console.log( seq.val1 + seq.valb + ' should be ab' )
*/var Loop, Sequence;
Sequence = (function() {
  function Sequence() {
    this.fn_queue = [];
  }
  Sequence.prototype.step = function(fn) {
    return this.fn_queue.push(fn);
  };
  Sequence.prototype.next = function() {
    if (this.fn_queue.length > 0) {
      return this.fn_queue.shift()();
    }
  };
  Sequence.prototype.last = function(fn) {
    this.step(fn);
    return this.next();
  };
  return Sequence;
})();
exports.seq = new Sequence;
/*
ASYNC LOOP
takes a function queue, data object, and final callback
loops through function queue using .next()
to move on to the next function in sequential order
uses 1 isntance of AsyncLoop
OPTIONAL - data, default is {}
*/
Loop = (function() {
  function Loop(fn_queue, data, last) {
    var k, v, _ref, _ref2;
    this.fn_queue = fn_queue;
    this.data = data;
    this.last = last != null ? last : {};
    if (typeof this.data === 'function') {
      _ref = [this.data, this.last], this.last = _ref[0], this.data = _ref[1];
    }
    _ref2 = this.data;
    for (k in _ref2) {
      v = _ref2[k];
      if (this[k] !== 'next') {
        this[k] = v;
      }
    }
    this.next();
  }
  Loop.prototype.next = function() {
    if (this.fn_queue.length === 0) {
      this.end();
      return;
    }
    return this.fn_queue.shift()(this);
  };
  Loop.prototype.end = function() {
    return this.last(this);
  };
  return Loop;
})();
exports.loop = function(fn_queue, data, last) {
  return new Loop(fn_queue.slice(), data, last);
};