'use strict';

/**
 * POC Webview support
 */
(function () {
  console.log('SDKs Webview support - POC');

  new PerformanceObserver(entryList => {
    var response = entryList.getEntries()[0];
    console.log('first-input', JSON.stringify(response));

    if (window.webkit) {
      window.webkit.messageHandlers.embraceFID.postMessage(JSON.stringify(response));
    }
  }).observe({type: 'first-input', buffered: true});

  new PerformanceObserver(entryList => {
    var response = entryList.getEntriesByName('first-contentful-paint');
    console.log('first-contentful-paint', JSON.stringify(response));

    if (window.webkit) {
      window.webkit.messageHandlers.embraceFCP.postMessage(JSON.stringify(response));
    }
  }).observe({type: 'paint', buffered: true});

  new PerformanceObserver(entryList => {
    var response = entryList.getEntries();

    console.log('largest-contentful-paint', JSON.stringify(response));

    if (window.webkit) {
      window.webkit.messageHandlers.embraceLCP.postMessage(JSON.stringify(response));
    }
  }).observe({type: 'largest-contentful-paint', buffered: true});
})();