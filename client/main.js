/* global Comments:true, Websites:true */

//----------------------------------------------------------------------------
// TODO: Check this is correct. Too simple?

Meteor.subscribe('Websites');
Meteor.subscribe('Comments');
Meteor.subscribe('Users');

//----------------------------------------------------------------------------

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

//----------------------------------------------------------------------------

Template.websitesPage.events({
	'click .js-toggle-website-form': toggleWebsiteForm
});

Template.websitesPage.helpers({
	websiteCountMsg: function () {
    var count = Websites.find().count();

    if (count == 0)
      return 'There are no website reviews.';

    if (count == 1)
      return 'There is 1 website review.';

    return 'There are ' + count + ' website reviews.';
	}
});

//----------------------------------------------------------------------------

Template.websiteForm.events({
	'click .js-get-site-data': function (event) {
	  var url = Meteor.common.getUrl($('#url').val());
	  console.log('get-site-data: ' + url);

    $('#title').val('');
    $('#description').val('');

    if (url) {
      Meteor.call('getSiteData', url, function (error, result) {
        if (!error) {
          $('#url').val(url);
          $('#title').val(result.title);
          $('#description').val(result.description);
        }
      });
    }
	},

	'submit .js-save-website-form': function (event) {

		Websites.insert({
			title: event.target.title.value,
			url: event.target.url.value,
			description: event.target.description.value,
			upVotes: 0,
			downVotes: 0,
			ownerId: Meteor.userId(),
			createdAt: new Date()
		});
		toggleWebsiteForm();
		return false;
	},

  // TODO: Only works if an input field has focus.
	'keyup .js-save-website-form': function (event) {
	  if (event.keyCode == 27) {
	    toggleWebsiteForm();
	    return false;
	  }
	}
});

Template.websiteForm.onRendered(function () {
  // Clean up URL field on exit.
  $('#url').focusout(function (event) {
    $('#url').val(Meteor.common.getUrl(event.target.value));
  });
  // Needed for Bootstrap tooltips to work.
  $('[data-toggle="tooltip"]').tooltip();
});

// Toggle form and clear it on completion.

function toggleWebsiteForm() {
	$('#websiteForm').toggle('fast', function () {
    $('#url, #title, #description').val('');
	});
}

//----------------------------------------------------------------------------

Template.websiteList.helpers({
	websites: function () {
		return Websites.find({}, { sort: { upVotes: -1, downVotes: 1 }});
	}
});

//----------------------------------------------------------------------------

Template.websiteItem.events({
	'click .js-upvote': function (event) {
	  if (Meteor.user())
      Websites.update({_id: this._id}, { $inc: { upVotes: 1}});
		return false;
	},

	'click .js-downvote': function (event) {
	  if (Meteor.user())
  		Websites.update({_id:this._id}, { $inc: { downVotes: 1}});
		return false;
	}
});

Template.websiteItem.onRendered(function () {
  // Needed for Bootstrap tooltips to work.
  $('[data-toggle="tooltip"]').tooltip();
});

//----------------------------------------------------------------------------

Template.commentSection.events({
	'click .js-toggle-comment-form': function (event) {
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
	'submit .js-save-comment-form': function (event) {
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
	'reset .js-toggle-comment-form': function (event) {
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

Template.searchPage.events({
	'submit .js-search-form': function (event) {
	  var text = event.target.search.value;

    console.log('Searching for: "' + text + '"');

	  Meteor.call('search', text, function (error, result) {
	    if (error)
	      result = '';

	    Session.set('searchResults', result);
	    Session.set('searchResultsCount', result.length);
	  });
	  return false;
	}
});

Template.searchPage.onDestroyed(function () {
  Session.set('searchResults', undefined);
  Session.set('searchResultsCount', 0);
});

Template.searchResults.helpers({
	sitesFoundCountMsg: function () {
    var count = Session.get('searchResultsCount');

    if (!count || (count == 0))
      return 'No matching websites found.';

    if (count == 1)
      return '1 matching website found.';

    return count + ' matching websites found.';
	}
});

Template.searchResults.helpers({
	sitesFound: function () {
	  return Session.get('searchResults');
	}
});

//----------------------------------------------------------------------------

Template.recommendPage.helpers({
	recommendCountMsg: function () {
    var count = Session.get('recommendResults').length;

    if (!count || (count == 0))
      return 'Sorry, there are no recommended websites.';

    if (count == 1)
      return '1 recommended website found.';

    return count + ' recommended websites found.';
	},
	sitesFound: function () {
	  return Session.get('recommendResults');
	}
});

Template.recommendPage.onRendered(function () {
  var results = [];

  if (Meteor.user()) {
    var id = Meteor.userId();
    var sites = Comments.find({ ownerId: id }).map(function (x) {
      return x.siteId;
    });
    console.log(sites);
    results = sites.map(function (siteId) {
      return Websites.findOne({ _id: siteId });
    });
    console.log(results);
  }

  Session.set('recommendResults', results);
})

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

  var options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return datetime.toLocaleDateString(locale, options);
});

Template.registerHelper('getUsername', function (userId) {
  var user = Meteor.users.findOne({ _id: userId });
  return user ? user.username : 'anonymous';
});

//end
