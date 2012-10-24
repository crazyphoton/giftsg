if (Meteor.isServer) {
	var http = __meteor_bootstrap__.require("http")
		Meteor.methods({
			addVote: function (userId, gift){
					 var giftname = gift.name;
					 Meteor.users.update({_id: userId, 'profile.gifts.name' : giftname}, {$inc : {'profile.gifts.$.votes' : 1}});
					 return true;
			},
			addGift: function(userId, gift){
				Meteor.users.update({_id: userId}, {$push : {'profile.gifts' : gift}});
			},
			addFriend: function(id, friendId){
				Meteor.users.update({_id: id}, {$push : {"profile.friends": friendId}}, {upsert: true});
			},
			/* returns nothing. just update friends list. */
			updateFriendsList: function(userId, friendsList){
				if(user.profile.friends){
					var friends = Meteor.users.find({'services.facebook.uid' : {$in: 'user.profile.friends'}}, {fields:['service.facebook.uid']});
				}else{
					var friends = [];
				}
				var new_friends = _.difference(friendsList, friends);
				var currdate = new Date();
				_.each(new_friends, function(f){
					var new_friend = Meteor.users.findOne({'services.facebook.id': f.uid});
					
					if(!new_friend){
						//user doesnt exist either 
						//add friend as new user with birthday details
						var b = f.birthday_date.split("/");
						var birthday = new Date(currdate.getFullYear(),b[0] - 1, b[1] );
						
						if(birthday.valueOf() < currdate.valueOf()){
							birthday.setFullYear(birthday.getFullYear() + 1);
						}
						
						f.birthday_upcoming =  birthday;
						f.birthday_original = f.birthday_date;
						f.birthday_value = birthday.valueOf();
						var new_friend = {'profile': f};
						new_friend = Accounts.updateOrCreateUserFromExternalService('facebook', {id: f.uid}, {profile: f});
					}
					Meteor.call('addFriend', userId, new_friend._id);//add to friendslist. 
				});
			},
			getFriendsOfUser : function(userId){
				var friends = Meteor.users.find({'services.facebook.id' : {$in: user.profile.friends}});
				return friends;
			},
			getAccessToken : function() {
				try {
					 return Meteor.user().services.facebook.accessToken;
				 } catch(e) {
					 return null;
				 }
			}
		});
	Meteor.startup(function () {
		Meteor.publish("friends", function(){
			var friends = [];
			try{
				friends = Meteor.users.findOne({_id: this.userId}).profile.friends || [];
			}catch(e){
				friends = [];
			}
			//making sure we return a collection, so it is easier to process. If there are no friends, collection is empty.
			return Meteor.users.find({'_id' : {$in: friends}}, {sort: {'profile.birthday_upcoming' : 1, 'profile.name': 1}});
		});
	});
}
