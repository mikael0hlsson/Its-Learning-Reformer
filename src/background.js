
//chrome.tabs.onUpdated.addListener(function (tabId, sender, tab) {

//    if (tab.url.indexOf('mah.itslearning.com') > -1) {

//        chrome.pageAction.show(tabId);
//        chrome.pageAction.setTitle({tabId:tabId, title: "It's Learning Reformer"})
//    }
//});

function onRequest(request, sender, sendResponse) {
  // Show the page action for the tab that the sender (content script)
  // was on.
  chrome.pageAction.show(sender.tab.id);

  // Return nothing to let the connection be cleaned up.
  sendResponse({});
};

// Listen for the content script to send a message to the background page.
chrome.extension.onRequest.addListener(onRequest);