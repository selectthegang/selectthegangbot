const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const tmi = require('tmi.js');
let prefix = process.env.PREFIX;
const { mods, bannedUsers, colors } = require('./roles');
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
	channels: ['joggerjoel']
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
			info.picture,
			info.id,
			info.verified
		);
	});

	io.on('connection', async socket => {
		socket.on('remove', id => {
			db.messages.remove(id);
		});
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

		let time = correcttime.format('h:mma');
		if (message.startsWith(`!stopvideo`)) {
			socket.emit('refreshVid', true);
		}
		if (message.startsWith(`${prefix}play`)) {
			let badges = context.badges;

			if (badges.moderator === '1') {
				function youtube_parser(url) {
					var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
					var match = url.match(regExp);
					return match && match[7].length == 11 ? match[7] : false;
				}
				socket.emit(
					'request',
					context.username,
					youtube_parser(message),
					profilepicture,
					context.color,
					time
				);
			} else if (badges.vip === '1') {
				function youtube_parser(url) {
					var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
					var match = url.match(regExp);
					return match && match[7].length == 11 ? match[7] : false;
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
				return;
			}
		}

		if (context['custom-reward-id']) {
			return;
		}
		if (message.startsWith(`${prefix}redirect`)) {
			if (mods.includes(context.username)) {
				socket.emit('redirect', args.join(' '));
			} else {
				return;
			}
		}
		if (message.startsWith(`${prefix}refresh`)) {
			if (mods.includes(context.username)) {
				socket.emit('refresh', true);
			} else {
				return;
			}
		}
		if (message.startsWith(`${prefix}clear`)) {
			if (mods.includes(context.username)) {
				let info = await db.messages.list();

				info.forEach(function(lol) {
					db.messages.remove(lol.id);
				});
				socket.emit('refresh', true);
			} else {
				return;
			}
		}
		if (bannedUsers.includes(context.username)) {
			return;
		}
		if (message === `${prefix}rickroll`) {
			socket.emit(
				'request',
				context.username,
				'dQw4w9WgXcQ',
				profilepicture,
				context.color,
				time
			);
			socket.emit(
				'chat',
				context.username,
				'get rickrolled!',
				context.color,
				time,
				profilepicture,
				'none'
			);
		}
		if (message.startsWith(`${prefix}lofi`)) {
			socket.emit(
				'request',
				context.username,
				'5qap5aO4i9A',
				profilepicture,
				context.color,
				time
			);
		}
		if (message.startsWith(prefix)) {
			return;
		}
		if (message.startsWith(`Mc_`)) {
			return;
		}
		if (message.startsWith(`_`)) {
			return;
		}
		if (message.startsWith(`bot`)) {
			return;
		} else {
			let userinfo = await db.user.get(context.username);

			if (userinfo === null) {
				socket.emit(
					'chat',
					context.username,
					message,
					context.color,
					time,
					profilepicture,
					context['id'],
					false
				);
			} else {
				socket.emit(
					'chat',
					userinfo.nickname,
					message,
					context.color,
					time,
					profilepicture,
					context['id'],
					userinfo.verified
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
});
app.get('/commandscss', async (req, res) => {
	res.sendFile(`/style.css`, { root: `${__dirname}/commands` });
});
app.get('/videos', async (req, res) => {
	res.sendFile(`/index.html`, { root: `${__dirname}/video` });
});
app.get('/videojs', async (req, res) => {
	res.sendFile(`/script.js`, { root: `${__dirname}/video` });
});
app.get('/commandsjs', async (req, res) => {
	res.sendFile(`/script.js`, { root: `${__dirname}/commands` });
});
app.get('/chatcss', async (req, res) => {
	res.sendFile(`/style.css`, { root: `${__dirname}/chat` });
});
app.get('/chatjs', async (req, res) => {
	res.sendFile(`/script.js`, { root: `${__dirname}/chat` });
});

app.get('/intro', async (req, res) => {
	res.sendFile(`/index.html`, { root: `${__dirname}/intro` });
});
app.get('/introcss', async (req, res) => {
	res.sendFile(`/style.css`, { root: `${__dirname}/intro` });
});
app.get('/introjs', async (req, res) => {
	res.sendFile(`/script.js`, { root: `${__dirname}/intro` });
});
app.get('/logo', async (req, res) => {
	res.sendFile(`/logo.jpg`, { root: __dirname });
});
app.get('/ping', async (req, res) => {
	res.send('sent ping');
	console.log('recieved ping');
});

http.listen(3000);
