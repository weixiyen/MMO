var assert, batch, vows;
vows = require('vows');
assert = require('assert');
batch = {
  'when dividing a number by zero': {
    topic: function() {
      return 42 / 0;
    },
    'we get infinity': function(topic) {
      return assert.equal(topic, Infinity);
    }
  },
  'but when dividing zero by zero': {
    topic: function() {
      return 0 / 0;
    },
    'we get a value which': {
      'is not a number': function(topic) {
        return assert.isNaN(topic);
      },
      'is nto equal to itself': function(topic) {
        return assert.notEqual(topic, topic);
      }
    }
  }
};
vows.describe(batch).run();