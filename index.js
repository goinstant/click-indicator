/*jshint browser:true */
/*global require, module */
'use strict';

/**
 * @fileOverview
 * This file contains the ClickIndicator class.
 */

var Emitter = require('emitter');
var async = require('async');
var _ = require('lodash');

var UserCache = require('usercache');

var ClickHandler = require('./lib/click_handler');
var IndicatorView = require('./lib/indicator_view');
var IndicatorHandler = require('./lib/indicator_handler');

/**
 * A list of supported options
 * @const
 */
var SUPPORTED_OPTIONS = [
  'room',
  'namePlates',
  'element',
  'displayTimer'
];

/**
 * The option defaults. Any option not listed here is required.
 * @const
 */
var DEFAULT_OPTIONS = {
  namePlates: true,
  element: document.documentElement,
  displayTimer: 500
};

/**
 * A list of supported events to listen for.
 * @const
 */
var SUPPORTED_EVENTS = [
  'error',
  'localClick',
  'remoteClick'
];

/**
 * @constructor
 */
function ClickIndicator(opts) {
  this._options = this._validateOptions(opts);

  this._emitter = new Emitter();

  this._view = new IndicatorView(this._options.namePlates,
                                 this._options.displayTimer);

  this._clickHandler = new ClickHandler(this._options.element);

  this._userCache = new UserCache(this._options.room);
  this._indicatorHandler = new IndicatorHandler(this);
}

/**
 * Initializes the component
 * @public
 * @param {function} cb The function to call with an error or when
 *                      initialization is complete.
 */
ClickIndicator.prototype.initialize = function(cb) {
  var tasks = [
    _.bind(this._userCache.initialize, this._userCache),
    _.bind(this._indicatorHandler.initialize, this._indicatorHandler)
  ];

  async.series(tasks, cb);
};

/**
 * Registers an event listener.
 * @public
 * @param {string} event The name of the event to listen for.
 * @param {function} listener The listener function to call when the event
 *                            occurs
 */
ClickIndicator.prototype.on = function(event, listener) {
  if (!_.isString(event)) {
    throw new Error('Event must be a string.');
  }

  if (!_.contains(SUPPORTED_EVENTS, event)) {
    throw new Error('Invalid event name.');
  }

  if (!listener) {
    throw new Error('Listener is required.');
  }

  if (!_.isFunction(listener)) {
    throw new Error('Listener must be a function.');
  }

  this._emitter.on(event, listener);
};

/**
 * Deregisters an event listener.
 * @public
 * @param {string} event The name if the event that is registered.
 * @param {function} listener The listener function that is registered to the
 *                            event.
 */
ClickIndicator.prototype.off = function(event, listener) {
  this._emitter.off(event, listener);
};

/**
 * Destroys the component and removes all listeners.
 * @public
 * @param {function} cb A callback function that is called when the deestroy
 *                      completes.
 */
ClickIndicator.prototype.destroy = function(cb) {
  var self = this;

  this._emitter.off();

  var tasks = [
    _.bind(self._indicatorHandler.destroy, self._indicatorHandler),
    _.bind(self._userCache.destroy, self._userCache),
    _.bind(self._view.destroy, self._view)
  ];

  async.series(tasks, cb);
};

/**
 * Validates the supplied options. Returns a validated options object populated
 * with defaults.
 * @private
 * @param {object} opts The options object supplied by the user.
 * @return {object} The validated options, extended with the defaults for
 *                  missing optional options.
 * @throws {Error} If the options object supplied by the user is missing the
 *                 required options or include unsupported/invalid values.
 */
ClickIndicator.prototype._validateOptions = function(opts) {
  var suppliedOptions = _.keys(opts);
  var diff = _.difference(suppliedOptions, SUPPORTED_OPTIONS);
  if (diff.length > 0) {
    throw new Error('Unsupported options:' + diff.join(','));
  }

  opts = _.defaults(opts, DEFAULT_OPTIONS);

  if (!opts.room || !_.isObject(opts.room)) {
    throw new Error('Invalid room option.');
  }

  if (!_.isBoolean(opts.namePlates)) {
    throw new Error('Invalid name plate option.');
  }

  if (!_.isElement(opts.element)) {
    throw new Error('Invalid element option.');
  }

  if (!_.isNumber(opts.displayTimer)) {
    throw new Error('Invalid displayTimer option.');
  }

  return opts;
};

module.exports = ClickIndicator;
