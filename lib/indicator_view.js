/*jshint browser: true */
/*global require, module */
'use strict';

/**
 * @fileOverview
 * Contains the IndicatorView class, which creates the indicator on the
 * document.
 */

var _ = require('lodash');
var raf = require('raf');
var colors = require('colors-common');

var tmpl = require('../templates/template.html');

/**
 * The class prefix used for this component.
 * @const
 */
var CLASS_INDICATOR = 'gi-click';
var CLASS_OVERRIDE = 'gi-override';

/**
 * A map of colors to cursor and animation positions used to show the correct
 * color cursor and animation.
 * @const
 */
var COLOR_MAP = {
  '#3bb200': { cursor: '-15', animation: '-57' },
  '#fc2a29': { cursor: '-30', animation: '-114' },
  '#06b8de': { cursor: '-45', animation: '-171' },
  '#e6c615': { cursor: '-60', animation: '-228' },
  '#7151e8': { cursor: '-75', animation: '-285' },
  '#8fe62e': { cursor: '-90', animation: '-342' },
  '#f60889': { cursor: '-105', animation: '-399' },
  '#51e8c3': { cursor: '-120', animation: '-456' },
  '#e65515': { cursor: '-135', animation: '-513' },
  '#c186ef': { cursor: '-150', animation: '-570' },
  '#734701': { cursor: '-165', animation: '-627' },
  '#3a9fab': { cursor: '-180', animation: '-684' },
  '#b6004d': { cursor: '-195', animation: '-741' },
  '#d4b37e': { cursor: '-210', animation: '-798' },
  '#4f7603': { cursor: '-225', animation: '-855' },
  '#8759b6': { cursor: '-240', animation: '-912' },
  '#2a82cd': { cursor: '-255', animation: '-969' },
  '#de9c8d': { cursor: '-270', animation: '-1026' },
  '#003f85': { cursor: '-285', animation: '-1083' },
  '#bd852c': { cursor: '-300', animation: '-1140' }
};

/**
 * @constructor
 */
function IndicatorView(namePlates, displayTimer) {
  this._namePlates = namePlates;

  this._displayTimer = displayTimer;

  this._container = document.createElement('div');
  this._container.className = CLASS_OVERRIDE + ' ';
  this._container.className += CLASS_INDICATOR + '-container';

  this._raf = raf;

  document.body.appendChild(this._container);
}

/**
 * Adds the indicator into the document and triggers the animation.
 * @public
 * @param {object} user The user to show the indicator for.
 * @param {object} position An object containing the indicator's position data.
 */
IndicatorView.prototype.addIndicator = function(user, position) {
  var color = colors.get(user);

  var colorMap = COLOR_MAP[color];

  // Default sprite position (grey)
  var cursorPos = '0';
  var animationPos = '0';

  // If the user color exists in our defaults, set the sprite position
  if (colorMap) {
    cursorPos = colorMap.cursor;
    animationPos = colorMap.animation;
  }

  var namePlates = 'visible';

  if (!this._namePlates) {
    namePlates = 'hidden';
  }

  var data = {
    name: user.displayName
  };

  var html = _.template(tmpl, data);
  var div = document.createElement('div');
  div.innerHTML = html;

  var positionDiv = div.firstChild;
  positionDiv.style.top = position.y -3 + 'px';
  positionDiv.style.left = position.x - 4 + 'px';

  var cursorDiv = positionDiv.children[0];
  var aniDiv = positionDiv.children[1];
  cursorDiv.style.backgroundPosition = cursorPos + 'px 0px';
  aniDiv.style.backgroundPosition = animationPos + 'px 0px';

  var nameDiv = positionDiv.children[2];
  nameDiv.style.background = color;
  nameDiv.style.visibility = namePlates;

  this._container.appendChild(div);
  this._animate(div, animationPos);
};

/**
 * Destroys the view by removing the container from the document.
 * @public
 */
IndicatorView.prototype.destroy = function() {
  this._container.parentNode.removeChild(this._container);
};

/**
 * Handles animating the click indicator.
 * @private
 * @param {HTMLElement} el The indicator to animate.
 * @param {object} offset The x position of the background corresponding to the
 *                        user's color.
 */
IndicatorView.prototype._animate = function(el, offset) {
  var aniEl = el.firstChild.children[1];

  var curr = 0;
  var end = -504;
  var fadeValue = 0.9;
  var wait = 50;

  var now;
  var prev = new Date().getTime();

  var self = this;

  // animate gets called as the browser becomes available via the raf
  var animate = function() {
    // Check if the fade is complete, if it is stop the animation frame.
    if (fadeValue < 0) {
      return;
    }

    // Schedule another animate call for the next available animation frame.
    self._raf.call(window, animate);

    // Sets our animation's fps
    now = new Date().getTime();
    if (now - prev < wait) {
      return;
    }

    // Check if the animation is complete.
    if (curr !== end) {
      aniEl.style.backgroundPosition = offset + 'px ' + curr + 'px';
      curr -= 56;
      prev = now;

      // After the last click animation frame set the indicate delay and hide
      // the animation sprite.
      if (curr === end) {
        aniEl.style.backgroundImage = 'none';
        wait = self._displayTimer;
      }

    // Check if the fade is complete.
    } else {
      // Once we start animating again, set the wait back to 50;
      if (fadeValue === 0.9) {
        wait = 50;
      }

      el.style.filter = "Alpha(opacity=" + fadeValue * 100 + ")";
      el.style.opacity = fadeValue;

      fadeValue -= 0.1;

      // Remove the element after the fade has completed.
      if (fadeValue < 0) {
        el.parentNode.removeChild(el);
      }
    }
  };

  animate();
};

module.exports = IndicatorView;
