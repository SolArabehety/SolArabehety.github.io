"use strict";
const EMBRACE_KEY = "EMBRACE_METRIC";
const PLATFORMS = {
  RN: "REACT_NATIVE",
  A: "Android",
  I: "iPhone",
  D: "Default",
};

const POST_MESSAGE_BY_PLATFORM = {
  REACT_NATIVE: window.ReactNativeWebView
    ? window.ReactNativeWebView.postMessage
    : console.log,
  Android: console.log,
  iOS: window.webkit
    ? window.webkit.messageHandlers?.embrace?.postMessage
    : console.log,
  Default: console.log,
};

function getPlatform() {
  const isRN = !!window.ReactNativeWebView;
  if (isRN) return PLATFORMS.RN;
  const isAndroid = window.navigator.userAgent.includes(PLATFORMS.A);
  if (isAndroid) return PLATFORMS.A;
  const isIos =
    window.webkit && window.navigator.userAgent.includes(PLATFORMS.I);
  if (isIos) return PLATFORMS.I;
  return PLATFORMS.D;
}

const platform = getPlatform();
/**
 * POC Webview support
 */
(function () {
  console.log("SDKs Webview support - POC");
  handleCalculateFID();
  handleCalculateFCP();
  handleCalculateLCP();
  handleCalculateCLS();
})();

/**
 * @param {
 *  message: string;
 * } message
 */
function sendMessageToEmbrace(message) {
  const messageToSend = coreVitalParser(message);
  POST_MESSAGE_BY_PLATFORM[platform](messageToSend);
}

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
  }

  const METRICS = {
    "largest-contentful-paint": "LCP",
    paint: "FCP",
    "layout-shift": "CLS",
    "first-input": "FID",
  };

  const response = JSON.parse(JSON.stringify(vitals)).map(
    ({ name, entryType, startTime, duration, ...otherCoreVitals }) => {
      return {
        key: EMBRACE_KEY,
        n: !!name ? name : entryType,
        t: METRICS[entryType],
        st: startTime,
        d: duration,
        u: window.location.href,
        p: otherCoreVitals,
      };
    }
  );

  return JSON.stringify(response);
}

/**
 * FID
 * https://web.dev/fid/#measure-fid-in-javascript
 */
function handleCalculateFID() {
  new PerformanceObserver((entryList) => {
    var fidEntries = entryList.getEntries();
    sendMessageToEmbrace(fidEntries);
  }).observe({ type: "first-input", buffered: true });
}

/**
 * FCP
 * https://web.dev/fcp/#measure-fcp-in-javascript
 */
function handleCalculateFCP() {
  new PerformanceObserver((entryList) => {
    var fcpEntries = entryList.getEntriesByName("first-contentful-paint");
    sendMessageToEmbrace(fcpEntries);
  }).observe({ type: "paint", buffered: true });
}

/**
 * LCP
 * https://web.dev/lcp/#measure-lcp-in-javascript
 */
function handleCalculateLCP() {
  new PerformanceObserver((entryList) => {
    var lcpEntries = entryList.getEntries();
    sendMessageToEmbrace(lcpEntries);
  }).observe({ type: "largest-contentful-paint", buffered: true });
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
      if (
        sessionValue &&
        entry.startTime - lastSessionEntry.startTime < 1000 &&
        entry.startTime - firstSessionEntry.startTime < 5000
      ) {
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
        sendMessageToEmbrace(clsEntries);
      }
    }
  }).observe({ type: "layout-shift", buffered: true });
}