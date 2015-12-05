// Server only code

/* global Websites:true, Comments:true */

Meteor.startup(function () {

  var cleanDB = true;
  var randomSeed = 1;
  var earliestDate = '12/12/12';

  // Clean out DB for testing - quicker than reset.

  if (cleanDB) {
    Meteor.users.remove({});
    Websites.remove({});
    Comments.remove({});
  }

  // Some helper functions for random data.

  var randomNumber;

  if (randomSeed) {
    randomNumber = function (min, max) {
      randomSeed = (1103515245 * randomSeed + 12345) & 0x7fffffff;
      return Math.floor(min + (randomSeed / 0x7fffffff) * (max - min));
    };
  } else {
    randomNumber = function (min, max) {
      return Math.floor(min + Math.random() * (max - min));
    };
  }

  function randomUserId() {
    var userIds = Meteor.users.find({}, { _id: true }).fetch();
    return userIds[randomNumber(0, userIds.length)]._id;
  }

  // start is either a Date object or a String recognised by the Date() constructor.
  function randomDate(start) {
    var startDate = start || earliestDate;

    if (typeof(startDate) === 'string')
      startDate = new Date(start);

    return new Date(randomNumber(startDate.getTime(), Date.now()));
  }

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

  // Dummy websites

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
        upVotes: randomNumber(0, 10),
        downVotes: randomNumber(0, 5),
        ownerId: randomUserId(),
        createdAt: randomDate()
      });
    });
  }

  // Dummy comments

  if (!Comments.findOne()) {
    console.log("Creating dummy comment data.");

    Websites.find().forEach(function (site) {
      for (var n = 1; n <= randomNumber(0, 10); n++) {
        Comments.insert({
          comment: "Test comment",
          siteId: site._id,
          ownerId: randomUserId(),
          createdAt: randomDate(site.createdAt)
        });
      }
    });
  }

  console.log(Meteor.users.find().count() + ' users, ' +
              Websites.find().count() + ' websites, ' +
              Comments.find().count() + ' comments');
});

//end
