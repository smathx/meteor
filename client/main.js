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
			createdOn: new Date()
		});
		$('#website_form').toggle('slow');
		return false;
	}
});

Template.commentForm.events({
	'submit #comment-form':function (event) {

		Comments.insert({
			comment: event.target.comment.value,
			createdOn: new Date()
		});
    console.log('Add comment:' + event.target.comment.value);
		return false;
	}
});

// accounts config

Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_EMAIL'
});

//end
