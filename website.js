const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const tmi = require('tmi.js');
const repldb = require(`@replit/database`);
const database = new repldb();
const Meta = require('html-metadata-parser');
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
  channels: ['joggerjoel']
});
client.connect();

const bannedUsers = [
  'selectthegang_bot'
];

io.on('connection', async socket => {
  client.on('message', async (channel, context, message, self) => {
    if (bannedUsers.includes(context.username)) {
      return;
    }
    if (message.startsWith('!')) {
      return;
    }
    if (context['custom-reward-id']) {
      return;
    }
    if (message.startsWith(`https:`) || message.startsWith(`http:`)) {
      Meta.parser(message, function(err, result) {
        if (err) {
          socket.emit('chat', context.username, `unable to get website title!`, context.color, null)
        }
        else {
          socket.emit('chat', context.username, `Website Title - <a href="${message}">${result.meta.title}</a>`, context.color, null)
        }
      })
    }
    else {
      let roles = await database.get(context.username);

      socket.emit('chat', context.username, message, context.color, roles)
    }
  })
});

db = require('./database/mongo');

app.get('/chat', async (req, res) => {
  res.sendFile(`/index.html`, { root: `${__dirname}/chat` });
});

app.get('/leaderboard', async (req, res) => {
  res.sendFile(`/index.html`, { root: `${__dirname}/leaderboard` });
});

app.get('/css', async (req, res) => {
  res.sendFile(`/style.css`, { root: `${__dirname}/leaderboard` });
});

app.get('/js', async (req, res) => {
  res.sendFile(`/script.js`, { root: `${__dirname}/leaderboard` });
});

app.get('/ping', async (req, res) => {
  res.send('sent ping');
  console.log('recieved ping');
});

io.on('connection', async socket => {
  socket.on('info', async channelinfo => {
    let items = await db.items.list();

    items.forEach(function(iteminfo) {
      socket.emit('item', iteminfo.itemname, iteminfo.price);
    });

    setInterval(async function() {
      let leaderboard = await db.point.list();

      leaderboard.forEach(function(info) {
        socket.emit('board', info.username, info.points);
      });
    }, 6000);
  });
});

http.listen(3000);

console.log('server listening on port 3000');
