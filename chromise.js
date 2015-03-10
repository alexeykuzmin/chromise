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


  class ApiCall {
    /**
     * @param {Object} context
     * @param {!Function} method
     * @param {Arguments} callArguments
     */
    constructor(context, method, callArguments) {
      this.context_ = context;
      this.method_ = method;
      this.callArguments_ = callArguments;
    }

    /**
     * @param {!Function} callback
     * @param {!Function} errback
     * @param {...} var_args Response from Extension API.
     * @private
     */
    static processResponse_(callback, errback, var_args) {
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

    /**
     * Synchronous call.
     * @return {?}
     */
    return() {
      return this.method_.apply(this.context_, this.callArguments_);
    }

    /**
     * Asynchronous call.
     * @return {Promise}
     */
    wait() {
      let context = this.context_;
      let method = this.method_;
      let callArguments = arrayFrom(this.callArguments_);

      return new Promise(function(resolve, reject) {
        let callback = ApiCall.processResponse_.bind(null, resolve, reject);
        callArguments.push(callback);
        method.apply(context, callArguments);
      });
    }
  }


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
      return apiEntry instanceof global.chrome.Event;
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
        return wrapGuy.wrapMethod_(apiObject, apiEntry);
      else if (entryType == 'object' && !wrapGuy.isApiEvent_(apiEntry))
        return wrapGuy.wrapObject_(apiEntry);
      else
        return apiEntry;
    },

    /**
     * Wraps API method.
     * @param {!Object} apiObject
     * @param {!Function} originalMethod
     * @return {!Function}
     * @private
     */
    wrapMethod_(apiObject, originalMethod) {
      return function() {
        return new ApiCall(apiObject, originalMethod, arguments);
      };
    }
  };


  let chromise = wrapGuy.wrapApi(global.chrome);

  // Expose internal stuff.
  chromise._ = {
    ApiCall,
    wrapGuy
  };


  global.chromise = chromise;

}(window));
