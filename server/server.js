// TODO: Split the startup code into a separate file. The random stuff could
// be split off as a separate modules as it is likely to be useful again.

/* global Websites:true, Comments:true, Keywords */
/* global _ */

Meteor.methods({
  'httpGetUrl': function (url) {
    this.unblock();
    return HTTP.get(url);
  },
  'getSiteData': function (url) {
    return getSiteData(url);
  },
  'search': function (text) {
    return search(text);
  }
});

// TODO: Check this is correct.

Meteor.publish('Websites', function () {
  return Websites.find();
});

Meteor.publish('Comments', function () {
  return Comments.find();
});

Meteor.publish('Keywords', function () {
  return Keywords.find();
});

Meteor.publish('Users', function () {
  return Meteor.users.find();
});

// Checks a string against a list of regex's returning with the first
// matching group, unescaped.

function matchAny(str, regexList) {
  var found;
  regexList.some(function (r) {
    return found = str.match(r);
  });
  return found ? _.unescape(found[1]): '';
}

function getSiteData(url) {
  var data = {
    title: '',
    description: '',
    error: 'GET failed on ' + url
  };

  console.log('getSiteData: ' + url);

  Meteor.call('httpGetUrl', url, function (error, result) {
    data.error = error;

    if (!error) {
      var titleMatch = [
        /<title[^>]*>[\n\s]*(.*)[\n\s]*<\/title>/im
      ];

      data.title = matchAny(result.content, titleMatch);

      var descriptionMatch = [
        /<meta[^>]*\bname="description"[^>]*\bcontent="([^"]*)"[^>]*>/i,
        /<meta[^>]*\bcontent="([^"]*)"[^>]*\bname="description"[^>]*>/i
      ];

      data.description = matchAny(result.content, descriptionMatch);

      // Dump missing titles and descriptions to console to tweek regex

      if (!data.title) {
        console.log(url + ' no title found');
        console.log('  '+result.content.match(/(.{1,20}\btitle\b.{1,20})/img));
      }

      if (!data.description) {
        console.log(url + ' no description found');
        result.content.match(/<meta[^>]*>/ig).forEach(function (meta) {
          console.log('  ' + meta);
        });
      }
    }
  });

  if (data.error)
    console.log('getSiteData: ' + data.error);

  return data;
}

/* global WebsitesIndex */
// The search is done on the server as it seems erratic on the client,
// returning no match, then several a couple of seconds later.
function search(text) {
  console.log('search: ' + text);
  return WebsitesIndex
    .search(text, { limit: 0 })
    .fetch()
    .sort(function (a, b) {
      return a.title.localeCompare(b.title);
    });
}

//-----------------------------------------------------------------------------

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
  // Note: The period is relatively short to avoid loss of precision
  // when integers are greater than MAX_SAFE_INTEGER, 2^53-1 or 16 digits.
  // The values for a, c, and m give a maximum integer < 2^34 bits.

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

  // Set the random seed to a specific value or a random 6 digit value if
  // undefined.

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

  // start is either a Date object or a String recognised by the Date()
  // constructor.

  function randomDate(start) {
    var startDate = start || earliestDate;

    if (typeof(startDate) === 'string')
      startDate = new Date(startDate);

    return new Date(randomNumber(startDate.getTime(), Date.now()));
  }

  // Dummy users

  if (!Meteor.users.findOne()) {
    console.log('Creating dummy user accounts...');

    // How many 3 letter names can there be...

    var names = [
      'Ada', 'Ali', 'Amy', 'Ann', 'Bea', 'Ben', 'Bob', 'Bud', 'Cal', 'Che',
      'Dan', 'Dee', 'Dot', 'Eli', 'Eve', 'Eva', 'Fay', 'Gus', 'Guy', 'Hal',
      'Han', 'Huw', 'Ian', 'Ida', 'Ira', 'Ivy', 'Jan', 'Jay', 'Jen', 'Jim',
      'Joe', 'Jon', 'Joy', 'Kai', 'Kay', 'Ken', 'Kim', 'Lee', 'Len', 'Leo',
      'Les', 'Lou', 'Lyn', 'Mae', 'Max', 'May', 'Meg', 'Mel', 'Mia', 'Ned',
      'Pam', 'Pip', 'Rab', 'Raj', 'Ray', 'Rex', 'Rob', 'Rod', 'Ron', 'Roy',
      'Sal', 'Sam', 'Sia', 'Sid', 'Sue', 'Tam', 'Tea', 'Tom', 'Uri', 'Val',
      'Vin', 'Wes', 'Wyn', 'Zak', 'Zoe'
    ];

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
    console.log('Creating dummy websites...');

    // Takes too long too load if there are too many sites to look up.

    var sites = [
      'Google', 'Apple', 'Intel', 'IBM', 'CNN', 'Honda', 'ABC', 'CBS',
      'Amazon', 'Ford', 'BA', 'Yahoo', 'Verizon', 'Virgin',

      'Chevron',    // title split over multiple lines
      'BP',         // no site description
      'edX.org',    // .com is another site
      'Coursera',   // .com redirects to .org
      'Walmart'     // can't read page at all
    ];

    // TODO: Put this into a method

    sites.forEach(function (name) {

      var url = Meteor.common.getUrl(name);
      var data = getSiteData(url);

      var id = Websites.insert({
        title: data.title ? data.title: url,
        url: url,
        description: data.description ? data.description: 'No description given.',
        upVotes: randomNumber(10),
        downVotes: randomNumber(5),
        keywords: Meteor.common.getKeywords(data.title) +
                  Meteor.common.getKeywords(data.description),
        ownerId: randomUserId(),
        createdAt: randomDate()
      });

      if (data.title) {
        Meteor.common.getKeywords(data.title).forEach(function (word) {
          Keywords.insert({
            word: word,
            siteId: id
          });
        });
      }

      if (data.description) {
        Meteor.common.getKeywords(data.description).forEach(function (word) {
          Keywords.insert({
            word: word,
            siteId: id
          });
        });
      }
    });
  }

  // Dummy comments

  if (!Comments.findOne()) {
    console.log('Creating dummy comments...');

    var quotes = getQuotes();

    Websites.find().forEach(function (site) {
      var count = randomNumber(10);
      while (--count >= 0) {
        Comments.insert({
          text: quotes[randomNumber(quotes.length)],
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

// TODO: Put all this somewhere else.

  function getQuotes() {
    return [

      'When I die, I want to go peacefully like my grandfather did - in his sleep. Not yelling and screaming like the passengers in his car.',
      'I have six locks on my door all in a row. When I go out, I lock every other one. I figure no matter how long somebody stands there picking the locks, they are always locking three.',
      'Always borrow money from a pessimist. He won\'t expect it back.',
      'The scientific theory I like best is that the rings of Saturn are composed entirely of lost airline luggage.',
      'Friendship is like peeing on yourself: everyone can see it, but only you get the warm feeling that it brings.',
      'First the doctor told me the good news: I was going to have a disease named after me.',
      'A successful man is one who makes more money than his wife can spend. A successful woman is one who can find such a man.',
      'How do you get a sweet little 80-year-old lady to say the F word? Get another sweet little 80-year-old lady to yell "BINGO!"',
      'My therapist told me the way to achieve true inner peace is to finish what I start. So far I\'ve finished two bags of M&Ms and a chocolate cake. I feel better already.',
      'Dogs have masters. Cats have staff.',
      'Knowledge is knowing a tomato is a fruit; wisdom is not putting it in a fruit salad.',
      'Why do people say "no offense" right before they\'re about to offend you?',
      'I love deadlines. I like the whooshing sound they make as they fly by.',
      'By all means, marry. If you get a good wife, you\'ll become happy; if you get a bad one, you\'ll become a philosopher.',
      'I asked God for a bike, but I know God doesn\'t work that way. So I stole a bike and asked for forgiveness.',
      'The best way to lie is to tell the truth ... carefully edited truth.',
      'Do not argue with an idiot. He will drag you down to his level and beat you with experience.',
      'The only mystery in life is why the kamikaze pilots wore helmets.',
      'Going to church doesn\'t make you a Christian any more than standing in a garage makes you a car.',
      'A bargain is something you don\'t need at a price you can\'t resist.',
      'If at first you don\'t succeed ... so much for skydiving.',
      'Never, under any circumstances, take a sleeping pill and a laxative on the same night.',
      'If you steal from one author, it\'s plagiarism; if you steal from many, it\'s research.',
      'If you think nobody cares if you\'re alive, try missing a couple of car payments.',
      'How is it one careless match can start a forest fire, but it takes a whole box to start a campfire?',
      'My mother never saw the irony in calling me a son-of-a-bitch.',
      'God gave us our relatives; thank God we can choose our friends.',
      'A stockbroker urged me to buy a stock that would triple its value every year. I told him, "At my age, I don\'t even buy green bananas."',
      'Some cause happiness wherever they go; others, whenever they go.',
      'Patience is something you admire in the driver behind you, but not in one ahead.',
      'I couldn\'t repair your brakes, so I made your horn louder.',
      'Children: You spend the first 2 years of their life teaching them to walk and talk. Then you spend the next 16 telling them to sit down and shut-up.',
      'I intend to live forever. So far, so good.',
      'A diplomat is someone who can tell you to go to hell in such a way that you will look forward to the trip.',
      'Money can\'t buy happiness, but it sure makes misery easier to live with.',
      'Nothing sucks more than that moment during an argument when you realize you\'re wrong.',
      'By the time a man realizes that his father was right, he has a son who thinks he\'s wrong.',
      'We\'ve all heard that a million monkeys banging on a million typewriters will eventually reproduce the entire works of Shakespeare. Now, thanks to the Internet, we know this is not true.',
      'Why didn\'t Noah swat those two mosquitoes?',
      'If evolution really works, how come mothers only have two hands?',
      'I dream of a better tomorrow, where chickens can cross the road and not be questioned about their motives.',
      'Women who seek to be equal with men lack ambition.',
      'When you go into court you are putting your fate into the hands of twelve people who weren\'t smart enough to get out of jury duty.',
      'Those people who think they know everything are a great annoyance to those of us who do.',
      'By working faithfully eight hours a day you may eventually get to be boss and work twelve hours a day.',
      'When tempted to fight fire with fire, remember that the Fire Department usually uses water.',
      'It\'s true hard work never killed anybody, but I figure, why take the chance?',
      'America is a country where half the money is spent buying food, and the other half is spent trying to lose weight.',
      'To err is human, to blame it on somebody else shows management potential.',
      'I read recipes the same way I read science fiction. I get to the end and I think, "Well, that\'s not going to happen."',
      'The trouble with being punctual is that nobody\'s there to appreciate it.',
      'If you do a job too well, you\'ll get stuck with it.',
      'Before I got married I had six theories about bringing up children; now I have six children and no theories.',
      'A filing cabinet is a place where you can lose things systematically.',
      'The trouble with eating Italian food is that five or six days later, you\'re hungry again.',
      'Insanity is hereditary. You get it from your children.',
      'Instead of getting married again, I\'m going to find a woman I don\'t like and just give her a house.',
      'A bank is a place that will lend you money, if you can prove that you don\'t need it.',
      'Politics is supposed to be the second oldest profession. I have come to realize that it bears a very close resemblance to the first.',
      'It is amazing how quickly the kids learn to drive a car, yet are unable to understand the lawn mower, snowblower and vacuum cleaner.',
      'I hate housework! You make the beds, you do the dishes - and six months later you have to start all over again.',
      'We hope that, when the insects take over the world, they will remember with gratitude how we took them along on all our picnics.',
      'Evening news is where they begin with "Good evening," and then proceed to tell you why it isn\'t.',
      'My husband wanted one of those big-screen TVs for his birthday. So I just moved his chair closer to the one we have already.',
      'According to most studies, people\'s number one fear is public speaking. Number two is death. Death is number two! Does that sound right? That means to the average person, if you go to a funeral, you\'re better off in the casket than doing the eulogy.',
      'Retirement at 65 is ridiculous. When I was 65 I still had pimples.',
      'An archaeologist is the best husband a woman can have; the older she gets the more interested he is in her.',
      'The shinbone is a device for finding furniture in a dark room.',
      'Housework can\'t kill you, but why take a chance?',
      'All you need to grow fine, vigorous grass is a crack in your sidewalk.',
      'You know you\'re getting old when you stoop to tie your shoelaces and wonder what else you could do while you\'re down there.',
      'The best time to give advice to your children is while they\'re still young enough to believe you know what you\'re talking about.',
      'Tell a man there are 300 billion stars in the universe and he\'ll believe you. Tell him a bench has wet paint on it and he\'ll have to touch it to be sure.',
      'Politicians and diapers have one thing in common. They should both be changed regularly, and for the same reason.',
      'The human brain is a wonderful thing. It starts working the moment you are born, and never stops until you stand up to speak in public.',
      'Misers aren\'t fun to live with, but they make wonderful ancestors.',
      'The odds of going to the store for a loaf of bread and coming out with only a loaf of bread are three billion to one.',
      'When opportunity knocks, some people are in the backyard looking for four-leaf clovers.',
      'Life expectancy would grow by leaps and bounds if green vegetables smelled as good as bacon.',
      'I told my wife the truth. I told her I was seeing a psychiatrist. Then she told me the truth: that she was seeing a psychiatrist, two plumbers, and a bartender.',
      'There is nothing so annoying as to have two people go right on talking when you\'re interrupting.',
      'The best way to keep children home is to make the home a pleasant atmosphere ... and let the air out of the tires.',
      'I grew up with six brothers. That\'s how I learned to dance - waiting for the bathroom.',
      'If you even dream of beating me you\'d better wake up and apologize.',
      'Inside me there\'s a thin person struggling to get out, but I can usually sedate him with four or five cupcakes.',
      'To keep your marriage brimming, with love in the loving cup, whenever you\'re wrong admit it; whenever you\'re right shut up.',
      'People who read the tabloids deserve to be lied to.',
      'I was such an ugly kid. When I played in the sandbox the cat kept trying to cover me up.',
      'You want a friend in Washington? Get a dog.',
      'At every party, there are two kinds of people-those who want to go home and those who don\'t. The trouble is, they are usually married to each other.',
      'I\'ve had bad luck with both my wives. The first one left me and the second one didn\'t.',
      'I have to exercise early in the morning before my brain figures out what I\'m doing.',
      'To attract men, I wear a perfume called New Car Interior.',
      'Two things are infinite, the universe and human stupidity, and I am not yet completely sure about the universe.',
      'My favorite machine at the gym is the vending machine.',
      'I always arrive late at the office, but I make up for it by leaving early.',
      'Human genius has its limits, but stupidity does not.',
      'You\'ve got to be very careful if you don\'t know where you are going, because you might not get there.',
      'I never said most of the things I said.',
      'When you come to a fork in the road, take it.'
    ];
  }

});

//end
