/* global Comments, Websites, Votes */

//----------------------------------------------------------------------------
// TODO: Check this is correct. Too simple?

Meteor.subscribe('Websites');
Meteor.subscribe('Comments');
Meteor.subscribe('Keywords');
Meteor.subscribe('Users');
Meteor.subscribe('Votes');

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

  // TODO: Don't allow same URL to be entered twice.

	'submit .js-save-website-form': function (event) {
    var url = event.target.url.value;
    var title = event.target.title.value;
    var description = event.target.description.value;

    Meteor.call('addWebsite', url, title, description, Meteor.userId());

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
// TODO: Allow only one vote per user per site ?

Template.websiteItem.events({
	'click .js-upvote': function (event) {
	  if (Meteor.user())
      Meteor.call('addVote', Meteor.userId(), this._id, 1);
		return false;
	},

	'click .js-downvote': function (event) {
	  if (Meteor.user())
      Meteor.call('addVote', Meteor.userId(), this._id, -1);
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
// TODO: getRecommendedSites is being called multiple times to render the
// template. When testing this throws up a lot of unknown site IDs which
// can only be fixed by a reset. There is probably a smart database way
// to do this.

Template.recommendPage.helpers({
	recommendCountMsg: function () {
    var sites = getRecommendedSites();
    var count;

    if (sites)
      count = sites.count();

    if (!count || (count == 0)) {
      if (sites == null)
        return 'You need to comment on a website before we can recommend any.'
      else
        return 'Sorry, there are no recommended websites.';
    }

    if (count == 1)
      return '1 recommended website found.';

    return count + ' recommended websites found.';
	},

	sitesFound: function () {
	  return getRecommendedSites();
	}
});

/* global Keywords */
// This function returns a Meteor cursor, not an Array. Undefined means no-one
// is signed in, null means the user has no keywords.
function getRecommendedSites() {
  var results;

  if (Meteor.user()) {

    // TODO: Build these as the user comments/votes are added.
    // Get the IDs of all the sites the user commented or voted on.

    var sites = [];

    Comments
      .find({ ownerId: Meteor.userId() })
      .forEach(function (comment) {
        if (sites.indexOf(comment.siteId) == -1)
          sites.push(comment.siteId);
      }
    );

    Votes.find({ userId: Meteor.userId(), vote: 1 })
      .forEach(function (vote) {
        if (sites.indexOf(vote.siteId) == -1)
          sites.push(vote.siteId);
      }
    );

    // Put all keywords from each site into an array, skip duplicates.

    var keywords = [];

    sites.forEach(function (siteId) {
      Websites.findOne({ _id: siteId }).keywords
        .forEach(function (word) {
          if (keywords.indexOf(word) == -1)
            keywords.push(word);
        });
    });

    console.log('Keywords:', keywords);

    if (keywords.length == 0)
      results = null;
    else {
      // Build a list of all site IDs including any keyword, sort it, and
      // strip duplicate IDs.

      var recommended_sites = Keywords
        .find({word: {$in: keywords }})
        .fetch()
        .map(function (keyword) {
          return keyword.siteId;
        })
        .sort()
        .filter(function (siteId, index, array) {
          return array.indexOf(siteId) == index;
        });

      // Return a list of sites as Meteor cursor.

      results = Websites.find({ _id: { $in: recommended_sites }});
    }
  }
  return results;
}

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
