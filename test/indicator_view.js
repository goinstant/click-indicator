/*jshint browser:true */
/*global require */

/**
 * @fileOverview
 * Contains unit tests for the IndicatorView class.
 */

describe('IndicatorView', function() {
  'use strict';

  var assert = window.assert;
  var sinon = window.sinon;

  var $ = require('jquery');
  var colors = require('colors-common');

  var CLASS_NAME = '.gi-click';

  var IndicatorView = require('click-indicator/lib/indicator_view.js');

  var view;
  var clock;

  var user = {
    id: 'userId1',
    displayName: 'Bob',
  };

  user[colors.USER_PROPERTY] = '#c186ef';

  beforeEach(function() {
    clock = sinon.useFakeTimers();
    view = new IndicatorView(true, 500);

    sinon.stub(view, '_raf', function(fn) {
      window.setTimeout(fn, 10);
    });

  });

  afterEach(function() {
    view.destroy();
  });

  it('Adds a container to hold the indicators', function() {
    var container = $(CLASS_NAME + '-container');

    assert(container);
  });

  it('Adds a click indicator.', function() {
    view.addIndicator(user, { x: 100, y: 200});
    var container = $(CLASS_NAME + '-container').children();
    var indicator = container.children().length;

    assert.equal(indicator, 1);
  });

  it('Adds a click indicator with correct data.', function() {
    view.addIndicator(user, { x: 100, y: 200});
    var container = $(CLASS_NAME + '-container').children();
    var indicator = container.children().first();
    var name = indicator.children().eq(2);

    assert.equal(name.html(), user.displayName);

    var cursor = indicator.children().eq(0).css('backgroundPosition');
    var animation = indicator.children().eq(1).css('backgroundPosition');

    assert.equal(cursor.split(' ')[0], '-150px');
    assert.equal(animation.split(' ')[0], '-570px');
  });

  it('Removes individual indicators after the timeout.', function() {
    view.addIndicator(user, { x: 100, y: 200});

    clock.tick(900);

    view.addIndicator(user, { x: 300, y: 400});

    var container = $(CLASS_NAME + '-container').children();
    assert.equal(container.length, 2);

    clock.tick(600);
    container = $(CLASS_NAME + '-container').children();
    assert.equal(container.length, 1);

    clock.tick(1000);
    container = $(CLASS_NAME + '-container').children();
    assert.equal(container.length, 0);
  });

  it('Name plate option set to false does not show name plate', function() {
    view._namePlates = false;
    view.addIndicator(user, { x: 300, y: 400});
    var container = $(CLASS_NAME + '-container').children();
    var indicator = container.children().first();
    var name = indicator.children().eq(2);

    assert.equal(name.css('visibility'), 'hidden');
  });

  it('Destroy removes the container', function() {
    var container = $(CLASS_NAME + '-container').length;
    assert.equal(container, 1);

    view.destroy();
    container = $(CLASS_NAME + '-container').length;
    assert.equal(container, 0);

    view = new IndicatorView(true);
    container = $(CLASS_NAME + '-container').length;
    assert.equal(container, 1);
  });

});
