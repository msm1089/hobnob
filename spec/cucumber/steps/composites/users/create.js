import crypto from 'crypto';
import { genSaltSync, hashSync } from 'bcryptjs';
import elasticsearch from 'elasticsearch';
import Chance from 'chance';
import { Given, Before } from 'cucumber';

const chance = Chance();
const client = new elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_HOSTNAME}:${process.env.ELASTICSEARCH_PORT}`
});

Before(function() {
  return client.indices
    .delete({
      index: process.env.ELASTICSEARCH_INDEX
    })
    .then(() =>
      client.indices.create({
        index: process.env.ELASTICSEARCH_INDEX
      })
    );
});

async function createUser() {
  const user = {};
  user.email = chance.email();
  user.password = crypto.randomBytes(32).toString('hex');
  user.salt = genSaltSync(10);
  user.digest = hashSync(user.password, user.salt);
  const result = await client.index({
    index: process.env.ELASTICSEARCH_INDEX,
    type: 'user',
    body: {
      email: user.email,
      digest: user.digest
    },
    refresh: true
  });
  user.id = result._id;
  return user;
}

function createUsers(count) {
  return Promise.all(Array.from(Array(count), createUser));
}

Given(/^(\w+) new users? (?:is|are) created with random password and email$/, async function(
  amount
) {
  const count = Number.isNaN(parseInt(amount, 10)) ? 1 : parseInt(amount, 10);
  this.users = await createUsers(count);

  // Sets the first user as the default
  this.email = this.users[0].email;
  this.password = this.users[0].digest;
  this.salt = this.users[0].salt;
  this.digest = this.users[0].digest;
  this.userId = this.users[0].id;
});
