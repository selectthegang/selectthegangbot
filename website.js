const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const urlRegex = require('url-regex');
const getTitleAtUrl = require('get-title-at-url');
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
	channels: ['joggerjoel', 'jlabelle71']
});
client.connect();

io.on('connection', async socket => {
	let messages = await db.messages.list();

	messages.forEach(function(info) {
		let url = info.message.match(urlRegex());

		if (url === null) {
			socket.emit(
				'chat',
				info.username,
				info.message,
				info.color,
				info.time,
				info.picture,
				info.id
			);
		} else {
			getTitleAtUrl(url[0], function(title) {
				socket.emit(
					'chat',
					info.username,
					info.message.replace(url[0], `<a href="${url[0]}">${title}</a>`),
					info.color,
					info.time,
					info.picture,
					info.id
				);
			});
		}
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
		if (
			context['custom-reward-id'] === 'e36bc78c-71c9-42c8-bdef-415cba7407c1'
		) {
			let info = await db.video.get('1');
			function youtube_parser(url) {
				var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
				var match = url.match(regExp);
				return match && match[7].length == 11 ? match[7] : false;
			}

			function playVideo() {
				socket.emit(
					'request',
					context.username,
					youtube_parser(message),
					profilepicture,
					context.color,
					time
				);
			}

			function playNextVideo() {
				socket.emit('refresh', true);
				setTimeout(function() {
					socket.emit(
						'request',
						context.username,
						youtube_parser(message),
						profilepicture,
						context.color,
						time
					);
				}, 3000);
				db.video.add('1');
				setTimeout(function() {
					db.video.remove('1');
				}, 300000);
			}
			playVideo();
			/*	if (info === null) {
				playVideo();
			} else {
				setTimeout(function() {
					playNextVideo();
				}, 300000);
			}*/
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
			let youtube = await db.video.get('1');
			if (mods.includes(context.username)) {
				if (youtube === null) {
					socket.emit('refresh', true);
					db.video.remove('1');
				} else {
					socket.emit('refresh', true);
				}
			} else {
				return;
			}
		}
		if (message.startsWith(`${prefix}yt_clear`)) {
			db.video.remove('1');
		}
		if (message.startsWith(`${prefix}rm`)) {
			let id = args[0];
			if (mods.includes(context.username)) {
				db.messages.remove(id);
				socket.emit('remove', id);
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
			let url = message.match(urlRegex());

			if (url === null) {
				if (userinfo === null) {
					socket.emit(
						'chat',
						context.username,
						message,
						context.color,
						time,
						profilepicture,
						context['id']
					);
				} else {
					socket.emit(
						'chat',
						userinfo.nickname,
						message,
						context.color,
						time,
						profilepicture,
						context['id']
					);
				}
			} else {
				getTitleAtUrl(url[0], function(title) {
					if (userinfo === null) {
						socket.emit(
							'chat',
							context.username,
							message.replace(url[0], `<a href="${url[0]}">${title}</a>`),
							context.color,
							time,
							profilepicture,
							context['id']
						);
					} else {
						socket.emit(
							'chat',
							userinfo.nickname,
							message.replace(url[0], `<a href="${url[0]}">${title}</a>`),
							context.color,
							time,
							profilepicture,
							context['id']
						);
					}
				});
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
