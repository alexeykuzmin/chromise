'use strict';

describe('wrapping', () => {

  it('wraps API functions', () => {
    chromise.tabs.update.should.be.a.function;
  });

  it('does not wrap constructors', () => {
    chromise.events.should.not.have.ownProperty('Event');
  });

  it('does not wrap events', () => {
    chromise.tabs.should.not.have.ownProperty('onUpdated');
  });

  it('does not wrap enums', () => {
    chromise.runtime.should.not.have.ownProperty('PlatformOS');
  });

  it('does not wrap constants', () => {
    chromise.tabs.should.not.have.ownProperty('TAB_ID_NONE');
  });
});

describe('wrapped function', () => {

  describe('call', () => {

    before(() => {
      sinon.stub(chrome.tabs, 'update');
    });

    after(() => {
      chrome.tabs.update.restore();
    });

    it('executes original API function', () => {
      chromise.tabs.update();
      chrome.tabs.update.should.be.calledOnce;
    });

    it('passes arguments to original API function call', () => {
      chromise.tabs.update(42, {url: 'http://example.com'});
      chrome.tabs.update.should.be.calledWith(
          42, {url: 'http://example.com'});
    });

    it('adds callback as last argument to original API function call', () => {
      chromise.tabs.update(42, {url: 'http://example.com'});
      chrome.tabs.update.should.be.calledWithExactly(
          42, {url: 'http://example.com'}, sinon.match.func);
    });

    it('returns Promise', () => {
      chromise.tabs.update().should.be.instanceof(Promise);
    });
  });

  describe('finishes correctly, and returned promise', () => {

    before(() => {
      this.callbackArguments = [];
      sinon.stub(chrome.tabs, 'update', callback => {
        callback.apply(null, this.callbackArguments);
      });
    });

    after(() => {
      chrome.tabs.update.restore();
    });

    it('eventually becomes fulfilled', done => {
      chromise.tabs.update()
          .should.eventually.be.fulfilled
          .and.notify(done);
    });

    describe('value', () => {

      it('is a single value if it is the only value in API response', done => {
        this.callbackArguments = [42];
        chromise.tabs.update()
            .should.eventually.be.equal(42)
            .and.notify(done);
      });

      it('is an array if there are several values in API response', done => {
        this.callbackArguments = [42, 'http://example.com'];
        chromise.tabs.update()
            .should.eventually.be.eql(this.callbackArguments)
            .and.notify(done);
      });
    });
  });

  describe('finishes with error, and returned promise', () => {

    before(() => {
      this.ERROR_MESSAGE = 'Unknown error';
      sinon.stub(chrome.tabs, 'update', (callback) => {
        chrome.runtime.lastError = {message: this.ERROR_MESSAGE};
        callback();
      });
    });

    after(() => {
      chrome.tabs.update.restore();
      chrome.runtime.lastError = undefined;
    });

    it('eventually becomes rejected', done => {
      chromise.tabs.update()
          .should.eventually.be.rejected
          .and.notify(done);
    });

    it('gets API error message', done => {
      chromise.tabs.update().catch((error) => {
        expect(error).to.be.an.instanceof(Error);
        error.message.should.be.equal(this.ERROR_MESSAGE);
      }).should.notify(done);
    });
  });

  describe('throws an exception, and returned promise', () => {

    before(() => {
      this.exceptionMessage = 'Something bad happened';
      sinon.stub(chrome.tabs, 'update')
          .throws('Error', this.exceptionMessage);
    });

    after(() => {
      chrome.tabs.update.restore();
    });

    it('eventually becomes rejected', done => {
      chromise.tabs.update()
          .should.eventually.be.rejected
          .and.notify(done);
    });

    it('gets exception message', done => {
      chromise.tabs.update().catch((error) => {
        expect(error).to.be.an.instanceof(Error);
        error.message.should.be.equal(this.exceptionMessage);
      }).should.notify(done);
    });
  });
});
