/*jshint browser:true */
/*global require */

/**
 * @fileOverview
 * Contains unit tests for the ClickIndicator component
 */

describe('Constructor', function() {
  'use strict';

  var assert = window.assert;
  var ClickIndicator = require('click-indicator');
  var mockRoom = {};
  var clickIndicator;

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
