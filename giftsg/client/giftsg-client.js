if (Meteor.isClient) {
	Meteor.startup(function(){
		Meteor.autosubscribe(function(){
			Meteor.subscribe('users');
			Meteor.subscribe('friendsList', Session.get('loggedInUser'));
		});
	});
	FB = null;
	Template.friends.isLoadingFB = false;
	Handlebars.registerHelper("formatBirthday", function(d){
		if(d && d.toDateString){	
			return d.toDateString() ;
		}else{
			return '';
		}
	});

	Template.friends.friends = function(){
		if(FB && Users && !Template.friends.isLoadingFB){
			FB.getLoginStatus(function(response){
				if(response.status === 'connected'){
					var accessToken = response.authResponse.accessToken;			
					FB.api('/me/permissions', function (response){
						var currdate = new Date();
						$.getJSON("https://graph.facebook.com/fql?q=select uid, name, birthday_date from user where uid in (select uid2 from friend where uid1=me()) and birthday <> '' order by birthday_date &access_token="+accessToken+"&callback=?", function(response){
							Template.friends.isLoadingFB= true;
							if(response.data){
								console.log(FriendsList.findOne().friends);
								$.each(response.data, function(index, f){

									if($.inArray(f.uid, FriendsList.findOne().friends) === -1){//nope, not in our friendlist
										if(!Users.findOne({uid: f.uid})){//user doesnt exist either 
											//add friend as new user with birthday details
											var b = f.birthday_date.split("/");
											var birthday = new Date(currdate.getFullYear(),b[0] - 1, b[1] );
											if(birthday.valueOf() < currdate.valueOf()){
												birthday.setFullYear(birthday.getFullYear() + 1);
											}
											f.birthday_upcoming =  birthday;
											f.birthday_original = f.birthday_date;
											f.birthday_value = birthday.valueOf();
											//f.gifts = [{id: 1, name: "Kindle fire hd", price:"399", imglink: "http://g-ecx.images-amazon.com/images/G/01/kindle/dp/2012/KT/KT-slate-01-lg._V389394535_.jpg", votes : 5, amount_raised: "200"}, {id: 2, name:"Watch", imglink: "", votes:10, price: 50, amount_raised:0}]
											Users.insert(f);
										}

										Meteor.call('addFriend', Session.get('loggedInUser'), f.uid);//add to friendslist. FriendList should also update now because it depends on FriendsList
									}
								});
								//init gifts section with closest birthday.
								if(!Session.get('selected_friend')){
									var f = Users.findOne({}, {"sort": {birthday_value : 1, name: 1}});
									Session.set('selected_friend', f.uid);
								}
							}

							Template.friends.isLoadingFB = false;
						});

					});
				}
			});
		}

		if(FriendsList.findOne()){
			return Users.find({uid : { $in : FriendsList.findOne().friends}}, {"sort": {birthday_value : 1, name: 1}});
		}
		return null;
	};
	Template.friends.events = {
		'click .friend-wrapper':function(ev){
			var friend = this;
			//console.log(friend.uid);
			Session.set('selected_friend' , friend.uid);
		}	
	};

	Template.gifts.friend = function(){
		//console.log(Session.get('selected_friend'));
		return Users.findOne({uid: Session.get('selected_friend')});
	}

	Template.gifts.events = {
		'click .add-vote' : function(ev){
			var giftname = this.name;
			Meteor.call('addVote', Session.get('selected_friend'), this);
		}
	}

	Template.new_gift.events = {
		'submit form#gift-details' : function(ev){
			ev.preventDefault();
			var $form = $(ev.target);

			var gift = {name: $form.find('input[name=gift-name]').val(), price: $form.find('input[name=gift-price]').val(), imglink: $form.find('input[name=gift-image]').val(), votes : 0, amount_raised: 0};
			Users.update({uid: Session.get('selected_friend')}, {$push : {gifts : gift}});
		}
	};

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
					Session.set('loggedInUser', response.authResponse.userID);
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
				console.log("Access token is "+response.authResponse.accessToken);
			} else {
				var permsNeeded = ['friends_birthday'];
				FB.login(function(response) {
					console.log(response);
				}, {scope: permsNeeded.join(',')});
			}
		});
	};
}
