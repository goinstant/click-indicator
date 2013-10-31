/*jshint browser: true */
/*global require, module */
'use strict';

/**
 * @fileOverview
 * Contains the ClickHandler class, which decides if a click is legitimate.
 */

var _ = require('lodash');
var Emitter = require('emitter');
var binder = require('binder');

var scrollPosition = require('./scroll_position');

/**
 * @constructor
 */
function ClickHandler(el) {
  this._emitter = new Emitter();
  this._element = el;

  _.bindAll(this,
            '_touchStartHandler',
            '_touchEndHandler',
            '_touchFinishedHandler',
            '_mousedownHandler',
            '_mouseupHandler',
            '_validatedClick');

  this._startPosition = null;
  this._endPosition = null;
  this._scrollPosition = null;

  // Max distance from the start position to be considered a click
  this._threshold = 50;

  this._touchEnabled = 'ontouchstart' in window;

  this._isBound = false;
}

/**
 * Sets where the click started so we know if it was a legit click when it ends.
 * @private
 * @param {object} event The triggered event.
 */
ClickHandler.prototype._touchStartHandler = function(event) {
  // Reset start and end in case a click never happens
  this._startPosition = null;
  this._endPosition = null;

  this._scrollPosition = scrollPosition.get();

  this._startPosition = this._getPosition(event);
};

/**
 * When/while the click happens we determine if the click was part of a scroll.
 * @private
 * @param {object} event The triggered event.
 */
ClickHandler.prototype._touchEndHandler = function(event) {
  // Not a legit click if they are scrolling or missed the start event
  if (this._startPosition === null || this._isScrolling()) {
    this._startPosition = null;
    return;
  }

  // Position before the click is completed.
  this._endPosition = this._getPosition(event);
};

/**
 * When the click finishes we determine if the click was a legit click.
 * @private
 * @param {object} event The triggered event.
 */
ClickHandler.prototype._touchFinishedHandler = function(event) {
  var start = this._startPosition;
  var end = this._endPosition;

  var validated = false;

  // A touchend without touchmove. End position will never be set because a
  // touchmove never occured.
  if (event.type === 'touchend' && end === null && start) {
    end = start;
    validated = true;

  // Start and end are set, check to see if movement was within the defined
  // touch thresholds.
  } else if (start && end && this._noMove(start, end)) {
    validated = true;
  }

  // If the end moved beyond the threshold distance of start, don't count it as
  // a click
  if (validated) {
    this._validatedClick(event);
  }
};

/**
 * Sets the down position for a mouse event so we know if a click is from the
 * mouse or keyboard.
 * @private
 * @param {object} event The triggered event.
 */
ClickHandler.prototype._mousedownHandler = function(event) {
  this._startPosition = this._getPosition(event);
};

/**
 * Sets the up position for a mouse event so we can animate the click at the
 * end, rather than the beginning.
 * @private
 * @param {object} event The triggered event.
 */
ClickHandler.prototype._mouseupHandler = function(event) {
  this._endPosition = this._getPosition(event);
};

/**
 * Calculate the click position relative to the element clicked in.
 * @private
 * @param {object} event The triggered touchend or click event.
 */
ClickHandler.prototype._validatedClick = function(event) {
  var element = event.target || event.srcElement;

  var location = {};

  // If the start position was never set we know this was a click event using
  // the keyboard.
  if (!this._touchEnabled && this._startPosition === null) {
    location.x = 0.5;
    location.y = 0.5;

  // Touch/Mouse events
  } else if (this._touchEnabled) {
    var box = element.getBoundingClientRect();
    var scrollPos = scrollPosition.get();

    var pos = {
      top: box.top + scrollPos.top,
      left: box.left + scrollPos.left
    };

    var endPos = this._endPosition || this._startPosition;

    // Calculate the offsetX/Y inside the element
    location.x = (endPos.x - pos.left) / element.offsetWidth;
    location.y = (endPos.y - pos.top) / element.offsetHeight;

  }

  var data = {
    element: element,
    location: location
  };

  this._emitter.emit('click', data);

  // Clear start, end and scroll
  this._startPosition = null;
  this._endPosition = null;
  this._scrollPosition = null;
};

/**
 * Get the position of the event for various platforms
 */
ClickHandler.prototype._getPosition = function(event) {
   var pos = {};

  if (event.type === 'click') {
    pos.x = event.target.offsetWidth / 2;
    pos.y = event.target.offsetHeight / 2;
    return pos;

  } else if (event.targetTouches && event.targetTouches[0]) { // Touch
    pos.x = event.targetTouches[0].pageX;
    pos.y = event.targetTouches[0].pageY;
    return pos;

  } else if (event.pageX !== undefined && event.pageY !== undefined) { // Mouse
    pos.x = event.pageX;
    pos.y = event.pageY;
    return pos;

  } else { // IE 8
    pos.x = event.clientX;
    pos.y = event.clientY;
    return pos;
  }
};

/**
 * Checks to see if the scroll position changed since our mousedown/touchstart
 * @private
 * @returns {boolean} True: scrolling occured.
 */
ClickHandler.prototype._isScrolling = function() {

  var oldScroll = this._scrollPosition;
  var newScroll = scrollPosition.get();

  // If we are now scrolling this is no longer a legit click
  if (oldScroll.top !== newScroll.top || oldScroll.left !== newScroll.left) {
    return true;
  }

  return false;
};

/**
 * Calculates the distance from start to end to detect if our click is a drag.
 * @private
 * @param {object} start The first position
 * @param {object} end The last position
 * @param {string} type The event type
 * @returns {boolean} True: the start and end positions are close enough to be
 *                    considered a legit click.
 */
ClickHandler.prototype._noMove = function(start, end) {
  var p1 = Math.pow(end.x - start.x, 2);
  var p2 = Math.pow(end.y - start.y, 2);
  var distance = (Math.sqrt(p1 + p2));

  if (distance <= this._threshold) {
    return true;
  }

  return false;
};

/**
 * Registers an event listener.
 * @public
 * @param {string} event The name of the event to listen for.
 * @param {function} listener The listener function for the event.
 */
ClickHandler.prototype.on = function(event, listener) {
  if (event !== 'click' || this._isBound) {
    return;
  }

  this._emitter.on(event, listener);

    // Mouse devices
  if (!this._touchEnabled) {
    binder.on(this._element, 'mousedown', this._mousedownHandler);
    binder.on(this._element, 'mouseup', this._mouseupHandler);
    binder.on(this._element, 'click', this._validatedClick);

  // Touch devices
  } else {
    binder.on(this._element, 'touchstart', this._touchStartHandler);
    binder.on(this._element, 'touchmove', this._touchEndHandler);
    binder.on(this._element, 'touchend', this._touchFinishedHandler);
  }

  this._isBound = true;
};

/**
 * Deregisters an event listener.
 * @public
 * @param {string} event The name of the event to listen for.
 * @param {function} listener The listener function for the event.
 */
ClickHandler.prototype.off = function(event, listener) {
  if (!this._isBound) {
    return;
  }

  this._emitter.off(event, listener);

  // Mouse devices
  if (!this._touchEnabled) {
    binder.off(this._element, 'mousedown', this._mousedownHandler);
    binder.off(this._element, 'mouseup', this._mouseupHandler);
    binder.off(this._element, 'click', this._validatedClick);

  // Touch devices
  } else {
    binder.off(this._element, 'touchstart', this._touchStartHandler);
    binder.off(this._element, 'touchmove', this._touchEndHandler);
    binder.off(this._element, 'touchend', this._touchFinishedHandler);
  }

  this._isBound = false;
};

module.exports = ClickHandler;
