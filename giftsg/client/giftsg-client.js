if (Meteor.isClient) {
	var accessToken;
	var FB = null;
	Meteor.startup(function(){
		Meteor.autorun(function(){
			if(Meteor.userLoaded()){ // autoload the closes birthday person
				if(!Session.get('selected_friend')){
					var f = Meteor.users.findOne();
					Session.set('selected_friend', f._id);
				}
			}
		});
		Accounts.ui.config({ // we need to move this and the birthday fetching process to the server.
			requestPermissions: {
					facebook : ['friends_birthday']
					    }
		});

		Meteor.autosubscribe(function(){
			Meteor.subscribe('friends'); // friends allows access to all friends and their gifts in Meteor.users
		});
		Meteor.call("getAccessToken", function(error, _accessToken){ // just to cehck if the access token was retrieved properly. Can remove once stable.
			accessToken = _accessToken;
			console.log(_accessToken);	
		});
	});
	Handlebars.registerHelper("formatBirthday", function(d){
		if(d && d.toDateString){	
			return d.toDateString() ;
		}else{
			return '';
		}
	});

	Template.friends.friends = function(){
		return Meteor.users.find(); // this contains friends ordered by birthday + self. self ought to contain option to throw party or something, so we are not removing it.
	};
	Template.friends.events = {
		'click .friend-wrapper':function(ev){
			var friend = this;
			Session.set('selected_friend' , friend._id);
			console.log(friend);
		}	
	};

	Template.gifts.friend = function(){
		return Meteor.users.findOne({_id: Session.get('selected_friend')});
	}

	Template.gifts.events = {
		'click .add-vote' : function(ev){
			//vote for a gift - server addds the vote. It knows who voted, so we just need to send the birthday person and the gift
			var giftname = this.name;
			Meteor.call('addVote', Session.get('selected_friend'), this);
		}
	}

	Template.new_gift.events = {
		'submit form#gift-details' : function(ev){ // add new gift
			ev.preventDefault();
			var $form = $(ev.target);

			var gift = {name: $form.find('input[name=gift-name]').val(), price: $form.find('input[name=gift-price]').val(), imglink: $form.find('input[name=gift-image]').val(), votes : 0, amount_raised: 0};
			Meteor.call('addGift', Session.get('selected_friend'), gift);
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

			if(Meteor.user() && Meteor.user().profile &&  ! Meteor.user().profile.friends ){ 
			// if there are no friends, this initiates a process to load friends.
			// @todo - Implement a process (in the server) that regularly checks for new friends and updates our list 
				FB.api('/me/permissions', function (response){
					$.getJSON("https://graph.facebook.com/fql?q=select uid, name, birthday_date from user where uid in (select uid2 from friend where uid1=me()) and birthday <> '' order by birthday_date &access_token="+accessToken+"&callback=?", function(response){
						if(response.data){
							Meteor.call('updateFriendsList', Meteor.userId(), response.data, function(error,result){
								console.log(error); //if there is an error. function does not return value, so there will be no result. REturning one is a good way to debug
							});
						}
					});

				});
			}

		}; // end of window.fbAsyncInit
		(function(d){
			var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
			js = d.createElement('script'); js.id = id; js.async = true;
			js.src = "//connect.facebook.net/en_US/all.js";
			d.getElementsByTagName('head')[0].appendChild(js);
		}(document));
	};
}
