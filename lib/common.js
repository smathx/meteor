/* global Websites:true, Comments:true */

// Allow #insert and #update when user is defined. Disallow #remove.
//
//  title         Title string - not required
//  url           URL - cleaned up
//  description   Description string
//  ownerId       User _id of owner
//  createdAt     Time record created as a Date object

Websites = new Mongo.Collection("websites");

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

Comments = new Mongo.Collection("comments");

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
  }

};

//end
