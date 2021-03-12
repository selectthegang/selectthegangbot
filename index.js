const tmi = require('tmi.js');
const math = require('mathjs');
const website = require('./website');
let prefix = process.env.PREFIX;
//const Eval = require('open-eval');
//const ev = new Eval();
const { mods, bannedUsers } = require('./roles');
const { getStatus } = require("mc-server-status");
const fetch = require('node-fetch');
db = require('./database/mongo');

const client = new tmi.Client({
  options: {
    debug: false
  },
  connection: {
    reconnect: true
  },
  identity: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  },
  channels: ['selectthegang', 'joggerjoel']
});

client.connect().then(() => {
  db.connect(process.env.MONGO);
});

client.on('subscription', (channel, username, method, message, userstate) => {
  if (channel === 'joggerjoel') {
    db.user.add(username, username, 'subscriber').then(() => {
      client.say(channel, `${username}, thanks for subscribing to the channel!`)
    })
  }
  else {
    return;
  }
});

client.on('message', async (channel, context, message, self) => {
  let blacklisted = await db.blacklist.get(context.username);
  if (blacklisted) return;
  const args = message.slice(1).split(' ');
  const command = args.shift().toLowerCase();

  if (message.startsWith(`${prefix}timeout`)) {
    if (!mods.includes(context.username)) {
      return client.say(channel, `you don't have permissions to use this command!`);
    }
    else {
      client.say(channel, `/timeout ${args[0]} ${args[1]}`);
      client.say(channel, `timed ${args[0]} out for ${args[1]}`)
    }
  }

  if (message.startsWith(`${prefix}ban`)) {
    if (!mods.includes(context.username)) {
      return client.say(channel, `you don't have permissions to use this command!`);
    }
    else {
      client.say(channel, `/ban ${args[0]}`);
      client.say(channel, `banned ${args[0]}`)
    }
  }

  if (message.startsWith(`${prefix}untimeout`)) {
    if (!mods.includes(context.username)) {
      return client.say(channel, `you don't have permissions to use this command!`);
    }
    else {
      client.say(channel, `/untimeout ${args[0]}`);
      client.say(channel, `untimed ${args[0]}`)
    }
  }

  if (message.startsWith(`${prefix}unban`)) {
    if (!mods.includes(context.username)) {
      return client.say(channel, `you don't have permissions to use this command!`);
    }
    else {
      client.say(channel, `/unban ${args[0]}`);
      client.say(channel, `unbanned ${args[0]}`)
    }
  }

  const querystring = require('querystring');
  const fetch = require('node-fetch');

  if (message.startsWith(`${prefix}urban`)) {
    if (!args.join(' ')) {
      return client.say(channel, 'You need to supply a search term!');
    }

    const query = querystring.stringify({ term: args.join(' ') });

    const { list } = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(response => response.json());
    if (!list.length) {
      return client.say(channel, `No results found for **${args.join(' ')}**.`);
    }
    client.say(channel, list[0].definition)
  };
  if (message.toLowerCase().startsWith(`${prefix}setnick`)) {
    let currentinfo = await db.user.get(context.username);
    let nickname = args[0];

    if (currentinfo === null) {
      db.user.add(context.username, args[0], null).then(() => {
        client.say(channel, `${context.username}, you're nickname has been set to ${nickname}`);
      })
    }
    else {
      db.user.add(context.username, args[0], currentinfo.role).then(() => {
        client.say(channel, `${context.username}, you're nickname has been set to ${nickname}`);
      })
    }
  }
  if (message.toLowerCase().startsWith(`${prefix}minecraft`)) {
    const status = await getStatus("minecraft.joggerjoel.com")

    client.say(channel, `Server: minecraft.joggerjoel.com | Map: minecraft.joggerjoel.com:8123 | Online Players: ${status.players['online']} | Max Players: ${status.players['max']}`)
  }
  if (message.toLowerCase().startsWith(`${prefix}rmrole`)) {
    if (!mods.includes(context.username)) {
      client.say(channel, context.username + ", you don't have permissions to use this command!")
    }
    else {
      let user = args[0];

      db.user.delete(user).then(() => {
        client.say(channel, `removed ${user}'s roles`)
      })
    }
  }
  if (message.toLowerCase().startsWith(`${prefix}setrole`)) {
    if (!mods.includes(context.username)) {
      client.say(channel, context.username + ", you don't have permissions to use this command!")
    }
    else {
      let user = args[0];
      let rolename = message
        .split(' ')
        .slice(2)
        .join(' ');

      db.user.add(user, user, rolename).then(() => {
        client.say(channel, `assigned ${rolename} to ${user}`)
      })
    }
  }
});

client.on('message', async (channel, context, message, self) => {
  //8404b014-efd8-41d5-97e8-734d8e7984d1

  if (context['custom-reward-id'] === '8404b014-efd8-41d5-97e8-734d8e7984d1') {
    client.say(channel, `/timeout ${context.username} 1m`);
  }
});
client.on('message', async (channel, context, message, self) => {
  //eb37f197-6768-4ea9-8854-ff133f37d6ad

  if (context['custom-reward-id'] === 'eb37f197-6768-4ea9-8854-ff133f37d6ad') {
    const jokes = [
      "What rock group has four men that don't sing? Mount Rushmore.",
      'When I was a kid, my mother told me I could be anyone I wanted to be. Turns out, identity theft is a crime.',
      'What do sprinters eat before a race? Nothing, they fast!',
      'What concert costs just 45 cents? 50 Cent featuring Nickelback!',
      "Why couldn't the bicycle stand up by itself? It was two tired!",
      'Did you hear about the restaurant on the moon? Great food, no atmosphere!',
      'How many apples grow on a tree? All of them!',
      "Did you hear the rumor about butter? Well, I'm not going to spread it!",
      'I like telling Dad jokes. Sometimes he laughs!',
      'To whoever stole my copy of Microsoft Office, I will find you. You have my Word!',
      'you can find the joke on your bathroom mirror PogChamp'
    ];
    let array = jokes[Math.floor(Math.random() * jokes.length)];
    client.say(channel, array);
  }
});

client.on('message', async (channel, tags, message, self) => {
  let blacklisted = await db.blacklist.get(tags.username);
  if (blacklisted) return;
  let number = await db.point.get(tags.username);
  if (!number) {
    db.point.add(tags.username, 15);
  } else {
    db.point.set(tags.username, math.add(number.points, 1));
  }
});
client.on('message', async (channel, tags, message, self) => {
  let blacklisted = await db.blacklist.get(tags.username);
  if (blacklisted) return;
  const args = message.slice(1).split(' ');
  const command = args.shift().toLowerCase();
  if (message.startsWith(`${prefix}balance`)) {
    let number;
    let blacklist;
    if (!args.join(' ')) {
      number = await db.point.get(tags.username);

      if (!number) {
        client.say(
          channel,
          tags.username +
          ", you don't have any points yet, send more messages in chat (NO SPAMMING) to earn points!!!"
        );
      } else {
        client.say(
          channel,
          tags.username + ', you have ' + number.points + ' points'
        );
      }
    } else {
      number = await db.point.get(args.join(' '));
      blacklist = await db.blacklist.get(args.join(' '));

      if (blacklist) {
        client.say(channel, 'that user is blacklisted!');
      } else {
        if (!number) {
          client.say(
            channel,
            "the user you specified doesn't have any points yet, tell that user to send more messages in chat (NO SPAMMING) to earn points!!!"
          );
        } else {
          client.say(
            channel,
            args.join(' ') + ' has ' + number.points + ' points'
          );
        }
      }
    }
  }
  if (message.startsWith(`${prefix}items`)) {
    let items = await db.items.list();

    items.forEach(function(info) {
      client.say(channel, `${info.itemname} - ${info.price}pts`);
    });
  }
  if (message.startsWith(`${prefix}blacklist`)) {
    if (mods.includes(tags.username)) {
      db.blacklist.add(args.join(' ')).then(() => {
        client.say(channel, 'blacklisted user');
      });
    } else {
      client.say(channel, "you don't have permissions to use this command!");
    }
  }
  if (message.startsWith(`${prefix}unblacklist`)) {
    if (mods.includes(tags.username)) {
      db.blacklist.remove(args.join(' ')).then(() => {
        client.say(channel, 'unblacklisted user');
      });
    } else {
      client.say(channel, "you don't have permissions to use this command!");
    }
  }
  if (message.startsWith(`${prefix}additem`)) {
    let itemname = args[0];
    let itemprice = args[1];
    let itemresponse = message
      .split(' ')
      .slice(3)
      .join(' ');

    if (tags.username === 'selectthegang') {
      db.items.add(itemname, itemprice, itemresponse).then(() => {
        client.say(channel, 'added item...');
      });
    } else {
      client.say(channel, "you don't have permissions to use this command!");
    }
  }
  if (message.startsWith(`${prefix}buy`)) {
    let user = await db.point.get(tags.username);
    let info = await db.items.get(args[0]);

    if (!info) {
      client.say(channel, 'that item does NOT exist!');
    } else {
      if (info.price > user.points) {
        client.say(
          channel,
          'you only have ' +
          user.points +
          ` points available which is not enough for this item, this item costs ${
          info.price
          } points`
        );
      } else {
        db.point
          .set(tags.username, math.subtract(user.points, info.price), channel)
          .then(() => {
            client.say(channel, info.response);
          });
      }
    }
  }
  /*if (message.startsWith(`${prefix}eval`)) {
    let lang = args[0];
    let code = message
      .split(' ')
      .slice(2)
      .join(' ');

    ev.eval(lang, code)
      .then(data => {
        client.say(channel, data.output);
      })
      .catch(() => {
        client.say(channel, 'error');
      });
  }*/
  if (message.startsWith(`${prefix}transfer`)) {
    let sender = await db.point.get(tags.username);
    let reciever = await db.point.get(args[0]);
    if (args[0] === tags.username) {
      client.say(channel, 'you cannot give yourself points');
    } else {
      if (!sender) {
        client.say(
          channel,
          "you aren't in my database, send more messages in chat (without spamming chat) to be entered!"
        );
      }
      if (!reciever) {
        client.say(
          channel,
          "recieving user hasn't sent a message in chat before"
        );
      } else {
        if (args[1] > sender.points) {
          client.say(
            channel,
            'you only have ' +
            sender.points +
            ' points which is not enough to transfer ' +
            args[1] +
            ' points'
          );
        } else {
          db.point.set(args[0], math.add(reciever.points, args[1]));
          db.point
            .set(tags.username, math.subtract(sender.points, args[1]))
            .then(async () => {
              let newpoint = await db.point.get(tags.username);
              client.say(
                channel,
                'successfully transfered ' +
                args[1] +
                ' points, you now have ' +
                newpoint.points +
                ' points remaining'
              );
            });
        }
      }
    }
  }
});