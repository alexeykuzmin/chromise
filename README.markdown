# Chromise

Promise based wrapper for [Chrome Extension API](https://developer.chrome.com/extensions/api_index).
Works in Google Chrome 42+ only.

## Usage examples
~~~js
// Synchronous call returns whatever original API method returns.
let language = chromise.i18n.getUILanguage().return();
console.log(language);  // 'en-US'

let result = chromise.bookmarks.create({url: 'http://example.com'}).return();
console.log(result);  // undefined

// Asynchronous call returns promise that eventually will be fulfilled
// with value "returned" in API response.
chromise.bookmarks.getChildren('0').wait()
    .then(console.log.bind(console));  // Array[2]

// Erroneous asynchronous call (with invalid signature for example)
// doesn't throw like original API method, but eventually rejects
// returned promise.
chromise.bookmarks.create(null).wait()
    .catch(console.log.bind(console));  // 'Error: ...'
~~~
