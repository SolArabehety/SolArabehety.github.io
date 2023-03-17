'use strict';

/**
 * POC Webview support
 */
(function () {
  console.log('SDKs Webview support - POC');
  handleCalculateFID();
  handleCalculateFCP();
  handleCalculateLCP();
  handleCalculateCLS();
})();

/**
 * @param {{
 *  name: string;
 *  entryType: string;
 *  startTime: double;
 *  duration: double;
 * }[]} vitals
 */
function coreVitalParser(vitals) {
  if (!Array.isArray(vitals)) {
    return console.log("`vitals` is not an array. It's not possible to parse");
  };

  return JSON.stringify(vitals.map((v) => {
    const { name, entryType, startTime, duration, ...otherCoreVitals } = coreVital ? coreVital : {};

    return ({
      n: name,
      et: entryType,
      st: startTime,
      d: duration,
      pr: otherCoreVitals
    });  
  }));
};

/**
 * FID
 * https://web.dev/fid/#measure-fid-in-javascript
 */
function handleCalculateFID () {
  new PerformanceObserver(entryList => {
    var fidEntries = entryList.getEntries()[0];
    console.log('first-input', coreVitalParser(fidEntries));

    if (window.webkit) {
      window.webkit.messageHandlers.embraceFID.postMessage(coreVitalParser(fidEntries));
    }
  }).observe({type: 'first-input', buffered: true});
}

/**
 * FCP
 * https://web.dev/fcp/#measure-fcp-in-javascript
 */
function handleCalculateFCP () {
  new PerformanceObserver(entryList => {
    var fcpEntries = entryList.getEntriesByName('first-contentful-paint');
    console.log('first-contentful-paint', coreVitalParser(fcpEntries));

    if (window.webkit) {
      window.webkit.messageHandlers.embraceFCP.postMessage(coreVitalParser(fcpEntries));
    }
  }).observe({type: 'paint', buffered: true});
}

/**
 * LCP
 * https://web.dev/lcp/#measure-lcp-in-javascript
 */
function handleCalculateLCP () {
  new PerformanceObserver(entryList => {
    var lcpEntries = entryList.getEntries();

    console.log('largest-contentful-paint', coreVitalParser(lcpEntries));

    if (window.webkit) {
      window.webkit.messageHandlers.embraceLCP.postMessage(coreVitalParser(lcpEntries));
    }
  }).observe({type: 'largest-contentful-paint', buffered: true});
}

/**
 * CLS
 * https://web.dev/cls/#measure-cls-in-javascript
 * (basic script)
 */
function handleCalculateCLS() {
  var clsValue = 0;
  var clsEntries = [];

  var sessionValue = 0;
  var sessionEntries = [];

  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      // Only count layout shifts without recent user input.
      if (entry.hadRecentInput) {
        return;
      }

      const firstSessionEntry = sessionEntries[0];
      const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

      // If the entry occurred less than 1 second after the previous entry and
      // less than 5 seconds after the first entry in the session, include the
      // entry in the current session. Otherwise, start a new session.
      if (sessionValue &&
          entry.startTime - lastSessionEntry.startTime < 1000 &&
          entry.startTime - firstSessionEntry.startTime < 5000) {
        sessionValue += entry.value;
        sessionEntries.push(entry);
      } else {
        sessionValue = entry.value;
        sessionEntries = [entry];
      }

      // If the current session value is larger than the current CLS value,
      // update CLS and the entries contributing to it.
      if (sessionValue > clsValue) {
        clsValue = sessionValue;
        clsEntries = sessionEntries;

        // Log the updated value (and its entries) to the console.
        console.log('cumulative-layout-shift', coreVitalParser(clsEntries));

        if (window.webkit) {
          window.webkit.messageHandlers.embraceCLS.postMessage(coreVitalParser(clsEntries));
        }    
      }
    }
  }).observe({type: 'layout-shift', buffered: true});
}