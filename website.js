const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const tmi = require('tmi.js');
let prefix = process.env.PREFIX;
const { mods, bannedUsers } = require('./roles');
const fetch = require('node-fetch');
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
    socket.emit(
      'chat',
      info.username,
      info.message,
      info.color,
      info.time,
      info.picture
    );
  });

  client.on('message', async (channel, context, message, self) => {
    const args = message.slice(1).split(' ');
    const command = args.shift().toLowerCase();
    let twitchprofile = await fetch(
      `https://api.twitch.tv/helix/users?login=${context.username}`,
      {
        method: 'get',
        headers: {
          'Client-ID': process.env.TWITCHCLIENT,
          Authorization: 'Bearer ' + process.env.TWITCHBEARER
        }
      }
    ).then(res => res.json());

    let profilepicture = twitchprofile['data'][0].profile_image_url;
    if (bannedUsers.includes(context.username)) {
      return;
    }
  });
});

io.on('connection', async socket => {
  client.on('message', async (channel, context, message, self) => {
    const args = message.slice(1).split(' ');
    const command = args.shift().toLowerCase();

    let blacklisted = await db.blacklist.get(context.username);

    if (blacklisted) {
      return;
    }

    let twitchprofile = await fetch(
      `https://api.twitch.tv/helix/users?login=${context.username}`,
      {
        method: 'get',
        headers: {
          'Client-ID': process.env.TWITCHCLIENT,
          Authorization: 'Bearer ' + process.env.TWITCHBEARER
        }
      }
    ).then(res => res.json());

    let profilepicture = twitchprofile['data'][0].profile_image_url;
    const moment = require('moment-timezone');
    let now = moment();
    let correcttime = now.tz('America/New_York');

    let time = correcttime.format('h:mm:ssa');

    if (message.startsWith(`${prefix}refresh`)) {
      socket.emit('refresh', true);
    }
    if (message.startsWith(`${prefix}clear`)) {
      let info = await db.messages.list();

      info.forEach(function(lol) {
        db.messages.remove(lol.username);
      });
      socket.emit('refresh', true);
    }

    if (bannedUsers.includes(context.username)) {
      return;
    }
    
   /* if (message.startsWith(`${prefix}play`)) {
      function youtube_parser(url) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        
        /*
        var match = url.match(regExp);
        return (match && match[7].length == 11) ? match[7] : false;
      }
      if (mods.includes(context.username)) {
        socket.emit(
          'request',
          context.username,
          youtube_parser(args[0]),
          profilepicture,
          context.color,
          time
        );
      }
      else {
        return;
      }
    }
    */
    if (message.startsWith(`${prefix}rickroll`)){
      socket.emit(
          'request',
          context.username,
          'dQw4w9WgXcQ',
          profilepicture,
          context.color,
          time
        );
    }
    if (message.startsWith(prefix)) {
      return;
    }

    if (
      context['custom-reward-id'] === 'e36bc78c-71c9-42c8-bdef-415cba7407c1'
    ) {
      function youtube_parser(url) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = url.match(regExp);
        return (match && match[7].length == 11) ? match[7] : false;
      }

      socket.emit(
        'request',
        context.username,
        youtube_parser(message),
        profilepicture,
        context.color,
        time
      );
    } else {
      let userinfo = await db.user.get(context.username);

      if (userinfo === null) {
        socket.emit(
          'chat',
          context.username,
          message,
          context.color,
          time,
          profilepicture
        );
      } else {
        socket.emit(
          'chat',
          userinfo.nickname,
          message,
          context.color,
          time,
          profilepicture
        );
      }
    }
  });
});

db = require('./database/mongo');

app.get('/callback', async (req, res) => {
  res.send(req.query.code);
});
app.get('/chat', async (req, res) => {
  res.sendFile(`/index.html`, { root: `${__dirname}/chat` });
});
app.get('/commands', async (req, res) => {
  res.sendFile(`/index.html`, { root: `${__dirname}/commands` });
})
app.get('/commandscss', async (req, res) => {
  res.sendFile(`/style.css`, { root: `${__dirname}/commands` });
})
app.get('/commandsjs', async (req, res) => {
  res.sendFile(`/script.js`, { root: `${__dirname}/commands` });
})
app.get('/chatcss', async (req, res) => {
  res.sendFile(`/style.css`, { root: `${__dirname}/chat` });
});
app.get('/chatjs', async (req, res) => {
  res.sendFile(`/script.js`, { root: `${__dirname}/chat` });
});
app.get('/ping', async (req, res) => {
  res.send('sent ping');
  console.log('recieved ping');
});

http.listen(3000);
