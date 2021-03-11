const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const tmi = require('tmi.js');
let prefix = process.env.PREFIX;
const { YTSearcher } = require('ytsearcher');
const { mods, bannedUsers } = require('./roles');
const searcher = new YTSearcher({
  key: process.env.GOOGLE,
  revealkey: false,
});
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

io.on('connection', async socket => {
  client.on('message', async (channel, context, message, self) => {
    const args = message.slice(1).split(' ');
    const command = args.shift().toLowerCase();

    client.on('message', async (channel, context, message, self) => {
      if (bannedUsers.includes(context.username)) {
        return;
      }
      if (context['custom-reward-id'] === 'e36bc78c-71c9-42c8-bdef-415cba7407c1') {
        let result = await searcher.search(message);
        let date_ob = new Date();
        let hours = date_ob.getUTCHours();
        let minutes = date_ob.getUTCMinutes();
        let seconds = date_ob.getUTCSeconds();;

        let time = `${hours}:${minutes}:${seconds}`;

        let thumbnail = result.first['thumbnails'];

        socket.emit('request', context.username, result.first.url, result.first.title, thumbnail['default'].url);

        let userinfo = await db.user.get(context.username);

        if (userinfo === null) {
          client.say('chat', context.username, `requested ${result.first.title}`, context.color, null, time)
        }
        else {
          socket.emit('chat', userinfo.nickname, `requested ${result.first.title}`, context.color, userinfo.role, time)
        }

      }
    })
  })
});


io.on('connection', async socket => {
  client.on('message', async (channel, context, message, self) => {
    let date_ob = new Date();
    let hours = date_ob.getUTCHours();
    let minutes = date_ob.getUTCMinutes();
    let seconds = date_ob.getUTCSeconds();;

    let time = `${hours}:${minutes}:${seconds}`;

    if (message.startsWith(`${prefix}refresh`)) {
      socket.emit('refresh', true)
    }
    if (bannedUsers.includes(context.username)) {
      return;
    }
    if (message.startsWith(prefix)) {
      return;
    }
    if (context['custom-reward-id']) {
      return;
    }
    else {
      let userinfo = await db.user.get(context.username);

      if (userinfo === null) {
        socket.emit('chat', context.username, message, context.color, null, time)
      }
      else {
        socket.emit('chat', userinfo.nickname, message, context.color, userinfo.role, time)
      }
    }
  })
});

db = require('./database/mongo');

app.get('/chat', async (req, res) => {
  res.sendFile(`/index.html`, { root: `${__dirname}/chat` });
});
app.get('/chatcss', async (req, res) => {
  res.sendFile(`/style.css`, { root: `${__dirname}/chat` });
})
app.get('/chatjs', async (req, res) => {
  res.sendFile(`/script.js`, { root: `${__dirname}/chat` });
})
app.get('/ping', async (req, res) => {
  res.send('sent ping');
  console.log('recieved ping');
});

http.listen(3000);