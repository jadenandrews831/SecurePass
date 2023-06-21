/**
 * 1) Load chrome.storage values for org code and instance id
 * 2) Check for org code and instance id
 * 3) if null, navigate to new tab and have user provide org id and user details.
 */

chrome.storage.local.get(['org'], (result) => {
  if (chrome.runtime.lastError)
      console.log('Error getting'+result);
      

  console.log('Retrieved name: \'' + Object.getOwnPropertyNames(result)+'\'');
  console.log(Object.getOwnPropertyNames(result).length)
  if (Object.getOwnPropertyNames(result).length == 0)
  {
    chrome.runtime.sendMessage({'message': "no_org_id", 'url':'localhost:8080'})
  }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);

      chrome.runtime.sendMessage({"message": "open_new_tab", "url": 'localhost:8080'});
    }
  }
);