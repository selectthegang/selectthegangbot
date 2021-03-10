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
  channels: ['joggerjoel', 'selectthegang']
});
client.connect();

const bannedUsers = [
  'selectthegang_bot'
];

io.on('connection', async socket => {
  client.on('message', async (channel, context, message, self) => {
    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();


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
      let userinfo = await db.user.get(context.username);

      Meta.parser(message, function(err, result) {
        if (err) {
          if (userinfo === null) {
            socket.emit('chat', context.username, `unable to get website title!`, context.color, null, `${month}/${date}/${year} - ${hours}:${minutes}:${seconds}`)
          }
          else {
            socket.emit('chat', userinfo.nickname, `unable to get website title!`, context.color, userinfo.role, `${month}/${date}/${year} - ${hours}:${minutes}:${seconds}`)
          }
        }
        else {
          if (userinfo === null) {
            socket.emit('chat', context.username, `Website Title - <a href="${message}">${result.meta.title}</a>`, context.color, null, `${month}/${date}/${year} - ${hours}:${minutes}:${seconds}`)
          }
          else {
            socket.emit('chat', userinfo.nickname, `Website Title - <a href="${message}">${result.meta.title}</a>`, context.color, userinfo.role, `${month}/${date}/${year} - ${hours}:${minutes}:${seconds}`)
          }
        }
      })
    }
    else {
      let userinfo = await db.user.get(context.username);

      if (userinfo === null) {
        socket.emit('chat', context.username, message, context.color, null, `${month}/${date}/${year} - ${hours}:${minutes}:${seconds}`)
      }
      else {
        socket.emit('chat', userinfo.nickname, message, context.color, userinfo.role, `${month}/${date}/${year} - ${hours}:${minutes}:${seconds}`)
      }
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
