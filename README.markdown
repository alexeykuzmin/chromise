# Chromise 1.0.0

Promise based wrapper for asynchronous [Chrome Extension API](https://developer.chrome.com/extensions/api_index).
Works in Google Chrome 42+ only.

## Usage examples
~~~js
// Returns promise that eventually will be fulfilled
// with value "returned" in API response.
chromise.bookmarks.getChildren('0')
    .then(console.log.bind(console));  // Array[2]

// Erroneous call (with invalid signature for example)
// doesn't throw like original API method, but eventually rejects
// returned promise.
chromise.bookmarks.create(null)
    .catch(console.log.bind(console));  // 'Error: ...'
~~~
