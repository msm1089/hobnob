import assert, { AssertionError } from 'assert';
import { decode } from 'jsonwebtoken';
import superagent from 'superagent';
import { When, Then, Given } from 'cucumber';
import elasticsearch from 'elasticsearch';
import objectPath from 'object-path';
import jsonfile from 'jsonfile';
import { getValidPayload, convertStringToArray, processPath } from './utils';

const client = new elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_PROTOCOL}://${process.env.ELASTICSEARCH_HOSTNAME}:${
    process.env.ELASTICSEARCH_PORT
  }`
});

When(
  /^the client creates a (GET|POST|PATCH|PUT|DELETE|OPTIONS|HEAD) request to ([/\w-:.]+)$/,
  function(method, path) {
    const processedPath = processPath(this, path);
    this.request = superagent(
      method,
      `${process.env.SERVER_HOSTNAME}:${process.env.SERVER_PORT}${processedPath}`
    );
  }
);

When(/^attaches a generic (.+) payload$/, function(payloadType) {
  switch (payloadType) {
    case 'malformed':
      this.request
        .send('{"email": "dan@danyll.com", name: }')
        .set('Content-Type', 'application/json');
      break;
    case 'non-JSON':
      this.request
        .send('<?xml version="1.0" encoding="UTF-8" ?><email>dan@danyll.com</email>')
        .set('Content-Type', 'text/xml');
      break;
    case 'empty':
      this.request.send().set('Content-Length', '0');
    default:
  }
});

When(/^set (?:"|')(.+)(?:"|') as a query parameter$/, function(queryString) {
  return this.request.query(queryString);
});

When(/^sends the request$/, { timeout: 3 * 1000 }, function() {
  return this.request
    .then(response => {
      this.response = response.res;
    })
    .catch(error => {
      this.response = error.response;
    });
});

Then(/^our API should respond with a ([1-5]\d{2}) HTTP status code$/, function(statusCode) {
  assert.equal(this.response.statusCode, statusCode);
});

When(/^saves the response text in the context under ([\w.]+)$/, function(contextPath) {
  objectPath.set(this, contextPath, this.response.text);
});

Then(/^the payload of the response should be an? ([a-zA-Z0-9, ]+)$/, function(payloadType) {
  const contentType =
    this.response.headers['Content-Type'] || this.response.headers['content-type'];
  if (payloadType === 'JSON object' || payloadType === 'array') {
    // Check Content-Type header
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response not of Content-Type application/json');
    }

    // Check it is valid JSON
    try {
      this.responsePayload = JSON.parse(this.response.text);
    } catch (e) {
      throw new Error('Response not a valid JSON object');
    }
  } else if (payloadType === 'string') {
    // Check Content-Type header
    if (!contentType || !contentType.includes('text/plain')) {
      throw new Error('Response not of Content-Type text/plain');
    }

    // Check it is a string
    this.responsePayload = this.response.text;
    if (typeof this.responsePayload !== 'string') {
      throw new Error('Response not a string');
    }
  }
});

Then(/^contains a message property which says (?:"|')(.*)(?:"|')$/, function(message) {
  assert.equal(this.responsePayload.message, message);
});

When(/^without a (?:"|')([\w-]+)(?:"|') header set$/, function(headerName) {
  this.request.unset(headerName);
});

When(/^attaches an? (.+) payload which is missing the ([a-zA-Z0-9., ]+) fields?$/, function(
  payloadType,
  missingFields
) {
  this.requestPayload = getValidPayload(payloadType, this);
  const fieldsToDelete = convertStringToArray(missingFields);
  fieldsToDelete.forEach(field => delete this.requestPayload[field]);
  this.request.send(JSON.stringify(this.requestPayload)).set('Content-Type', 'application/json');
});

When(
  /^attaches an? (.+) payload where the ([a-zA-Z0-9., ]+) fields? (?:is|are)(\s+not)? a ([a-zA-Z]+)$/,
  function(payloadType, fields, invert, type) {
    this.requestPayload = getValidPayload(payloadType, this);
    const typeKey = type.toLowerCase();
    const invertKey = invert ? 'not' : 'is';
    const sampleValues = {
      object: {
        is: {},
        not: 'string'
      },
      string: {
        is: 'string',
        not: 10
      }
    };
    const fieldsToModify = convertStringToArray(fields);
    fieldsToModify.forEach(field => {
      objectPath.set(this.requestPayload, field, sampleValues[typeKey][invertKey]);
    });
    this.request.send(JSON.stringify(this.requestPayload)).set('Content-Type', 'application/json');
  }
);

When(
  /^attaches an? (.+) payload where the ([a-zA-Z0-9, ]+) fields? (?:is|are) exactly (.+)$/,
  function(payloadType, fields, value) {
    this.requestPayload = getValidPayload(payloadType, this);
    const fieldsToModify = convertStringToArray(fields);
    fieldsToModify.forEach(field => {
      this.requestPayload[field] = value;
    });
    this.request.send(JSON.stringify(this.requestPayload)).set('Content-Type', 'application/json');
  }
);

When(/^attaches a valid (.+) payload$/, function(payloadType) {
  this.requestPayload = getValidPayload(payloadType, this);
  this.request.send(JSON.stringify(this.requestPayload)).set('Content-Type', 'application/json');
});

Then(
  /^the payload object should be added to the database, grouped under the "([a-zA-Z]+)" type$/,
  function(type) {
    this.type = type;
    return client
      .get({
        index: process.env.ELASTICSEARCH_INDEX,
        type,
        id: this.responsePayload
      })
      .then(result => {
        assert.deepEqual(result._source, this.requestPayload);
      });
  }
);

Then(/^the ([\w.]+) property of the response should be the same as context\.([\w.]+)$/, function(
  responseProperty,
  contextProperty
) {
  assert.deepEqual(
    objectPath.get(this.responsePayload, responseProperty === 'root' ? '' : responseProperty),
    objectPath.get(this, contextProperty)
  );
});

Then(/^the entity of type (\w+), with ID stored under ([\w.]+), should be deleted$/, function(
  type,
  idPath
) {
  return client
    .delete({
      index: process.env.ELASTICSEARCH_INDEX,
      type,
      id: objectPath.get(this, idPath),
      refresh: 'true'
    })
    .then(res => {
      assert.equal(res.result, 'deleted');
    });
});

When(/^attaches (.+) as the payload$/, function(payload) {
  this.requestPayload = JSON.parse(payload);
  this.request.send(payload).set('Content-Type', 'application/json');
});

Then(/^the ([\w.]+) property of the response should be an? ([\w.]+) with the value (.+)$/, function(
  responseProperty,
  expectedResponseType,
  expectedResponse
) {
  const parsedExpectedResponse = (function() {
    switch (expectedResponseType) {
      case 'object':
        return JSON.parse(expectedResponse);
      case 'string':
        return expectedResponse.replace(/^(?:["'])(.*)(?:["'])$/, '$1');
      default:
        return expectedResponse;
    }
  })();
  assert.deepEqual(
    objectPath.get(this.responsePayload, responseProperty === 'root' ? '' : responseProperty),
    parsedExpectedResponse
  );
});

When(/^attaches an? (.+) payload which has the additional ([a-zA-Z0-9, ]+) fields?$/, function(
  payloadType,
  additionalFields
) {
  this.requestPayload = getValidPayload(payloadType, this);
  const fieldsToAdd = convertStringToArray(additionalFields);
  fieldsToAdd.forEach(field => objectPath.set(this.requestPayload, field, 'foo'));
  this.request.send(JSON.stringify(this.requestPayload)).set('Content-Type', 'application/json');
});

Given(/^all documents of type (?:"|')([\w-]+)(?:"|') are deleted$/, function(type) {
  return client.deleteByQuery({
    index: process.env.ELASTICSEARCH_INDEX,
    type,
    body: {
      query: {
        match_all: {}
      }
    },
    conflicts: 'proceed',
    refresh: true
  });
});

Given(
  /^(\d+|all) documents in the (?:"|')([\w-]+)(?:"|') sample are added to the index with type (?:"|')([\w-]+)(?:"|')?/,
  function(count, sourceFile, type) {
    const numericCount = Number.isNaN(parseInt(count, 10)) ? Infinity : parseInt(count, 10);
    if (numericCount < 1) {
      return;
    }

    // Get the data
    // Note that we could also have used the `require` syntax
    const source = jsonfile.readFileSync(`${__dirname}/../sample-data/${sourceFile}.json`);

    // Map the data to an array of objects as expected by Elasticsearch's API
    const action = {
      index: {
        _index: process.env.ELASTICSEARCH_INDEX,
        _type: type
      }
    };
    const operations = [];
    const len = source.length;
    for (let i = 0; i < len && i < numericCount; i += 1) {
      operations.push(action);
      operations.push(source[i]);
    }

    // Do a bulk index
    // refreshing the index to make sure it is immediately searchable in subsequent steps
    return client.bulk({
      body: operations,
      refresh: 'true'
    });
  }
);

Then(/^the first item of the response should have property ([\w.]+) set to (.+)$/, function(
  path,
  value
) {
  assert.equal(objectPath.get(this.responsePayload[0], path), value);
});

Then(/^the response should contain (\d+) items$/, function(count) {
  assert.equal(this.responsePayload.length, count);
});

Then('should return the correct string when error.keyword is "pattern"', function() {
  const errors = [
    {
      keyword: 'pattern',
      dataPath: '.test.path'
    }
  ];
  const actualErrorMessage = generateValidationErrorMessage(errors);
  const expectedErrorMessage = "The '.test.path' field should be a valid bcrypt digest";
  assert.equal(actualErrorMessage, expectedErrorMessage);
});

Then(
  /^the ([\w.]+) property of the response should be the same as context\.([\w.]+) but without the ([\w.]+) fields?$/,
  function(responseProperty, contextProperty, missingFields) {
    const contextObject = objectPath.get(this, contextProperty);
    const fieldsToDelete = convertStringToArray(missingFields);
    fieldsToDelete.forEach(field => delete contextObject[field]);
    assert.deepEqual(
      objectPath.get(this.responsePayload, responseProperty === 'root' ? '' : responseProperty),
      contextObject
    );
  }
);

When(/^set a valid (.+) query string$/, function(payloadType) {
  this.query = getValidPayload(payloadType, this);
  this.request.query(this.query);
});

Then(/^the payload should be equal to context.([\w-]+)$/, function(contextpath) {
  assert.equal(this.responsePayload, objectPath.get(this, contextpath));
});

Then(/^the response string should satisfy the regular expression (.+)$/, function(regex) {
  const re = new RegExp(regex.trim().replace(/^\/|\/$/g, ''));
  assert.equal(re.test(this.responsePayload), true);
});

Then(/^the JWT payload should have a claim with name (\w+) equal to context.([\w-]+)$/, function(
  claimName,
  contextPath
) {
  const decodedTokenPayload = decode(this.responsePayload);
  if (decodedTokenPayload === null) {
    throw new AssertionError();
  }
  assert.equal(decodedTokenPayload[claimName], objectPath.get(this, contextPath));
});

When(/^set the HTTP header field (?:"|')?([\w-]+)(?:"|')? to (?:"|')?(.+)(?:"|')?$/, function(
  headerName,
  value
) {
  this.request.set(headerName, value);
});

When(/^sets the Authorization header to a valid token$/, function() {
  this.request.set('Authorization', `Bearer ${this.token}`);
});

When(/^sets the Authorization header to a token with wrong signature$/, function() {
  // Appending anything to the end of the signature will invalidate it
  const tokenWithInvalidSignature = `${this.token}a`;
  this.request.set('Authorization', `Bearer ${tokenWithInvalidSignature}`);
});
