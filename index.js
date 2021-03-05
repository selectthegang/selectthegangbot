const tmi = require('tmi.js');
const math = require('mathjs');
const website = require('./website');
let prefix = process.env.PREFIX;
const Eval = require('open-eval');
const ev = new Eval();
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
	channels: ['selectthegang', 'jeffblankenburg', 'joggerjoel']
});

client.connect().then(() => {
	db.connect(process.env.MONGO);
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
					"you don't have any points yet, send more messages in chat (NO SPAMMING) to earn points!!!"
				);
			} else {
				client.say(channel, 'you have ' + number.points + ' points');
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
	if (message.startsWith(`${prefix}blacklist`)) {
		if (tags.username === 'selectthegang') {
			db.blacklist.add(args.join(' ')).then(() => {
				client.say(channel, 'blacklisted user');
			});
		} else {
			client.say(channel, "you don't have permissions to use this command!");
		}
	}
	if (message.startsWith(`${prefix}unblacklist`)) {
		if (tags.username === 'selectthegang') {
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
					.set(tags.username, math.subtract(user.points, info.price))
					.then(() => {
						client.say(channel, info.response);
					});
			}
		}
	}
	if (message.startsWith(`${prefix}eval`)) {
		let lang = args[0];
		let code = message
			.split(' ')
			.slice(2)
			.join(' ');

		ev.eval(lang, code).then(data => client.say(channel, data.output));
	}
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
