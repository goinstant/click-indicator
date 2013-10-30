/*jshint browser:true */
/*global module, require */
'use strict';

/**
 * @fileoverview
 * Handles DOM selectors for sending through platform.
 */

/**
 * Dependencies
 */
var _ = require('lodash');

function Selectors() {}

/**
 * TODO: These should be moved into a generic shared dependency
 */
Selectors.prototype.createSelector = function(el) {
  var selector = '';
  if (el == document.documentElement) {
    return 'DOC_EL';
  }

  if (!el.parentNode) {
    return selector;
  }

  var currentParent = el.parentNode;
  var childEl = el;
  var childTagName = el.tagName || el.nodeName.slice(1);
  var childIndex;

  var self = this;

  function withoutIndex(el) {
    var elTagName = el.tagName || el.nodeName.slice(1);
    elTagName = self.escapeTagName(elTagName);
    return elTagName === selectorWithoutIndex;
  }

  function getChildIndex(parentChild) {
    if (parentChild === childEl) {
        return false;
      }

      childIndex ++;
  }

  while(currentParent && currentParent.tagName) {
    // Need to call toUpperCase so that tag names are in uppercase
    // regardless of the browser. IE8 doesn't capitalize HTML5 elements like
    // article, header etc
    var upperCaseChild = childTagName.toUpperCase();
    var selectorWithoutIndex = self.escapeTagName(upperCaseChild);
    childIndex = 0;

    var parentChildren = _.filter(currentParent.children, withoutIndex);
    _.each(parentChildren, getChildIndex) ;

    selector = selectorWithoutIndex + ':eq('+ childIndex +') > ' + selector;

    if (currentParent.parentNode && currentParent.parentNode.tagName) {
      childTagName = currentParent.tagName;
      childEl = currentParent;
      currentParent = currentParent.parentNode;

    } else {
      break;
    }

  }
  selector = selector.replace(/\s>\s$/, '');

  return selector;

};

// Escape DOM element names, like "FB:LIKE" to be used in selector.
Selectors.prototype.escapeTagName = function(selector) {
  var regex = /([ #;?&,.+*~\':"!\^$\[\]()=>|\/@])/g;
  if (!selector) {
    return '';
  }

  return selector.replace(regex, '\\$1');
};

Selectors.prototype.findElement = function(selector) {
  var selectorDescriptions = this.transformIntoDescriptions(selector);

  if (selector == 'DOC_EL') {
    return document.documentElement;
  }

  if (selector == 'BODY:eq(0)') {
    return document.body;
  }

  var currEl = document.body;
  for (var i=0, len = selectorDescriptions.length; i < len; i++) {
    if (!currEl) {
      break;
    }

    var currDesc = selectorDescriptions[i];
    if (currDesc.tagName == 'TEXT') {
      return currEl.childNodes[0];
    }

    var childrenWithTagName = [];

    for (var j=0; j < currEl.childNodes.length; j++) {
      var child = currEl.childNodes[j];

      if (child.tagName && child.tagName.toUpperCase() == currDesc.tagName) {
        childrenWithTagName.push(child);
      }
    }


    currEl = childrenWithTagName[currDesc.index];
  }

  var elementFound = currEl;

  return elementFound;
};

Selectors.prototype.transformIntoDescriptions = function(selector) {
  var parts = selector.split('>');
  var cleanParts = [];

  for (var i=1, len = parts.length; i < len; i++) {
    var current = parts[i].replace(/^\s+|\s+$/g, '');
    var subParts = current.split(':');
    var index = subParts[1].match(/[0-9]+/)[0];
    current = {
      tagName: subParts[0],
      index: index
    };

    cleanParts.push(current);
  }

  return cleanParts;
};

Selectors.prototype.generateHash = function(str) {
  var hash = 0;
  var character;

  if (str.length === 0) {
    return hash;
  }

  /*jshint bitwise:false*/
  for (var i = 0; i < str.length; i++) {
    character = str.charCodeAt(i);
    hash = ((hash<<5) - hash) + character;
    hash |= 0;
  }

  return Math.abs(hash);
};

module.exports = new Selectors();
