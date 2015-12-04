// Client code

/* global Comments:true, Websites:true */

// helpers

// helper function that returns all available websites
Template.website_list.helpers({
	websites:function () {
		return Websites.find({}, { sort: { up_votes: -1, down_votes: 1 }});
	}
});


// events

Template.website_item.events({
	'click .js-upvote':function (event) {
		var website_id = this._id;
		console.log('Up voting website with id '+website_id);

		Websites.update({_id:website_id}, { $inc: { up_votes: 1}});
		return false;
	},

	'click .js-downvote':function (event) {
		var website_id = this._id;
		console.log('Down voting website with id '+website_id);

		Websites.update({_id:website_id}, { $inc: { down_votes: 1}});
		return false;
	}
});

Template.website_form.events({
	'click .js-toggle-website-form':function (event) {
		$('#website_form').toggle('slow');
		//$('#url').get(0).setCustomValidity('Please enter a valid url');
		//console.log($('#url').get());
	},

	'submit .js-save-website-form':function (event) {

		Websites.insert({
			title: event.target.title.value,
			url: event.target.url.value,
			description: event.target.description.value,
			ownerId: Meteor.userId(),
			createdAt: new Date()
		});
		$('#website_form').toggle('slow');
		return false;
	}
});

Template.commentForm.events({
	'submit #comment-form':function (event) {
	  console.log(this);
    if (Meteor.user()) {
  		Comments.insert({
  			comment: event.target.comment.value,
  			siteId: this._id,
  			ownerId: Meteor.userId(),
  			createdAt: new Date()
  		});

      console.log('Add comment:' + event.target.comment.value);
    }
		return false;
	}
});

Template.registerHelper('getUsername', function (userId) {
  var user = Meteor.users.findOne({ _id: userId });
  return user ? user.username : "anonymous";
});

// accounts config

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

//end
