/*jshint browser:true */
/*global require */

/**
 * @fileOverview
 * Contains unit tests for the Clickhandler class
 */

describe('ClickHandler', function() {
  'use strict';

  var assert = window.assert;
  var sinon = window.sinon;

  var $ = require('jquery');

  var ClickHandler = require('click-indicator/lib/click_handler.js');
  var clickHandler;

  beforeEach(function() {
    clickHandler = new ClickHandler(document.body);
  });

  it('Touch start sets the current scroll and start positon.', function() {
    var fakeEvent = $.Event('touchstart');
    fakeEvent.targetTouches = $('#mocha');
    fakeEvent.targetTouches[0].pageX = 100;
    fakeEvent.targetTouches[0].pageY = 100;

    clickHandler._touchStartHandler(fakeEvent);
    assert.equal(clickHandler._scrollPosition.top, 0);
    assert.equal(clickHandler._scrollPosition.left, 0);
    assert.equal(clickHandler._startPosition.x, 100);
    assert.equal(clickHandler._startPosition.y, 100);
  });

  it('Touch end sets the end position.', function() {
    var fakeEvent = $.Event('touchmove');
    fakeEvent.targetTouches = $('#mocha');
    fakeEvent.targetTouches[0].pageX = 100;
    fakeEvent.targetTouches[0].pageY = 100;

    clickHandler._touchStartHandler(fakeEvent);
    clickHandler._touchEndHandler(fakeEvent);

    assert.equal(clickHandler._endPosition.x, 100);
    assert.equal(clickHandler._endPosition.y, 100);
  });

  it('Scroll is different from touch start resets start position.', function() {
    var fakeEvent = $.Event('touchmove');
    fakeEvent.targetTouches = $('#mocha');
    fakeEvent.targetTouches[0].pageX = 100;
    fakeEvent.targetTouches[0].pageY = 100;

    clickHandler._touchStartHandler(fakeEvent);

    assert.equal(clickHandler._startPosition.x, 100);
    assert.equal(clickHandler._startPosition.y, 100);

    clickHandler._scrollPosition = {top: 200, left: 0};
    clickHandler._touchEndHandler(fakeEvent);

    assert.equal(clickHandler._startPosition, null);
  });

  it('Touch finished without a touchmove.', function() {
    var fakeEvent = $.Event('touchstart');
    fakeEvent.targetTouches = $('#mocha');
    fakeEvent.targetTouches[0].pageX = 100;
    fakeEvent.targetTouches[0].pageY = 100;

    clickHandler._touchStartHandler(fakeEvent);

    fakeEvent.type = 'touchend';
    fakeEvent.target = $('#mocha')[0];

    sinon.spy(clickHandler, '_validatedClick');
    clickHandler._touchFinishedHandler(fakeEvent);

    sinon.assert.called(clickHandler._validatedClick);
  });

  it('Touch finished but end moved too far to be a valid click.', function() {
    var fakeEvent = $.Event('touchmove');
    fakeEvent.targetTouches = $('#mocha');
    fakeEvent.targetTouches[0].pageX = 100;
    fakeEvent.targetTouches[0].pageY = 100;

    clickHandler._touchStartHandler(fakeEvent);

    fakeEvent.targetTouches[0].pageX = 100;
    fakeEvent.targetTouches[0].pageY = 151;

    clickHandler._touchEndHandler(fakeEvent);

    assert.notEqual(clickHandler._endPosition, null);

    fakeEvent.type = 'touchend';
    fakeEvent.target = $('#mocha')[0];

    sinon.spy(clickHandler, '_validatedClick');
    clickHandler._touchFinishedHandler(fakeEvent);

    sinon.assert.notCalled(clickHandler._validatedClick);
  });

  it('End moved but not too far not be a valid click.', function() {
    var fakeEvent = $.Event('touchmove');
    fakeEvent.targetTouches = $('#mocha');
    fakeEvent.targetTouches[0].pageX = 100;
    fakeEvent.targetTouches[0].pageY = 100;

    clickHandler._touchStartHandler(fakeEvent);

    fakeEvent.targetTouches[0].pageX = 100;
    fakeEvent.targetTouches[0].pageY = 150;

    clickHandler._touchEndHandler(fakeEvent);

    assert.notEqual(clickHandler._endPosition, null);

    fakeEvent.type = 'touchend';
    fakeEvent.target = $('#mocha')[0];

    sinon.spy(clickHandler, '_validatedClick');
    clickHandler._touchFinishedHandler(fakeEvent);

    sinon.assert.called(clickHandler._validatedClick);

  });

  it('Off removes listener.', function() {
    function fakeListener() {}
    assert.equal(clickHandler._emitter.hasListeners('click'), false);
    clickHandler.on('click', fakeListener);
    assert.equal(clickHandler._emitter.hasListeners('click'), true);
    clickHandler.off('click', fakeListener);
    assert.equal(clickHandler._emitter.hasListeners('click'), false);
  });

  it('emits position, when mousedown, mouseup, and click occur', function() {
    var handler = sinon.spy(function() {
    });

    clickHandler.on('click', handler);

    var upLocation = {
      "top": 10,
      "left": 20
    };

    var upTarget = $('<div></div>');
    upTarget.css('position', 'absolute');
    upTarget.css('top', upLocation.top + 'px');
    upTarget.css('left', upLocation.left + 'px');
    upTarget.css('width', '100px');
    upTarget.css('height', '100px');

    var downLocation = {
      "top": 40,
      "left": 90
    };

    var downTarget = $('<div></div>');
    downTarget.css('position', 'absolute');
    downTarget.css('width', '100px');
    downTarget.css('height', '100px');
    downTarget.css('top', downLocation.top + 'px');
    downTarget.css('left', downLocation.left + 'px');

    $('body').append(upTarget);
    $('body').append(downTarget);

    var upEvt = {
      target: upTarget.get(0),
      pageX: upLocation.left,
      pageY: upLocation.top
    };

    var downEvt = {
      target: downTarget.get(0),
      pageX: downLocation.left,
      pageY: downLocation.top
    };

    clickHandler._mousedownHandler(downEvt);
    clickHandler._mouseupHandler(upEvt);
    clickHandler._validatedClick(downEvt);

    sinon.assert.calledOnce(handler);
    sinon.assert.calledWith(handler, {
      location: {
        x: -0.7,
        y: -0.3
      },
      element: downTarget.get(0)
    });
  });
});

