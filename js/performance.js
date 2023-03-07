'use strict';

/**
 * POC Webview support
 */
(function () {
  console.log('SDKs Webview support - POC');

  new PerformanceObserver(entryList => {
    var response = entryList.getEntries()[0];
    console.log('first-input', response);

    if (window.webkit) {
      window.webkit.messageHandlers.embraceFID.postMessage(response);
    }
  }).observe({type: 'first-input', buffered: true});

  new PerformanceObserver(entryList => {
    var response = entryList.getEntriesByName('first-contentful-paint');
    console.log('first-contentful-paint', response);

    if (window.webkit) {
      window.webkit.messageHandlers.embraceFCP.postMessage(response);
    }
  }).observe({type: 'paint', buffered: true});

  new PerformanceObserver(entryList => {
    var response = entryList.getEntries();

    console.log('largest-contentful-paint', response);

    if (window.webkit) {
      window.webkit.messageHandlers.embraceLCP.postMessage(response);
    }
  }).observe({type: 'largest-contentful-paint', buffered: true});
})();