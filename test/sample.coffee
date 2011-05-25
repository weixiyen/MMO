vows = require 'vows'
assert = require 'assert'

batch =
	'when dividing a number by zero':
		topic: ->
			return 42 / 0
		'we get infinity': (topic) ->
			assert.equal topic, Infinity
	'but when dividing zero by zero':
		topic: ->
			return 0 / 0
		'we get a value which':
			'is not a number': (topic) ->
				assert.isNaN topic
			'is nto equal to itself': (topic) ->
				assert.notEqual topic, topic

vows.describe(batch).run()