# Chromise 3.1.0

Promise based wrapper for asynchronous [Chrome Extension API](https://developer.chrome.com/extensions/api_index).  
This version works in Google Chrome 47+ only.  
Check compatibility table below to find Chromise version for previous Chrome versions.  

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

## Chromise and Chrome versions
Chromise **1.0.*** – Chrome **42+**  
Chromise **2.0.*** – Chrome **45+**  
Chromise **3.0.*** – Chrome **47+**  
