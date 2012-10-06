// This experiment is to check how RPC calls work in Meteor. RPC are
// function calls directly made by the client to the server.
// Meteor provides a nice way to:
//  (1) define a symmetric RPC API both on the server and the client
//  (2) client implementations are optional and can be used to "fake"
//      a server response while the round-trip is still happening.

// Key thing I learnt here is that unlike Ember where a template could
// be bound to just an object attribute, in Meteor, you'd have to involve
// the Collection API to update the UI responsively. Although, on retrospect,
// both are "in-memory", just feels a bit weird. Might take some time for me
// to get used to at least

Cache = new Meteor.Collection("cache");

if (Meteor.isServer) {
	Meteor.startup(function() {
		a = 0;
		// Define the RPC API
		Meteor.methods({
			updateVar: function(by) {
				console.log('Updating variable a, a = ' + a + '..');
				a += by;
			},
			getVar: function(name) {
				return a;
			}
		});
		
		// Every second, update the value of the variable..
		SECOND = 1000;
		Meteor.setInterval(function() {
			// Why would anyone want to make a RPC call from the server?
			Meteor.call('updateVar', SECOND);
		}, 1000);
		
	});
}

if (Meteor.isClient) {
	Template.container.dynamicVal = function() {
		prefix = 'Dynamic value from the data store (';
		suffix = ')';
		var item = Cache.findOne({ key: 'collectionName' })
		return prefix + (item ? item.value : '') + suffix;
	}
	Template.container.staticValFromMethod = function() { 
		return 'Static value from a method';
	}
	Template.container.staticValFromAttr = 'Static value from an attribute';
	
	Meteor.startup(function() {
		Meteor.methods({
			getVar: function(name) {
				console.log('Loading response from the server..');
			}
		});
		Meteor.setInterval(function() {
			console.log('Making a remote procedural call..');
			Meteor.call('getVar', 'collectionName', function(e, a) {
				console.log('Received a response from the remote procedural call..');
			  // Remove previous item with the same key
			  Cache.remove({ key: 'collectionName' });
			  // Add new item
			  Cache.insert({ key: 'collectionName', value: a })
			});
		}, 1000);
	});
}