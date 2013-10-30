/*jshint browser: true */
/*global module */
'use strict';

/**
 * @fileOverview
 * Contains the ScrollPosition class, used cross-browser to get the scrollTop
 * and scrollLeft position.
 */

function ScrollPosition() {}

ScrollPosition.prototype.get = function() {

  var top = document.body.scrollTop;

  if (top === 0) {
    // FF
    if (window.pageYOffset) {
      top = window.pageYOffset;

    // IE
    } else {
      top = (document.body.parentElement) ?
        document.body.parentElement.scrollTop : 0;
    }
  }

  var left = document.body.scrollLeft;

  if (left === 0) {
    // FF
    if (window.pageXOffset) {
      left = window.pageXOffset;

    // IE
    } else {
      left = (document.body.parentElement) ?
        document.body.parentElement.scrollLeft : 0;
    }
  }

  return {
    top: top,
    left: left
  };

};

module.exports = new ScrollPosition();
