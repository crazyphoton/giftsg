if (Meteor.isServer) {
	var http = __meteor_bootstrap__.require("http")
		Meteor.methods({
			addVote: function (uid, gift){
					 var giftname = gift.name;
					 Friends.update({uid: uid, 'gifts.name' : giftname}, {$inc : {'gifts.$.votes' : 1}});
					 return true;
				 }
		});
	Meteor.startup(function () {
		//			Meteor.publish("friends");
	});
}
