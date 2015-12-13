/* global Websites:true, Comments:true */

// Allow #insert and #update when user is defined. Disallow #remove.
//
//  title         Title string - not required
//  url           URL - cleaned up
//  description   Description string
//  keywords      An array of keywords
//  upVotes
//  downVotes
//  ownerId       User _id of owner
//  createdAt     Time record created as a Date object

Websites = new Mongo.Collection('websites');

Websites.allow({
  insert: function (userId, doc) {
    return !!userId;
  },

  update: function (userId, doc, fields, modifier) {
    return !!userId;
  },

  remove: function (userId, doc) {
    return false;
  },

  fetch: []
});

// Allow #insert when the user is the owner of the comment.
// Disallow #remove and #update for now.
//
//  text        Text of the comment
//  siteId      Site _id
//  ownerId     User _id of owner, or nil
//  createdAt   Time comment created as a Date object

Comments = new Mongo.Collection('comments');

Comments.allow({
  insert: function (userId, doc) {
    return userId && (doc.ownerId == userId);
  },

  update: function (userId, doc, fields, modifier) {
    return false;
  },

  remove: function (userId, doc) {
    return false;
  },

  fetch: ['ownerId']
});

/* global Keywords:true */

Keywords = new Mongo.Collection('keywords');

Keywords.allow({
  insert: function (userId, doc) {
    return true;
  },

  update: function (userId, doc, fields, modifier) {
    return true;
  },

  remove: function (userId, doc) {
    return false;
  },

  fetch: []
});

// Allow #insert and #update if signed in.
//
//  siteId
//  ownerId
//  vote        The vote, +1 or -1
/* global Votes */
Votes = new Mongo.Collection('votes');

Votes.allow({
  insert: function (userId, doc) {
    return !!userId;
  },

  update: function (userId, doc, fields, modifier) {
    return false;
  },

  remove: function (userId, doc) {
    return false;
  },

  fetch: []
});

// TODO: This works but is it the right way to share common code?

Meteor.common = {

  // Trim space, lowercase, prepend http://www. and append .com as required.

  getUrl: function (url) {
    if (url) {
      url = url.toLowerCase().trim();

      if (url) {
        if (url.indexOf('.') == -1)
          url = 'www.' + url + '.com';

        url = url.replace(/^\s*(http(s?):[\\/]*)?\s*(.*)\b\s*$/, 'http$2://$3');
      }
    }
    return url;
  },

  // Build list of keywords by splitting the text into words,
  // sorting, removing duplicates, and filtering out stop words.

  getKeywords: function (text) {
    var stop_words = [
      'a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am',
      'among', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been',
      'but', 'by', 'can', 'cannot', 'could', 'dear', 'did', 'do', 'does',
      'either', 'else', 'ever', 'every', 'for', 'from', 'get', 'got', 'had',
      'has', 'have', 'he', 'her', 'hers', 'him', 'his', 'how', 'however', 'i',
      'if', 'in', 'into', 'is', 'it', 'its', 'just', 'least', 'let', 'like',
      'likely', 'may', 'me', 'might', 'most', 'must', 'my', 'neither', 'no',
      'nor', 'not', 'of', 'off', 'often', 'on', 'only', 'or', 'other', 'our',
      'own', 'rather', 'said', 'say', 'says', 'she', 'should', 'since', 'so',
      'some', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these',
      'they', 'this', 'tis', 'to', 'too', 'twas', 'us', 'wants', 'was', 'we',
      'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
      'will', 'with', 'would', 'yet', 'you', 'your',

      'best', 'biggest', 'com', 'company', 'corporation', 'first', 'free',
      'global', 'home', 'largest', 'learn', 'less', 'login', 'more',
      'official', 'online', 'provider', 'sign', 'site', 'web', 'website',
      'welcome', 'world'
    ];

    if (!text)
      return '';

    return text
      .toLowerCase()
      .split(/[^a-z]+/g)
      .sort()
      .filter(function (word, index, array) {
        return (array.indexOf(word) == index) &&
//               (word.length > 3) &&
               (stop_words.indexOf(word) == -1);
      });
  }
};

// See: https://atmospherejs.com/easy/search

/* global EasySearch, WebsitesIndex */

WebsitesIndex = new EasySearch.Index({
  collection: Websites,
  fields: [ 'url', 'title', 'description' ],
  engine: new EasySearch.MongoDB()
});

//end
