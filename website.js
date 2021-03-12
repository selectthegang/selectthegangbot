const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const tmi = require('tmi.js');
let prefix = process.env.PREFIX;
const { YTSearcher } = require('ytsearcher');
const { mods, bannedUsers } = require('./roles');
const fetch = require('node-fetch');
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

  let messages = await db.messages.list();

  messages.forEach(function(info) {
    socket.emit('chat', info.username, info.message, info.color, info.time, info.picture);
  })

})

io.on('connection', async socket => {
  client.on('message', async (channel, context, message, self) => {
    const args = message.slice(1).split(' ');
    const command = args.shift().toLowerCase();

    client.on('message', async (channel, context, message, self) => {
      let twitchprofile = await fetch(`https://api.twitch.tv/helix/users?login=${context.username}`, {
        method: 'get',
        headers: {
          "Client-ID": process.env.TWITCHCLIENT,
          "Authorization": "Bearer " + process.env.TWITCHBEARER
        },
      })
        .then(res => res.json());

      let profilepicture = twitchprofile['data'][0].profile_image_url;
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

        socket.emit('request', context.username, result.first.title, result.first.url, profilepicture, context.color, time);
      }
    });
  });
});


io.on('connection', async socket => {
  client.on('message', async (channel, context, message, self) => {
    let twitchprofile = await fetch(`https://api.twitch.tv/helix/users?login=${context.username}`, {
      method: 'get',
      headers: {
        "Client-ID": process.env.TWITCHCLIENT,
        "Authorization": "Bearer " + process.env.TWITCHBEARER
      },
    })
      .then(res => res.json());

    let profilepicture = twitchprofile['data'][0].profile_image_url;
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
        socket.emit('chat', context.username, message, context.color, time, profilepicture)
      }
      else {
        socket.emit('chat', userinfo.nickname, message, context.color, time, profilepicture)
      }
    }

  })
});

db = require('./database/mongo');

app.get('/callback', async (req, res) => {
  res.send(req.query.code);
})
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