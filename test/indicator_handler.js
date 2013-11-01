/*jshint browser:true */
/*global require */

/**
 * @fileOverview
 * Contains unit tests for the IndicatorHandler class
 */

describe('IndicatorHandler', function() {
  'use strict';

  var sinon = window.sinon;

  var Emitter = require('emitter');

  var IndicatorHandler = require('click-indicator/lib/indicator_handler.js');
  var mockUser, mockChannel, mockRoom, mockView, mockUserCache, mockComponent,
      indicatorHandler;

  beforeEach(function(done) {
    mockUser = {
      userId: 'fakeId'
    };

    mockChannel = {
      message: sinon.stub(),
      on: sinon.stub().callsArg(2),
      off: sinon.stub().callsArg(2)
    };

    mockRoom = {
      user: sinon.stub().yields(null, mockUser),
      channel: sinon.stub().returns(mockChannel)
    };

    mockView = {
      addIndicator: sinon.stub()
    };

    mockUserCache = {
      getUser: sinon.stub().returns({ id: 'remoteUser' }),
      getLocalUser: sinon.stub().returns(mockUser)
    };

    var clickHandler = new Emitter();
    clickHandler.off = sinon.stub();

    mockComponent = {
      _options: {
        room: mockRoom,
        namePlates: true,
        namespace: 'TEST_CHANNEL_NAMESPACE'
      },
      _emitter: new Emitter(),
      _clickHandler: clickHandler,
      _view: mockView,
      _userCache: mockUserCache
    };

    indicatorHandler = new IndicatorHandler(mockComponent);
    indicatorHandler.initialize(done);
  });

  it ('Channel message is sent when click is emitted.', function() {
    var data ={
      element: document.body,
      location: {
        x: 0.25,
        y: 0.5
      }
    };

    var selector = "BODY:eq(0)";

    mockComponent._clickHandler.emit('click', data);

    data.element = selector;
    sinon.assert.calledWith(mockRoom.channel, 'TEST_CHANNEL_NAMESPACE');
    sinon.assert.calledWith(mockChannel.message, data);
  });

  it('Does not call addIndicator if element does not exist.', function() {
    var data ={
      element: 'BODY:eq(0) > INPUT:eq(1)',
      location: {
        x: 0.5,
        y: 0.5
      }
    };

    indicatorHandler._messageHandler(data, mockUser);

    sinon.assert.notCalled(mockView.addIndicator);
  });

  it('destroy removes listeners', function(done) {
    indicatorHandler.destroy(function(err) {
      if (err) {
        throw err;
      }

      sinon.assert.calledOnce(mockComponent._clickHandler.off);
      sinon.assert.calledOnce(mockChannel.off);
      return done();
    });

  });

});
