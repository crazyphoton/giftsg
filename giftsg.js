var Friends = new Meteor.Collection("friends");

if (Meteor.isClient) {
	//Meteor.subscribe('friends');
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
							//		if(Friends.findOne({uid: f.uid}).count() === 0){
									if(!Friends.findOne({uid: f.uid})){
									var b = f.birthday_date.split("/");
									var birthday = new Date(currdate.getFullYear(),b[0] - 1, b[1] );
									if(birthday.valueOf() < currdate.valueOf()){
										birthday.setFullYear(birthday.getFullYear() + 1);
									}
									f.birthday_upcoming =  birthday;
									f.birthday_original = f.birthday_date;
								        f.birthday_value = birthday.valueOf();
									//f.gifts = [{id: 1, name: "Kindle fire hd", price:"399", imglink: "http://g-ecx.images-amazon.com/images/G/01/kindle/dp/2012/KT/KT-slate-01-lg._V389394535_.jpg", votes : 5, amount_raised: "200"}, {id: 2, name:"Watch", imglink: "", votes:10, price: 50, amount_raised:0}]
									Friends.insert(f);
									}
								});
								var f = Friends.findOne({}, {"sort": {birthday_value : 1, name: 1}});
								Session.set('selected_friend', f.uid);
							}

							Template.friends.isLoadingFB = false;
						});

					});
				}
			});
		}
		return Friends.find({}, {"sort": {birthday_value : 1, name: 1}});
	};
        Template.friends.events = {
		'click .friend-wrapper':function(ev){
			var friend = this;
			Session.set('selected_friend' , friend.uid);
		}	
	};

	Template.gifts.friend = function(){
		return Friends.findOne({uid: Session.get('selected_friend')});
	}

	Template.new_gift.events = {
		'submit form#gift-details' : function(ev){
			ev.preventDefault();
			var $form = $(ev.target);
			
			var gift = {name: $form.find('input[name=gift-name]').val(), price: $form.find('input[name=gift-price]').val(), imglink: $form.find('input[name=gift-image]').val(), votes : 0, amount_raised: 0};
			console.log(gift);
			Friends.update({uid: Session.get('selected_friend')}, {$push : {gifts : gift}});
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
	Meteor.startup(function () {
		//			Meteor.publish("friends");
	});
}
