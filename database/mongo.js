const mongoose = require('mongoose');
const pointSchema = require('./schema/pointSchema');
const blacklistSchema = require('./schema/blacklistSchema');
const itemSchema = require('./schema/itemSchema');

module.exports = {
  pointSchema: require('./schema/pointSchema'),
  blacklistSchema: require('./schema/blacklistSchema'),
  itemSchema: require('./schema/itemSchema'),

  async connect(uri) {
    await mongoose.connect(
      uri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      }
    );
  },
  items: {
    async get(itemname) {
      const res = await itemSchema.findOne({ itemname: itemname });
      return res;
    },
    async list() {
      const data = await itemSchema.find();
      return data;
    },
    async add(itemname, price, response) {
      const add = await itemSchema.findOneAndUpdate(
        {
          itemname: itemname,
          price: price,
          response: response
        },
        {
          itemname: itemname,
          price: price,
          response: response
        },
        {
          upsert: true
        }
      );
    }
  },
  point: {
    async list() {
      const data = await pointSchema.find();
      return data;
    },
    async get(username) {
      const res = await pointSchema.findOne({ username: username });
      return res;
    },
    async add(username, number) {
      const add = await pointSchema.findOneAndUpdate(
        {
          username: username,
          points: number,
        },
        {
          username: username,
          points: number,
        },
        {
          upsert: true
        }
      );
    },
    async set(username, number) {
      return await pointSchema.deleteOne({ username: username }).then(
        await pointSchema.findOneAndUpdate(
          {
            username: username,
            points: number,
          },
          {
            username: username,
            points: number,
          },
          {
            upsert: true
          }
        )
      );
    }
  },
  blacklist: {
    async get(username) {
      const res = await blacklistSchema.findOne({ username: username });
      return res;
    },
    async add(username, number) {
      const add = await blacklistSchema.findOneAndUpdate(
        {
          username: username
        },
        {
          username: username
        },
        {
          upsert: true
        }
      );
    },
    async remove(username, number) {
      const res = await pointSchema.deleteOne({ username: username });
      return res;
    }
  }
};
