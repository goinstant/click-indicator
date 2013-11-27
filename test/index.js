/*jshint browser:true */
/*global require */

/**
 * @fileOverview
 * Contains unit tests for the ClickIndicator component
 */

describe('Click Indicator', function() {

  'use strict';

  var assert = window.assert;
  var ClickIndicator = require('click-indicator');
  var mockRoom = {};
  var clickIndicator;

  describe('Constructor', function() {

    it('Only requires a room option.', function() {
      clickIndicator = new ClickIndicator({ room: mockRoom });
      clickIndicator._view.destroy();
    });

    it ('Accepts valid namePlates option.', function() {
      var opts = {
        room: mockRoom,
        namePlates: false
      };

      clickIndicator = new ClickIndicator(opts);
      clickIndicator._view.destroy();
    });

    it ('Accepts valid element option.', function() {
      var opts = {
        room: mockRoom,
        element: document.body
      };

      clickIndicator = new ClickIndicator(opts);
      clickIndicator._view.destroy();
    });

    it('Throws if missing a room', function() {
      assert.exception(function() {
        clickIndicator = new ClickIndicator({});
      }, /Invalid room option./);
    });

    it ('Throws if non-boolean namePlate option is passed.', function() {
      var opts = {
        room: mockRoom,
        namePlates: 'true'
      };

      assert.exception(function() {
        clickIndicator = new ClickIndicator(opts);
      }, /Invalid name plate option./);
    });

    it ('Throws if non-DOM element element option is passed.', function() {
      var opts = {
        room: mockRoom,
        element: 'document.body'
      };

      assert.exception(function() {
        clickIndicator = new ClickIndicator(opts);
      }, /Invalid element option./);
    });

    it('Throws if non-number displayTimer option is passed.', function() {
      var opts = {
        room: mockRoom,
        displayTimer: { timer: 4000 }
      };

      assert.exception(function() {
        clickIndicator = new ClickIndicator(opts);
      }, /Invalid displayTimer option./);
    });

    it('Throws if non-string namespace option is passed.', function() {
      var opts = {
        room: mockRoom,
        namespace: true
      };

      assert.exception(function() {
        clickIndicator = new ClickIndicator(opts);
      }, /Invalid namespace option./);
    });

    it('Throws if unexpected options are passed.', function() {
      var opts = {
        room: mockRoom,
        foo: '1',
        bar: '2'
      };

      assert.exception(function() {
        clickIndicator = new ClickIndicator(opts);
      }, /Unsupported options:foo,bar/);
    });
  });

  describe('Register Listeners', function() {

    var mockChannel;
    var mockUser;
    var mockView;
    var mockUserCache;

    beforeEach(function(done) {

      mockUser = {
        userId: 'fakeId'
      };

      mockChannel = {
        message: sinon.stub(),
        on: sinon.stub(),
        off: sinon.stub()
      };

      mockView = {
        addIndicator: sinon.stub()
      };

      mockUserCache = {
        initialize: sinon.stub().yields(),
        destroy: sinon.stub().yields(),
        getUser: sinon.stub().returns({ id: 'remoteUser' }),
        getLocalUser: sinon.stub().returns(mockUser)
      };

      mockRoom.user = sinon.stub().yields(null, mockUser);
      mockRoom.channel = sinon.stub().returns(mockChannel);

      clickIndicator = new ClickIndicator({ room: mockRoom });
      clickIndicator._userCache = mockUserCache;
      clickIndicator._indicatorHandler._userCache = mockUserCache;
      clickIndicator.initialize(done);
    });

    afterEach(function(done) {
      clickIndicator.destroy(done);
    });

    it('Registers a listener', function() {
      function fakeErrorHandler(err) {
        //Handle Error
      }

      assert.isFalse(clickIndicator._emitter.hasListeners('error'));

      clickIndicator.on('error', fakeErrorHandler);

      assert.isTrue(clickIndicator._emitter.hasListeners('error'));
    });

    it('Removes a listener', function() {
      function fakeErrorHandler(err) {
        //Handle Error
      }

      clickIndicator.on('error', fakeErrorHandler);

      assert.isTrue(clickIndicator._emitter.hasListeners('error'));

      clickIndicator.off('error', fakeErrorHandler);

      assert.isFalse(clickIndicator._emitter.hasListeners('error'));
    });

    it('Throws an error if event is unsupported', function() {
      var fakeErrorHandler = sinon.stub();

      assert.exception(function() {
        clickIndicator.on('test', fakeErrorHandler);
      }, 'Invalid event name.');
    });

    it('Throws an error if listener is not provided', function() {
      assert.exception(function() {
        clickIndicator.on('localClick');
      }, 'Listener is required.');
    });

    it('Throws an error if listener is not registered', function() {
      var fakeError = new Error('Test');

      assert.exception(function() {
        clickIndicator._indicatorHandler._emitOrThrow(fakeError);
      }, fakeError.message);
    });

    it('Emits an error if listener is registered', function() {
      var fakeError = new Error('Test');
      var fakeErrorHandler = sinon.stub();

      clickIndicator.on('error', fakeErrorHandler);

      clickIndicator._indicatorHandler._emitOrThrow(fakeError);
      sinon.assert.calledOnce(fakeErrorHandler);
    });
  });
});
