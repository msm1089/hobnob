import assert from 'assert';
import ValidationError from '../../../validators/errors/validation-error';
import validator from '../../../validators/users/search';
import generateESClientSearchStub, {
  ES_SEARCH_RESULTS
} from '../../../tests/stubs/elasticsearch/client/search';

import search from '.';

const SEARCH_TERM = 'SEARCH_TERM';
const requestFactory = {
  empty() {
    return {
      query: {
        query: ''
      }
    };
  },
  nonEmpty() {
    return {
      query: {
        query: SEARCH_TERM
      }
    };
  }
};

describe('Engine - User - Search', function() {
  let db;
  let req;
  let promise;
  describe('When invoked', () => {
    beforeEach(() => {
      db = { search: generateESClientSearchStub.success() };
    });
    describe('and the search query is empty', () => {
      beforeEach(() => {
        req = requestFactory.empty();
        return search(req, db, validator, ValidationError);
      });
      it("should call the client instance's search method with the correct params", () => {
        assert.deepEqual(db.search.getCall(0).args[0], {
          index: process.env.ELASTICSEARCH_INDEX,
          type: 'user',
          _sourceExcludes: 'digest'
        });
      });
    });
    describe('and the search query is not empty', () => {
      beforeEach(() => {
        req = requestFactory.nonEmpty();
        return search(req, db, validator, ValidationError);
      });
      it("should call the client instance's search method with the correct params", () => {
        assert.deepEqual(db.search.getCall(0).args[0], {
          index: process.env.ELASTICSEARCH_INDEX,
          type: 'user',
          q: SEARCH_TERM,
          _sourceExcludes: 'digest'
        });
      });
    });
    describe('When the client.search operation is successful', () => {
      beforeEach(() => {
        promise = search(req, db, validator, ValidationError);
      });
      it('should return with a promise that resolves to an array of objects', function() {
        return promise.then(result =>
          assert.deepEqual(result, ES_SEARCH_RESULTS.hits.hits.map(hit => hit._source))
        );
      });
    });
    describe('When the client.search operation is unsuccessful', function() {
      beforeEach(function() {
        db = { search: generateESClientSearchStub.failure() };
        promise = search(req, db, validator, ValidationError);
      });
      describe('should return with a promise that rejects', function() {
        it('with an Error object', function() {
          return promise.catch(error => assert(error instanceof Error));
        });
        it("that has the mesage 'Internal Server Error'", function() {
          return promise.catch(error => assert.equal(error.message, 'Internal Server Error'));
        });
      });
    });
  });
});
