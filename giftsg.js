if (Meteor.isClient) {
	//Meteor.subscribe('friends');
	FB = null;
	var Friends = new Meteor.Collection("friends");
	Template.friends.isLoadingFB = false;
	Handlebars.registerHelper("formatBirthday", function(d){
//		if(d && d.toDateString){	
//			return d.toDateString() ;
//		}else{
			return '';
//		}
	});
	Template.friends.friends = function(){
		if(FB && !Template.friends.isLoadingFB){
			FB.getLoginStatus(function(response){
				if(response.status === 'connected'){
					var accessToken = response.authResponse.accessToken;			
					FB.api('/me/permissions', function (response){
						var currdate = new Date();
						$.getJSON("https://graph.facebook.com/fql?q=select uid, name, birthday_date from user where uid in (select uid2 from friend where uid1=me()) and birthday <> '' order by birthday_date &access_token="+accessToken+"&callback=?", function(response){
							Template.friends.isLoadingFB= true;
							if(response.data && response.data.length > Friends.find().count()){
								$.each(response.data, function(index, f){
									var birthday = f.birthday_date.split("/");
									birthday = new Date(currdate.getFullYear(),birthday[0] - 1, birthday[1] );
									if(birthday.valueOf() < currdate.valueOf()){
										birthday.setFullYear(birthday.getFullYear() + 1);
									}
									f.birthday_upcoming =  birthday;
									f.birthday_original = f.birthday_date;
								        f.birthday_value = birthday.valueOf();
									f.gifts = [{id: 1, name: "Kindle fire hd", price:"399", imglink: "http://g-ecx.images-amazon.com/images/G/01/kindle/dp/2012/KT/KT-slate-01-lg._V389394535_.jpg", votes : 5, amount_raised: "200"}, {id: 2, name:"Watch", imglink: "", votes:10, price: 50, amount_raised:0}]
									Friends.insert(f);
								});
		Session.set('friend', Friends.findOne({}, {"sort": {birthday_value : 1, name: 1}}));
							}

							Template.friends.isLoadingFB = false;
						});

					});
				}
			});
		}
		//riends = _.sortBy(fr, function(f){ return f.birthday_upcoming.valueOf(); });	
	//	return Friends.find({sort: {birthday_upcoming : 1, name:1}});
		return Friends.find({}, {"sort": {birthday_value : 1, name: 1}});
	};
        Template.friends.events = {
		'click .friend-wrapper':function(ev){
			var friend = this;
			Session.set('friend' , friend);
		}	
	};
	Template.gifts.friend = function(){
		return Session.get('friend');
	}
	Template.fbconnect.init = function () {
		window.fbAsyncInit = function() {
			FB.init({
				appId      : '273440882676240',
				status     : true, // check login status
				cookie     : true, // enable cookies to allow the server to access the session
				xfbml      : true,  // parse XFBML
				oauth	   : true,
				scope      : 'friends_birthday'
			});

			FB.Event.subscribe('auth.statusChange', function(response) {
				if (response.authResponse) {
					Template.friends._friends = Template.friends.friends();
				}
			});
			Template.fbconnect.connect();
		};
		(function(d){
			var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
			js = d.createElement('script'); js.id = id; js.async = true;
			js.src = "//connect.facebook.net/en_US/all.js";
			d.getElementsByTagName('head')[0].appendChild(js);
		}(document));
	};
	Template.fbconnect.connect = function(){
		FB.getLoginStatus(function(response){
			if(response.status === 'connected'){
				$('#auth-loggedin').show(); 
				$('#auth-loggedout').hide(); 
				$('#accesstoken').append(response.authResponse.accessToken);
			} else {
				var permsNeeded = ['friends_birthday'];
				FB.login(function(response) {
					console.log(response);
				}, {scope: permsNeeded.join(',')});
			}
		});
	};

}

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
