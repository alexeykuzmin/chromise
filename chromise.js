/**
 * @author Alexey Kuzmin <alexey@alexeykuzmin.com>
 * @fileoverview Promise based wrapper for Chrome Extension API.
 * @see https://developer.chrome.com/extensions/api_index
 * @license MIT
 */


(function(global) {
  'use strict';

  /**
   * Converts |iterable| into Array instance.
   * @param {*} iterable
   * @return {Array}
   */
  var arrayFrom = function(iterable) {
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
      var context = this.context_;
      let method = this.method_;
      var callArguments = arrayFrom(this.callArguments_);

      return new Promise(function(resolve, reject) {
        let callback = ApiCall.processResponse_.bind(null, resolve, reject);
        callArguments.push(callback);
        method.apply(context, callArguments);
      });
    }
  }


  let chromise = {};


  /**
   * List of Extension API namespaces to wrap.
   * @type {Array.<Object>}
   * @private
   */
  chromise.API_NAMESPACES_ = [
    global.chrome
  ];


  /**
   * @private
   */
  chromise.init_ = function() {
    let wrap = chromise.wrapObject_.bind(null, chromise);
    chromise.API_NAMESPACES_.forEach(wrap);
  };


  /**
   * Return true if |apiEntry| is an API Event object, returns false otherwise.
   * @param {!Object} apiEntry
   * @return {boolean}
   * @private
   */
  chromise.isApiEvent_ = function(apiEntry) {
    return apiEntry instanceof global.chrome.Event;
  };


  /**
   * Returns true if function with name |methodName| looks like constructor,
   * returns false otherwise.
   * @param {string} methodName
   * @return {boolean}
   * @private
   */
  chromise.isConstructor_ = function(methodName) {
    let firstLetter = methodName[0];
    return firstLetter == firstLetter.toUpperCase();
  };


  /**
   * Adds all fields of |apiObject| to |exportTo| object.
   * @param {!Object} exportTo
   * @param {!Object} apiObject
   * @private
   */
  chromise.wrapObject_ = function(exportTo, apiObject) {
    Object.keys(apiObject).forEach(function(keyName) {
      let apiEntry = apiObject[keyName];
      let entryType = typeof apiEntry;

      if (entryType == 'function')
        chromise.wrapMethod_(exportTo, apiObject, keyName);
      else if (entryType == 'object' && !chromise.isApiEvent_(apiEntry))
        chromise.wrapObject_(exportTo[keyName] = {}, apiEntry);
      else
        exportTo[keyName] = apiEntry;
    });
  };


  /**
   * Adds new method to |exportTo| object with |methodName| name.
   * @param {!Object} exportTo
   * @param {!Object} apiObject
   * @param {string} methodName
   * @private
   */
  chromise.wrapMethod_ = function(exportTo, apiObject, methodName) {
    let originalMethod = apiObject[methodName];
    let wrappedMethod = chromise.isConstructor_(methodName) ?
        originalMethod :
        function() {
          return new ApiCall(apiObject, originalMethod, arguments);
        };

    exportTo[methodName] = wrappedMethod;
  };


  global.chromise = chromise;
  chromise.init_();

}(window));
