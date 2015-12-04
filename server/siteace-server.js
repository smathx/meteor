// Server only code

/* global Websites:true, Comments:true */

// Seed DB if empty
Meteor.startup(function () {

  // Dummy users

  if (!Meteor.users.findOne()) {
    console.log('Creating dummy user accounts.');

    var names = ['Amy', 'Ben', 'Eva', 'Joe', 'Max', 'Mia', 'Sam', 'Zoe'];

    names.forEach(function (name) {
      Accounts.createUser({
        username: name,
        email: name.toLowerCase() + '@fake.mail',
        password: '......'
      });
    });
  }

  if (!Websites.findOne()) {
    console.log("Creating dummy website data.");

    var sites = ['Google', 'Apple', 'Intel', 'IBM', 'CNN', 'Honda',
      'Amazon', 'Ford', 'BP', 'Chevron', 'Walmart', 'Verizon'
    ];

    sites.forEach(function (name) {
      Websites.insert({
        title: name,
        url: 'http://www.' + name.toLowerCase() + '.com',
        description: 'This is the website for ' + name,
        ownerId: _.sample(Meteor.users.find({}, { _id: true }).fetch())._id,
        createdAt: new Date()
      });
    });
  }

  // Dummy comments

  if (!Comments.findOne()) {
    Comments.insert({
      comment: "Test comment",
      createdOn: new Date()
    });
  }

  // Dummy users

  if (!Meteor.users.findOne()) {
    Accounts.createUser({
        username: "Jon",
        email: "jon@gmail.com",
        password: "123456"
      }),
      Accounts.createUser({
        username: "Jon",
        email: "jon@gmail.com",
        password: "123456"
      });
  }
});

//end
