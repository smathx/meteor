/* global Websites:true, Comments:true */

// Allow #insert and #update when user is defined. Disallow #delete.
//
//  title
//  url
//  description
//  ownerId
//  createdAt

Websites = new Mongo.Collection("websites");

Websites.allow({
  insert: function (userId, doc) {
    return !userId;
  },

  update: function (userId, doc, fields, modifier) {
    return !userId;
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

//end
