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

  it('Mouse click calls validatedClick.', function() {
    var fakeEvent = $.Event('mousedown');
    fakeEvent.pageX = 100;
    fakeEvent.pageY = 100;
    fakeEvent.target = $('#mocha')[0];
    fakeEvent.srcElement = $('#mocha')[0];

    clickHandler._mouseStartHandler(fakeEvent);

    assert.equal(clickHandler._startPosition.x, 100);
    assert.equal(clickHandler._startPosition.y, 100);

    fakeEvent.type = 'click';

    sinon.spy(clickHandler, '_validatedClick');
    clickHandler._validatedClick(fakeEvent);

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

});

