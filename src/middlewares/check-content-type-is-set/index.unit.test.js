import assert from 'assert';
import deepClone from 'lodash.clonedeep';
import deepEqual from 'lodash.isequal';
import { spy, stub } from 'sinon';
import checkContentTypeIsSet from '.';

describe('checkContentTypeIsSet', function() {
  let req;
  let res;
  let next;
  describe('when request has non-empty payload and the content-type header is set', function() {
    let clonedRes;

    beforeEach(function() {
      req = {
        method: 'GET',
        headers: {
          'content-length': 1,
          'content-type': 'application/json'
        }
      };
      res = {};
      next = spy();
      clonedRes = deepClone(res);
      checkContentTypeIsSet(req, res, next);
    });

    it('should not modify res', function() {
      assert(deepEqual(res, clonedRes));
    });

    it('should call next() once', function() {
      assert(next.calledOnce);
    });
  });

  describe('when request has non-empty payload and the content-type header is not set', function() {
    let resJsonReturnValue;
    let returnedValue;

    beforeEach(function() {
      req = {
        method: 'GET',
        headers: {
          'content-length': 1
        }
      };
      resJsonReturnValue = {};
      res = {
        status: spy(),
        set: spy(),
        json: stub().returns(resJsonReturnValue)
      };
      next = spy();
      returnedValue = checkContentTypeIsSet(req, res, next);
    });

    describe('should call res.status()', function() {
      it('once', function() {
        assert(res.status.calledOnce);
      });
      it('with the argument 400', function() {
        assert(res.status.calledWithExactly(400));
      });
    });

    describe('should call res.set()', function() {
      it('once', function() {
        assert(res.set.calledOnce);
      });
      it('with the arguments "Content-Type" and "application/json"', function() {
        assert(res.set.calledWithExactly('Content-Type', 'application/json'));
      });
    });

    describe('should call res.json()', function() {
      it('once', function() {
        assert(res.json.calledOnce);
      });
      it('with the correct error object', function() {
        assert(
          res.json.calledWithExactly({
            message: 'The "Content-Type" header must be set for requests with a non-empty payload'
          })
        );
      });
    });
    it('should not call next()', function() {
      assert(next.notCalled);
    });
    it('should return whatever res.json() returns', function() {
      assert.strictEqual(returnedValue, resJsonReturnValue);
    });
  });
});
