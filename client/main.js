// Client code

/* global Comments:true, Websites:true */

// helpers

// helper function that returns all available websites
Template.website_list.helpers({
	websites:function () {
		return Websites.find({}, { sort: { upVotes: -1, downVotes: 1 }});
	}
});


// events

Template.website_item.events({
	'click .js-upvote':function (event) {
		var website_id = this._id;
		console.log('Up voting website with id '+website_id);

		Websites.update({_id:website_id}, { $inc: { upVotes: 1}});
		return false;
	},

	'click .js-downvote':function (event) {
		var website_id = this._id;
		console.log('Down voting website with id '+website_id);

		Websites.update({_id:website_id}, { $inc: { downVotes: 1}});
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

Template.commentList.helpers({
	comments: function (siteId) {
		return Comments.find({ siteId: siteId});
	},
	commentCount: function (siteId) {
		return Comments.find({ siteId: siteId }).count();
	}
});

Template.registerHelper('getUsername', function (userId) {
  var user = Meteor.users.findOne({ _id: userId });
  return user ? user.username : "anonymous";
});

// formatDate should convert a Date object to a reasonable date string - numeric
// day, month string, and 4 digit year. The order, language and separators
// depend on the user locale. For example, the fifth day of the twelfth month
// in 2015 in the locale 'en-GB' returns '5 December 2015'.

Template.registerHelper('formatDate', function (datetime) {
  // ???? get user locale - iffy
  var locale = navigator.language ||        // Chrome, Firefox, IE >= 11
               navigator.userLanguage ||    // IE <= 10
               navigator.browserLanguage;   // IE <= 10

  console.log(locale);

  if (locale) {
    var options = { day: "numeric", month: "long", year: "numeric" };
    return datetime.toLocaleDateString(locale, options);
  } else {
    return datetime.toLocaleDateString();
  }
});

// accounts config

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

//end
