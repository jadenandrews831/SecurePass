/**
 * 1) Load chrome.storage values for org code and instance id
 * 2) Check for org code and instance id
 * 3) if null, navigate to new tab and have user provide org id and user details.
 */


// if there is no org code saved, the user has not signed in
// chrome.cookies.get({"url": "https://localhost:8080", "name": "org-id"}, function (result) {
//   if (chrome.runtime.lastError){
//     console.log('Error getting'+result);
//   }
//   chrome.cookies.getAll({}, function (cookies) {
//     console.log(cookies);
//   });
//   console.log('Retrieved name: \'' + Object.getOwnPropertyNames(result)+'\'');
//   console.log(Object.getOwnPropertyNames(result).length)
//   if (Object.getOwnPropertyNames(result).length == 0){
//     chrome.runtime.sendMessage({'message': "no_org_id", 'url':'http://localhost:8080'});
//     chrome.tabs.onActivated.addListener(function (tab) {
//       console.log('tab: ', tab);
//     });
//   } else {
//     // wait until the current page is a posting page
//     // if the current page is a posting page, identify the structure of the post and upon submission retrieve each part of the post and format it for submission to the GPT model
//     console.log('[SecurePass] - Signed in!')
//   }
// });

const bg_port = chrome.runtime.connect({"name":"bg_port"});  // constant connection to the background script

bg_port.postMessage({message:"authenticate_sp"});


// redirects social media page to SecurePass
// chrome.storage.local.get(['org-id'], (result) => {
//   if (chrome.runtime.lastError){
//     console.log('Error getting'+result);
//   }
      
//   console.log('Retrieved name: \'' + Object.getOwnPropertyNames(result)+'\'');
//   console.log(Object.getOwnPropertyNames(result).length)
//   if (Object.getOwnPropertyNames(result).length == 0){
//     chrome.runtime.sendMessage({'message': "no_org_id", 'url':'http://localhost:8080'});
//     chrome.tabs.onActivated.addListener(function (tab) {
//       console.log('tab: ', tab);
//     });
//   } else {
//     // wait until the current page is a posting page
//     // if the current page is a posting page, identify the structure of the post and upon submission retrieve each part of the post and format it for submission to the GPT model
//    chrome.storage.local.get(['type'], (result) => {
//     if (chrome.runtime.lastError){
//       console.log('Error getting'+result);
//     }

//     if (Object.getOwnPropertyNames(result).length == 0){
//       chrome.runtime.sendMessage({'message': "no_user", 'url':'http://localhost:8080/user_details.html'});
//       chrome.tabs.onActivated.addListener(function(tab) {
//         console.log('tab:', tab);
//       })
//     }
//    });
//   }
// });



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Request: ", request)
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);

      chrome.runtime.sendMessage({"message": "open_new_tab", "url": 'http://localhost:8080'});
    }
    if (request.message == "save_org_id") {
      console.log('Chrome Extension Listening');
      chrome.storage.local.get( ['org-id'], data => {
        let value = data.id || null;
        chrome.storage.local.set({'id': value})
      } );
    }
    if (request.message === 'org-id'){
      console.log(request.id);
    }
    if (request.message == 'securepass_open') {
      const org = document.getElementById('org_code');
      const submit = document.getElementById('submit');

      submit.addEventListener('click', () => {
        const val = org.value;
        chrome.runtime.sendMessage('', {
          type: 'save_org_id',
          id: val
        });
        console.log("logging value");
        console.log("val"+val);
      });
    }
  }
);