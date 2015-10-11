/**
 * @author Alexey Kuzmin <alexey@alexeykuzmin.com>
 * @fileoverview Promise based wrapper for Chrome Extension API.
 * @see https://developer.chrome.com/extensions/api_index
 * @license MIT
 * @version 3.0.0
 */



;(function(global) {
  'use strict';

  let apiProxy = {
    /**
     * @param {!Object} apiObject
     * @param {string} methodName
     * @param {Arguments} callArguments Arguments to be passes to method call.
     */
    callMethod(apiObject, methodName, callArguments) {
      let originalMethod = apiObject[methodName];
      let callArgumentsArray = Array.from(callArguments);

      return new Promise((resolve, reject) => {
        let callback = apiProxy.processResponse_.bind(null, resolve, reject);
        callArgumentsArray.push(callback);
        originalMethod.apply(apiObject, callArgumentsArray);
      });
    },

    /**
     * @param {!Function} callback
     * @param {!Function} errback
     * @param {!Array} response Response from Extension API.
     * @private
     */
    processResponse_(callback, errback, ...response) {
      let error = global.chrome.runtime.lastError;
      if (typeof error == 'object') {
        errback(new Error(error.message));
        return;
      }

      if (response.length < 2)
        response = response[0];  // undefined if response is empty

      callback(response);
    }
  };


  let classifier = {
    /**
     * @param {string} string
     * @return {boolean}
     * @private
     */
    startsWithCapitalLetter_(string) {
      let firstLetter = string[0];
      return firstLetter == firstLetter.toUpperCase();
    },

    /**
     * Returns true if |value| looks like constructor,
     * returns false otherwise.
     * @param {string} name
     * @param {?} value
     * @return {boolean}
     */
    isConstructor(name, value) {
      return typeof value == 'function' &&
          classifier.startsWithCapitalLetter_(name);
    },

    /**
     * Returns true if |value| looks like enumeration,
     * returns false otherwise.
     * @param {string} name
     * @param {?} value
     * @return {boolean}
     */
    isEnum(name, value) {
      return typeof value == 'object' &&
          classifier.startsWithCapitalLetter_(name);
    },

    /**
     * Returns true if |value| is an API Event object,
     * returns false otherwise.
     * @param {string} name
     * @param {?} value
     * @return {boolean}
     */
    isApiEventInstance(name, value) {
      if (typeof value != 'object' || value == null) {
        return false;
      }

      var prototype = Object.getPrototypeOf(value);
      return (prototype !== Object && prototype.constructor.name == 'Event');
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
     * Wraps API object.
     * @param {!Object} apiObject
     * @return {!Object}
     * @private
     */
    wrapObject_(apiObject) {
      let wrappedObject = {};

      for (let keyName of Object.keys(apiObject)) {
        wrapGuy.wrapObjectField_(wrappedObject, apiObject, keyName);
      }

      return wrappedObject;
    },

    /**
     * Wraps single object field.
     * @param {!Object} wrappedObject
     * @param {!Object} apiObject
     * @param {string} keyName
     * @return {?}
     * @private
     */
    wrapObjectField_(wrappedObject, apiObject, keyName) {
      let apiEntry = apiObject[keyName];
      let entryType = typeof apiEntry;
      let value = null;

      if (entryType == 'function' &&
          !classifier.isConstructor(keyName, apiEntry)) {
        value = wrapGuy.wrapMethod_(apiObject, keyName);
      } else if (entryType == 'object' &&
          !classifier.isApiEventInstance(keyName, apiEntry) &&
          !classifier.isEnum(keyName, apiEntry)) {
        value = wrapGuy.wrapObject_(apiEntry);
      }

      if (value)
        wrappedObject[keyName] = value;
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
        return apiProxy.callMethod(apiObject, methodName, arguments);
      }
    }
  };


  let chromise = wrapGuy.wrapApi(global.chrome);

  global.chromise = chromise;

}(this));
