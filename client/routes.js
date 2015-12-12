/* global Router, Websites */

Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('websitesPage', {
    to:'main'
  });
  this.render('websiteList', {
    to:'list'
  });
});

Router.route('/sites/:_id', function () {
  this.render('siteDetailsPage', {
    to:'main',
    data:function(){
      return Websites.findOne({_id:this.params._id});
    }
  });
});

Router.route('/search', function () {
  this.render('searchPage', {
    to:'main'
  });
});

Router.route('/recommend', function () {
  this.render('recommendPage', {
    to:'main'
  });
});

Router.route('/about', function () {
  this.render('aboutPage', {
    to:'main'
  });
});

//end
