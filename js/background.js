chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ duration: 45, notiEnabled: false, }, function () {
        console.log("Installed");
    });
});
chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        width: 318,
        height: 550,
        focused: true,
    });
});

