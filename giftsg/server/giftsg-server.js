if (Meteor.isServer) {
	var http = __meteor_bootstrap__.require("http")
	var Friends = new Meteor.Collection("friends");
	Meteor.startup(function () {
		Friends.remove({});	
		if(Friends.find().count() === 0){
//			Friends.insert({"name": "Nish", "birthday_date": "12/11/1212"});
//			Friends.insert({"name": "Wish", "birthday_date": "13/11/1251"});
		}
		//			Meteor.publish("friends");
	});
}