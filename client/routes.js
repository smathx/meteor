/* global Router, Websites */

Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('navbar', {
    to:"navbar"
  });
  this.render('website_form', {
    to:"add-site-form"
  });
  this.render('website_list', {
    to:"main"
  });
});

Router.route('/sites/:_id', function () {
  this.render('navbar', {
    to:"navbar"
  });

  this.render('site-details', {
    to:"main",
    data:function(){
      return Websites.findOne({_id:this.params._id});
    }
  });
});

//end
