/* global Router, Websites */

Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('navbar', {
    to:'navbar'
  });
  this.render('websitesPage', {
    to:'main'
  });
  this.render('websiteList', {
    to:'list'
  });
});

Router.route('/sites/:_id', function () {
  this.render('navbar', {
    to:'navbar'
  });

  this.render('siteDetailsPage', {
    to:'main',
    data:function(){
      return Websites.findOne({_id:this.params._id});
    }
  });
});

//end
