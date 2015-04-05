/**
 * @author Alexey Kuzmin <alexey@alexeykuzmin.com>
 * @fileoverview Promise based wrapper for Chrome Extension API.
 * @see https://developer.chrome.com/extensions/api_index
 * @license MIT
 */



;(function(global) {
  'use strict';

  /**
   * Converts |iterable| into Array instance.
   * @param {*} iterable
   * @return {Array}
   */
  let arrayFrom = function(iterable) {
    return Array.prototype.slice.call(iterable);
  };


  let apiGuy = {
    /**
     * @param {!Object} apiObject
     * @param {string} methodName
     * @param {Arguments} callArguments Arguments to be passes to method call.
     */
    callMethod(apiObject, methodName, callArguments) {
      let originalMethod = apiObject[methodName];
      let callArgumentsArray = arrayFrom(callArguments);

      return new Promise(function(resolve, reject) {
        let callback = apiGuy.processResponse_.bind(null, resolve, reject);
        callArgumentsArray.push(callback);
        originalMethod.apply(apiObject, callArgumentsArray);
      });
    },

    /**
     * @param {!Function} callback
     * @param {!Function} errback
     * @param {...} var_args Response from Extension API.
     * @private
     */
    processResponse_(callback, errback, var_args) {
      let error = global.chrome.runtime.lastError;
      if (typeof error == 'object') {
        errback(new Error(error.message));
        return;
      }

      /** @type {*|Array.<*>} */
      let response = arrayFrom(arguments).slice(2);

      if (response.length < 2)
        response = response[0];  // undefined if response is empty

      callback(response);
    }
  };


  let wrapGuy = {
    /**
     * @param {!Object} api API object to wrap.
     * @return {!Object}
     */
    wrapApi(api) {
      return wrapGuy.wrapObject_(api);
    },

    /**
     * Returns true if |apiEntry| is an API Event object,
     * returns false otherwise.
     * @param {!Object} apiEntry
     * @return {boolean}
     * @private
     */
    isApiEvent_(apiEntry) {
      var entryPrototype = Object.getPrototypeOf(apiEntry);
      return (entryPrototype !== Object &&
          entryPrototype.constructor.name === 'Event');
    },

    /**
     * Returns true if function with given name looks like constructor,
     * returns false otherwise.
     * @param {string} functionName
     * @return {boolean}
     * @private
     */
    isConstructor_(functionName) {
      let firstLetter = functionName[0];
      return firstLetter == firstLetter.toUpperCase();
    },

    /**
     * Wraps API object.
     * @param {!Object} apiObject
     * @return {!Object}
     * @private
     */
    wrapObject_(apiObject) {
      let wrappedObject = {};

      for (let keyName of Object.keys(apiObject)) {
        wrappedObject[keyName] = wrapGuy.wrapObjectField_(apiObject, keyName);
      }

      return wrappedObject;
    },

    /**
     * Wraps single object field.
     * @param {!Object} apiObject
     * @param {string} keyName
     * @return {?}
     * @private
     */
    wrapObjectField_(apiObject, keyName) {
      let apiEntry = apiObject[keyName];
      let entryType = typeof apiEntry;

      if (entryType == 'function' && !wrapGuy.isConstructor_(keyName))
        return wrapGuy.wrapMethod_(apiObject, keyName);
      else if (entryType == 'object' && !wrapGuy.isApiEvent_(apiEntry))
        return wrapGuy.wrapObject_(apiEntry);
      else
        return apiEntry;
    },

    /**
     * Wraps API method.
     * @param {!Object} apiObject
     * @param {string} methodName
     * @return {!Function}
     * @private
     */
    wrapMethod_(apiObject, methodName) {
      return function() {
        return apiGuy.callMethod(apiObject, methodName, arguments);
      }
    }
  };


  let chromise = wrapGuy.wrapApi(global.chrome);

  // Expose internal stuff.
  chromise._ = {
    apiGuy,
    wrapGuy
  };

  // Export
  if (typeof global.define == 'function' && global.define.amd) {
    global.define(function() {
      return chromise;
    });
  } else {
    global.chromise = chromise;
  }

}(window));
