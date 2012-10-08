if (Meteor.isServer) {
	var http = __meteor_bootstrap__.require("http")
		Meteor.methods({
			addVote: function (uid, gift){
					 var giftname = gift.name;
					 Users.update({uid: uid, 'gifts.name' : giftname}, {$inc : {'gifts.$.votes' : 1}});
					 return true;
				 },
			addFriend: function(uid, fid){
				   	FriendsList.update({uid: uid}, {$push : {friends: fid}}, {upsert: true});
				   }
		});
	Meteor.startup(function () {
		Meteor.publish('friendsList', function(uid){
			var myFriendsList = FriendsList.findOne({uid: uid});
			if(!myFriendsList){
				var myFriendsList = {uid: uid, friends: []}; //empty friendlist
				FriendsList.insert(myFriendsList);
			}
			return FriendsList.find({uid: uid});
		});
		Meteor.publish('users', function(){
			return Users.find({});
		});
		//			Meteor.publish("friends");
	});
}
