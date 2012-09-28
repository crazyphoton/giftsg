GIFTSG
==

What is it?
===========
Collaborative gifting. 

See which friends have birthdays coming up, see what other friends what to buy them, make your own suggestion / vote for another suggestion. And the join hands to make the gift / gifts a reality.

Meteor?
=======
Meteor has been getting a lot of press lately, so I wanted to use it to
   - Build a real product which requires a fair bit of security [perhaps payments can be integrated, so you can literally "Friendsource" gifts.] and see if it stands up.
   - get an understanding  Nodejs, Mongodb, handlebar. There has been a lot of buzz around them as well

Rough Spec
===============
As I have in mind, this is what a workable prototype should do
  - Show a list of friends from facebook with birthdays. Allow user to add other friends to this list / add birthdays that dont show up on facebook.
  - Allow user to pick a friend and see gift suggestions by others, how many votes each suggestion  has, and how much money it has raised.
  - Pitch in to an existing suggestion / add a new suggestion (from Amazon) and pitch in some starting amount.
  - Once a suggestion has raised enough money, a purchase is made and the gift is sent to the birthday boy/girl scheduled to be received on his/her birthday with a card stating contributors in order of contribution. (address needs to be confirmed from friends) 
  - If a suggestion hasnt raised enough money by deadline, all contributors are informed and they can choose to cover the remaining amount or divert their contribution to some other suggestion or drop the idea and get their money refunded.

How to get things working (Tested on a mac)
===
- Install meteor - $ curl https://install.meteor.com | /bin/sh
- Create some dev folder and clone the code there.
- Install nodejs ( easiest is using homebrew / macports) if you dont have it. Need it to install some packages
- Install xml2js
  - $ cd .meteor/local/build/server
  - $ sudo npm install xml2js
- Inside the dev folder ( where the html and js files are ), 
  - $ meteor
  - You should see "Running on: http://localhost:3000/"
- Go to  http://localhost:3000/, and it should ask you for facebook credentials, and when you log in, it should work.



--

v0.01
==
1. Log into facebook and see list of friends ordered by birthday. 
2. Click on friend to see dummy gifts for that person.

