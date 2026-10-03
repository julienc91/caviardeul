// Inlined in the document head to apply the stored color mode before the
// first paint: settings live in the browser storage, so the server always
// renders the default (dark) mode, which would otherwise flash on page load
export const themeScript = `(function () {
  try {
    var settings = JSON.parse(localStorage.getItem("settings") || "null");
    document.documentElement.dataset.theme =
      settings && settings.lightMode ? "light" : "dark";
  } catch (e) {}
})();`;
