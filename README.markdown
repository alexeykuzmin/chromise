# Chromise

Promise based wrapper for [Chrome Extension API](https://developer.chrome.com/extensions/api_index).
Works in Google Chrome 42+ only.

## Usage examples
~~~js
// Synchronous call.
var language = chromise.i18n.getUILanguage().return();
console.log(language);  // 'en-US'

// Valid asynchronous call.
chromise.bookmarks.getChildren('0').wait()
    .then(console.log.bind(console));  // Array[2]

// Invalid asynchronous call.
chromise.bookmarks.create(null).wait()
    .catch(console.log.bind(console));  // 'Error: ...'
~~~
