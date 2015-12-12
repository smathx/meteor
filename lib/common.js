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
  // sorting, removing duplicates, and filtering out short words.

  getKeywords: function (text) {
    if (!text)
      return '';

    return text
      .toLowerCase()
      .split(/[^a-z]+/g)
      .sort()
      .filter(function(word, index, array){
        return (word !== array[index-1]) && (word.length > 3);
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
