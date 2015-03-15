# Chromise

Promise based wrapper for [Chrome Extension API](https://developer.chrome.com/extensions/api_index).
Works in Google Chrome 42+ only.

## Usage examples
~~~js
// Synchronous call.
let language = chromise.i18n.getUILanguage().return();
console.log(language);  // 'en-US'

// Asynchronous call.
chromise.bookmarks.getChildren('0').wait()
    .then(console.log.bind(console));  // Array[2]

// Asynchronous call without callback.
let result = chromise.bookmarks.create({url: 'http://example.com'}).return();
console.log(result);  // undefined

// Invalid asynchronous call.
chromise.bookmarks.create(null).wait()
    .catch(console.log.bind(console));  // 'Error: ...'
~~~
