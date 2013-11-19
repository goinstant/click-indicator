/*jshint browser: true */
/*global require, module */
'use strict';

/**
 * @fileOverview
 * Contains the IndicatorHandler class. Handles sending the data through a
 * channel and setting up the received data to add a click indicator.
 */

var _ = require('lodash');
var selectors = require('./selectors');
var scrollPosition = require('./scroll_position');


/**
 * @constructor
 */
function IndicatorHandler(component) {
  this._room = component._options.room;
  this._namePlates = component._options.namePlates;
  this._namespace = component._options.namespace;

  this._emitter = component._emitter;

  this._clickHandler = component._clickHandler;
  this._view = component._view;
  this._userCache = component._userCache;

  this._channel = null;

  _.bindAll(this, '_eventHandler', '_messageHandler');
}

/**
 * Initializes the IndicatorHandler
 * @public
 * @param {function} cb A callback function.
 */
IndicatorHandler.prototype.initialize = function() {
  this._channel = this._room.channel(this._namespace);

  this._clickHandler.on('click', this._eventHandler);
  this._channel.on('message', this._messageHandler);
};

/**
 * Handles the data coming from clickHandler and sends the it through a channel.
 * @private
 * @param {object} data The data needed to show an indicator on remote clients.
 */
IndicatorHandler.prototype._eventHandler = function(data) {
  var user = this._userCache.getLocalUser();

  var dataOut = {
    user: user,
    element: data.element,
    offsetX: data.location.x * data.element.offsetWidth,
    offsetY: data.location.y * data.element.offsetHeight
  };

  this._emitter.emit('localClick', dataOut);

  var selector = selectors.createSelector(data.element);
  var message = { element: selector, location: data.location };

  var self = this;
  this._channel.message(message, function(err) {
    if (err) {
      self._emitter.emit('error', err);
    }
  });
};

/**
 * Handles the data coming through the channel.
 * @private
 * @param {object} data The data needed to show an indicator on remote clients.
 * @param {object} context The channel context object.
 */
IndicatorHandler.prototype._messageHandler = function(data, context) {
  var id = context.userId;
  var user = this._userCache.getUser(id);

  var remoteLocation = data.location;

  var element = selectors.findElement(data.element);

  // If the element doesn't exist don't try to show an indicator
  if (!element) {
    return;
  }

  // If the local element isn't visible don't show an indicator
  // Fixes wrong indicator showing for a <select> option.
  if (!element.offsetWidth && !element.offsetHeight) {
    return;
  }

  var dataOut = {
    user: user,
    element: element,
    offsetX: remoteLocation.x * element.offsetWidth,
    offsetY: remoteLocation.y * element.offsetHeight
  };

  this._emitter.emit('remoteClick', dataOut);

  var box = element.getBoundingClientRect();

  var scrollPos = scrollPosition.get();

  var localPosition = {
    top: box.top + scrollPos.top,
    left: box.left + scrollPos.left
  };

  var localInside = {
    x: element.offsetWidth * remoteLocation.x,
    y: element.offsetHeight * remoteLocation.y
  };

  var localLocation = {
    x: localInside.x + localPosition.left,
    y: localInside.y + localPosition.top
  };

  this._view.addIndicator(user, localLocation);
};

/**
 * Destroys the IndicatorHandler.
 * @public
 * @param {function} cb A callback function.
 */
IndicatorHandler.prototype.destroy = function() {
  this._clickHandler.off('click', this._eventHandler);
  this._channel.off('message', this._messageHandler);
};

module.exports = IndicatorHandler;
