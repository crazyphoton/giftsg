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
		Meteor.publish('users', function(){
			return Users.find({});
		});
		Meteor.publish('friendsList', function(uid){
			if(!uid){
		       // There ought to be a || !Users.findOne({uid:uid})) to check if uid is valid, but for some reason, it seems to stop any friends from populating. There should technically be no issues because a friend is added only AFTER a user is created, but we need to understand this curious behaviour better
		       // also, this should probably throw an exception. If this returns an empty friendlist it would be impossible to differentiate a user with no friends and a non-existent user, so we return an empty collection
				return FriendsList.find({uid: 0});// empty collection
			}
			var myFriendsList = FriendsList.findOne({uid: uid});
			if(!myFriendsList){
				var myFriendsList = {uid: uid, friends: []}; //empty friendlist
				FriendsList.insert(myFriendsList);
			}
			return FriendsList.find({uid: uid});
		});
	});
}
