const tmi = require('tmi.js');
const math = require('mathjs');
const website = require('./website');
let prefix = process.env.PREFIX;
const { mods, bannedUsers } = require('./roles');
const { getStatus } = require('mc-server-status');
const Eval = require('open-eval');
const ev = new Eval();
const config = require('./twitterconfig');
const twitter = require('twitter-lite');
const tweet = new twitter(config);
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

client.connect().then(async () => {
	db.connect(process.env.MONGO);
});

client.on('message', async (channel, context, message, self) => {
	let blacklisted = await db.blacklist.get(context.username);
	if (blacklisted) return;
	const args = message.slice(1).split(' ');
	const command = args.shift().toLowerCase();
	const fetch = require('node-fetch');

	if (message.startsWith(`${prefix}eval`)) {
		let lang = args[0];
		let code = message
			.split(' ')
			.slice(2)
			.join(' ');

		ev.eval(lang, code)
			.then(data => client.say(channel, `${data.output}`))
			.catch(() => {
				client.say(
					channel,
					`my systems are currently experiencing issues, please try again later!`
				);
			});
	}

	if (message.startsWith(`${prefix}messageid`)) {
		let info = await db.messages.get(args.join(' '));
		client.say(channel, '! ' + info.id);
	}
	if (message.startsWith(`${prefix}messagecount`)) {
		let info = await db.messages.list();
		let number = Object.keys(info).length;

		if (number === 0) {
			client.say(channel, `! there are no messages on the chat overlay!`);
		} else {
			client.say(channel, `! there is ${number} messages on the chat overlay!`);
		}
	}
	if (message.startsWith(`${prefix}tweet`)) {
		tweet
			.post('statuses/update', { status: args.join(' ') })
			.then(result => {
				client.say(channel, `successfully tweeted!`);
			})
			.catch(console.error);
	}
	if (message.startsWith(`${prefix}vanish`)) {
		client.say(channel, `/timeout ${context.username} 1s`);
	}
	if (message.startsWith(`${prefix}commands`)) {
		client.say(channel, `https://selectthegang.tk/commands`);
	}
	if (message.startsWith(`${prefix}add`)) {
		db.todo.add(args.join(' '));
		client.say(channel, `added to TODO list.`);
	}
	if (message.startsWith(`${prefix}remove`)) {
		db.todo.remove(args.join(' '));
		client.say(channel, `removed from TODO list.`);
	}
	if (message.startsWith(`${prefix}todo`)) {
		let info = await db.todo.list();
		info.forEach(function(e) {
			client.say(channel, e.message);
		});
	}
	if (message.startsWith(`${prefix}stream`)) {
		let channelname = channel.replace('#', '');
		let stream = await fetch(
			`https://api.twitch.tv/helix/streams?user_login=${channelname}`,
			{
				method: 'get',
				headers: {
					'Client-ID': process.env.TWITCHCLIENT,
					Authorization: 'Bearer ' + process.env.TWITCHBEARER
				}
			}
		).then(res => res.json());

		let info = stream['data'][0];

		client.say(
			channel,
			`! Title: ${info.title} | Category: ${info.game_name} | Viewer Count: ${
				info.viewer_count
			}`
		);
	}

	if (message.startsWith(`${prefix}info`)) {
		if (!args[0]) {
			twitchprofile = await fetch(
				`https://api.twitch.tv/helix/users?login=${context.username}`,
				{
					method: 'get',
					headers: {
						'Client-ID': process.env.TWITCHCLIENT,
						Authorization: 'Bearer ' + process.env.TWITCHBEARER
					}
				}
			).then(res => res.json());
		} else {
			twitchprofile = await fetch(
				`https://api.twitch.tv/helix/users?login=${args.join(' ')}`,
				{
					method: 'get',
					headers: {
						'Client-ID': process.env.TWITCHCLIENT,
						Authorization: 'Bearer ' + process.env.TWITCHBEARER
					}
				}
			).then(res => res.json());
		}
		let displayname = twitchprofile['data'][0].display_name;
		let description = twitchprofile['data'][0].description;

		if (description === '') {
			client.say(channel, `no information found!`);
		} else {
			client.say(
				channel,
				`Display Name: ${displayname} | Description: ${description}`
			);
		}
	}
	if (message.startsWith(`${prefix}timeout`)) {
		if (!mods.includes(context.username)) {
			return client.say(
				channel,
				`you don't have permissions to use this command!`
			);
		} else {
			client.say(channel, `/timeout ${args[0]} ${args[1]}`);
			client.say(channel, `timed ${args[0]} out for ${args[1]}`);
		}
	}

	if (message.startsWith(`${prefix}ban`)) {
		let reason = args[1];
		if (!mods.includes(context.username)) {
			return client.say(
				channel,
				`you don't have permissions to use this command!`
			);
		}
		if (!args[0]) {
			client.say(channel, `you didn't specify a username to ban`);
		} else {
			client.say(channel, `/ban ${args[0]}`);
			client.say(channel, `banned ${args[0]}`);
		}
	}

	if (message.startsWith(`${prefix}untimeout`)) {
		if (!mods.includes(context.username)) {
			return client.say(
				channel,
				`you don't have permissions to use this command!`
			);
		} else {
			client.say(channel, `/untimeout ${args[0]}`);
			client.say(channel, `untimed ${args[0]}`);
		}
	}

	if (message.startsWith(`${prefix}unban`)) {
		if (!mods.includes(context.username)) {
			return client.say(
				channel,
				`you don't have permissions to use this command!`
			);
		} else {
			client.say(channel, `/unban ${args[0]}`);
			client.say(channel, `unbanned ${args[0]}`);
		}
	}

	const querystring = require('querystring');

	if (message.startsWith(`${prefix}urban`)) {
		if (!args.join(' ')) {
			return client.say(channel, 'You need to supply a search term!');
		}

		const query = querystring.stringify({ term: args.join(' ') });

		const { list } = await fetch(
			`https://api.urbandictionary.com/v0/define?${query}`
		).then(response => response.json());
		if (!list.length) {
			return client.say(channel, `No results found for **${args.join(' ')}**.`);
		}
		client.say(channel, list[0].definition);
	}
	if (message.toLowerCase().startsWith(`${prefix}minecraft`)) {
		const status = await getStatus('minecraft.joggerjoel.com');

		client.say(
			channel,
			`Server: minecraft.joggerjoel.com | Map: minecraft.joggerjoel.com:8123 | Online Players: ${
				status.players['online']
			} | Max Players: ${status.players['max']}`
		);
	}
});

client.on('message', async (channel, context, message, self) => {
	//8404b014-efd8-41d5-97e8-734d8e7984d1

	if (context['custom-reward-id'] === '8404b014-efd8-41d5-97e8-734d8e7984d1') {
		client.say(channel, `/timeout ${context.username} 1m`);
	}
});
client.on('message', async (channel, context, message, self) => {
	//77f5414b-a573-4ed6-a339-4f1e0dd6eb0b

	if (context['custom-reward-id'] === '77f5414b-a573-4ed6-a339-4f1e0dd6eb0b') {
		client.say(channel, `/ban ${context.username}`);
		client.say(channel, `RIP ${context.username}`);
		setTimeout(function() {
			client.say(channel, `/unban ${context.username}`);
		}, 60000);
	}
});
client.on('message', async (channel, context, message, self) => {
	//9c8c88c7-aec6-435f-99aa-e21fe3025f20

	if (context['custom-reward-id'] === '9c8c88c7-aec6-435f-99aa-e21fe3025f20') {
		client.say(channel, `/color ${message}`);
		client.say(channel, `changed color!`);
	}
});
client.on('message', async (channel, context, message, self) => {
	//d4c2e8bc-53d2-465c-b2b2-9902728ccbd7

	if (context['custom-reward-id'] === 'd4c2e8bc-53d2-465c-b2b2-9902728ccbd7') {
		client.say(channel, `/commercial 60`);
		client.say(
			channel,
			`we will be back after the 1 minute ad break as ${
				context.username
			} redeemed the reward!`
		);
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
	let userinfo = await db.user.get(tags.username);

	const fetch = require('node-fetch');

	let twitchprofile = await fetch(
		`https://api.twitch.tv/helix/users?login=${tags.username}`,
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

	if (tags['custom-reward-id']) {
		return;
	}
	if (bannedUsers.includes(tags.username)) {
		return;
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
	}
	if (userinfo === null) {
		db.messages.add(
			tags.username,
			message,
			tags.color,
			time,
			profilepicture,
			tags['id']
		);
	} else {
		db.messages.add(
			userinfo.nickname,
			message,
			tags.color,
			time,
			profilepicture,
			tags['id']
		);
	}
});

client.on('message', async (channel, tags, message, self) => {
	let blacklisted = await db.blacklist.get(tags.username);
	if (blacklisted) return;
	const args = message.slice(1).split(' ');
	const command = args.shift().toLowerCase();

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
});
