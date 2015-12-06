// Server only code

/* global Websites:true, Comments:true */

Meteor.startup(function () {

  var randomSeed;
  seedRandomNumber();

  var cleanDB = true;
  var earliestDate = '12/12/12';

  // Clean out DB for testing - quicker than reset.

  if (cleanDB) {
    Meteor.users.remove({});
    Websites.remove({});
    Comments.remove({});
  }

  // Some helper functions for random data.

  // randomNumber() returns a random integer >= min and < max. If max is
  // undefined, the range defaults to 0 to min. Seeded by randomSeed.
  // Note: The LCG is a relatively short period to avoid loss of precision
  // when integers are greater than MAX_SAFE_INTEGER, 2^53-1 or 16 digits.

  function randomNumber(min, max) {
      if (typeof(max) === 'undefined') {
        max = min;
        min = 0;
      }

      var a = 9301;
      var c = 49297;
      var m = 233280;

      randomSeed = ((a * randomSeed) + c) % m;
      return Math.floor(min + (randomSeed / m) * (max - min));
  }

  // Set the random seed to a specific value or random 6 digit value if undefined.

  function seedRandomNumber(seed) {
    if (typeof(seed) === 'undefined')
      randomSeed = Math.floor(Math.random() * 1000000);
    else
      randomSeed = seed;

    console.log('Random seed set to ' + randomSeed);
  }

  function randomUserId() {
    var userIds = Meteor.users.find({}, { _id: true }).fetch();
    return userIds[randomNumber(userIds.length)]._id;
  }

  // start is either a Date object or a String recognised by the Date() constructor.
  function randomDate(start) {
    var startDate = start || earliestDate;

    if (typeof(startDate) === 'string')
      startDate = new Date(startDate);

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
        upVotes: randomNumber(10),
        downVotes: randomNumber(5),
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
          comment: 'Comment ' + randomNumber(1000000) + ' for ' + site.url,
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
