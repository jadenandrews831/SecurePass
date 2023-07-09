

// chrome.browserAction.onClicked.addListener(function(tab) {
//   // Send a message to the active tab
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     var activeTab = tabs[0];
//     const msg = {"message": "clicked_browser_action"};
//     console.log(msg);
//     chrome.tabs.sendMessage(activeTab.id, msg, function(result) {
//       console.log(result);
//     });
//   });
// });

chrome.tabs.onUpdated.addListener(function (tabID, changeInfo, tab) {
  if (changeInfo.url == 'http://localhost:8080/') {
    chrome.cookies.get({'url':'http://localhost:8080/', "name": "org-id"}, function(cookie){
      console.log(cookie.value);
      // chrome.storage.local.set({'org-id': cookie.value});  add org-id to local storage
      console.log('set cookie. try again')
    })
  }
});

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function (msg) {
    if (port.name == "bg_port"){
      const query = msg.message
      if (query == 'authenticate_sp'){
        chrome.cookies.get({'url':'http://localhost:8080/', "name": "org-id"}, function(cookie){
          if (cookie == undefined)
          {
            console.log("Error getting "+cookie);
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              var tab = tabs[0];
              chrome.tabs.update(tab.id, {url: 'http://localhost:8080/'});
              console.log("Chrome Extension: no user page loading")
            });
          }else {
            console.log(cookie.value);
            
            chrome.cookies.get({'url': 'http://localhost:8080/', 'name': 'type'}, function(cookie){
              if (cookie == undefined)
              {
                console.log(cookie);
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                  var tab = tabs[0];
                  chrome.tabs.update(tab.id, {url: 'http://localhost:8080/user_details.html'});
                  console.log("Chrome Extension: user details page loading - no type found")
                });
              }
              else{
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                  var tab = tabs[0];
                  console.log("Chrome Extension: loading default page loading")
                });
              }
            });
          }
          
        });
      }
    }
  });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "open_new_tab" ) {
      chrome.tabs.create({"url": request.url });
    } 
    else if ( request.message == 'no_org_id')
    {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        chrome.tabs.update(tab.id, {url: request.url});
        console.log("Chrome Extension: (background.js)");
      });
      
    }
    else if ( request.message == 'no_user')
    {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        chrome.tabs.update(tab.id, {url: request.url});
        console.log("Chrome Extension: no user page loading")
      })
    }
  }
);
