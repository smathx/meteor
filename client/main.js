/* global Comments:true, Websites:true */

//----------------------------------------------------------------------------

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

//----------------------------------------------------------------------------

Template.websitesPage.helpers({
	websiteCountMsg: function () {
    var count = Websites.find().count();

    if (count == 0)
      return 'There are no recommended websites.';

    if (count == 1)
      return 'There is 1 recommended website.';

    return 'There are ' + count + ' recommended websites.';
	}
});

//----------------------------------------------------------------------------

Template.websiteList.helpers({
	websites:function () {
		return Websites.find({}, { sort: { upVotes: -1, downVotes: 1 }});
	}
});

//----------------------------------------------------------------------------

Template.websiteItem.events({
	'click .js-upvote':function (event) {
		var website_id = this._id;

		Websites.update({_id:website_id}, { $inc: { upVotes: 1}});
		return false;
	},

	'click .js-downvote':function (event) {
		var website_id = this._id;

		Websites.update({_id:website_id}, { $inc: { downVotes: 1}});
		return false;
	}
});

//----------------------------------------------------------------------------

Template.websiteForm.events({
	'click .js-toggle-website-form':function (event) {
	  console.log('toggle website form');
		$('#websiteForm').toggle('slow');
	},

	'click #get-data':function (event) {
	  var url = $('#url').val();
	  console.log('get-data: ' + url);

    if (url) {
      url = url.replace(/^\s*(http(s?):[\\/]*)?\s*(.*)\b\s*$/i,'http$2://$3')

      if (url.search(/^https?:\/\/$/) == -1) {
        Meteor.call('getSiteData', url, function (error, result) {
          if (!error) {
            $('#url').val(url);
            $('#title').val(result.title);
            $('#description').val(result.description);
          }
        });
      }
    }
	},

	'submit .js-save-website-form':function (event) {

		Websites.insert({
			title: event.target.title.value,
			url: event.target.url.value,
			description: event.target.description.value,
			ownerId: Meteor.userId(),
			createdAt: new Date()
		});
		$('#websiteForm').toggle('slow');
		return false;
	}
});

//----------------------------------------------------------------------------

Template.commentSection.events({

	'click .toggle-comment-form': function (event) {
    $('#commentForm').toggle('fast');
	}
});

Template.commentSection.helpers({
	commentCountMsg: function (siteId) {
    var count = Comments.find({ siteId: siteId }).count();

    if (count == 0)
      return 'There are no comments.';

    if (count == 1)
      return 'There is 1 comment.';

    return 'There are ' + count + ' comments.';
	}
});

//----------------------------------------------------------------------------

Template.commentForm.events({
	'submit .save-comment-form': function (event) {
    if (Meteor.user()) {
  		Comments.insert({
  			text: event.target.comment.value,
  			siteId: this._id,
  			ownerId: Meteor.userId(),
  			createdAt: new Date()
  		});

      console.log('Add comment: "' + event.target.comment.value + '"');
    }
		$('#commentForm').toggle('fast');
    event.target.comment.value = '';
		return false;
	},
	'reset .toggle-comment-form': function (event) {
    $('#commentForm').toggle('fast');
    event.target.comment.value = '';
    return false;
	}
});

//----------------------------------------------------------------------------

Template.commentList.helpers({
	commentsByDateDesc: function (siteId) {
		return Comments.find({ siteId: siteId }, { sort: { createdAt: -1 }});
	}
});

//----------------------------------------------------------------------------

// formatDate should convert a Date object to a reasonable date string
// numeric day, month string, and 4 digit year. The order, language and
// separators depend on the user locale. For example, the fifth day of the
// twelfth month in 2015 in the locale 'en-GB' returns '5 December 2015'.

Template.registerHelper('formatDate', function (datetime) {
  // Gives a valid locale but not necessarily the right one
  var locale = navigator.language ||      // Chrome, Firefox, IE >= 11
               navigator.userLanguage ||  // IE <= 10
               navigator.browserLanguage; // IE <= 10

  // Should always be defined but fail gracefully if not.
  if (!datetime)
    return '<Date undefined>';

  if (!locale)
    return datetime.toLocaleDateString();

  var options = { day: 'numeric', month: 'long', year: 'numeric' };
  return datetime.toLocaleDateString(locale, options);
});

Template.registerHelper('getUsername', function (userId) {
  var user = Meteor.users.findOne({ _id: userId });
  return user ? user.username : 'anonymous';
});

//end
