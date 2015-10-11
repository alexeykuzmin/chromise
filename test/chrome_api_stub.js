(function(global) {
  'use strict';

  let emptyFunction = function() {};

  let Event = function Event() {};
  Event.prototype = {
    constructor: Event,
    addListener: emptyFunction,
    removeListener: emptyFunction
  };

  global.chrome = {
    runtime: {
      lastError: undefined,
      PlatformOS: {
        MAC: 'mac',
        WIN: 'win'
      }
    },
    events: {
      Event
    },
    tabs: {
      update: emptyFunction,
      onUpdated: new Event,
      TAB_ID_NONE: -1
    }
  };
}(this));
