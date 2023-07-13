
chrome.tabs.onUpdated.addListener(function (tabID, changeInfo, tab) {
  console.log("tab info: "+Object.getOwnPropertyNames(changeInfo));
  if (changeInfo.url == 'http://localhost:8080/') {
    chrome.cookies.get({'url':'http://localhost:8080/', "name": "org-id"}, function(cookie){
      console.log(cookie.value);
      // chrome.storage.local.set({'org-id': cookie.value});  add org-id to local storage
      console.log('set cookie');
    })
  }

  function monitorPost(){
    console.log("current tab: "+tab.id)
    chrome.tabs.sendMessage(tab.id, 
      {message: "on_feed"}, 
      function () {
        console.log('tabid: '+tab.id);
        console.log('on feed');
    });
  }

  const linkedin_rgx = /https:\/\/www.linkedin.com\/in\/[\w]+\/overlay\/create-post\//
  // regex matching generic linkedin post url
  if (linkedin_rgx.test(changeInfo.url)){
    
    chrome.tabs.create({"url": 'http://localhost:8080/report.html' });
  }

  if (tab.url == 'https://www.linkedin.com/feed/'){
    monitorPost();
  }             
  
});

chrome.runtime.onConnect.addListener(function(port) {
  function waitForLoad(tab){
      chrome.tabs.query({active:true, status:'complete'}, function (tabs) {
        var tab = tabs[0];
        console.log("tab.id: "+tab.id);
        console.log("status: "+tab.status);
        if (tab.status == 'complete'){
          chrome.tabs.sendMessage(tab.id, {message:'post'});
          console.log("Waiting for post request")
          
        }
      }) 
    
    
  }
  port.onMessage.addListener(function (msg) {
    if (port.name == "bg_port"){
      const query = msg.message;
      if (query == 'authenticate_sp'){
        chrome.cookies.get({'url':'http://localhost:8080/', "name": "org-id"}, function(cookie){
          if (cookie == undefined)
          {
            console.log("Error getting "+cookie);
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              var tab = tabs[0];
              chrome.tabs.update(tab.id, {url: 'http://localhost:8080/'});
              console.log("Chrome Extension: no user page loading");
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
      if (query == 'new_report'){
        console.log("making new report")
        chrome.tabs.query({active:true, currentWindow: true}, function(tabs) {
          var tab = tabs[0];
          console.log("tabs: "+Object.getOwnPropertyNames(tab))
          waitForLoad(tab);
          console.log('loaded from background...')
        })
      }

      if (query == 'post_clicked'){
        chrome.tabs.query({url: 'http://localhost:8080/report.html'}, function (response) {
          console.log(response);  
          if (response == '' || response == undefined) {
            chrome.tabs.create({"url": 'http://localhost:8080/report.html' });
          } else {
            chrome.tabs.update(response[0].id, {highlighted: true});
          }
        })
      }

      if (query == 'click'){
        chrome.tabs.query({active:true, status:'complete'}, function (tabs) {
          var tab = tabs[0];
          chrome.declarativeNetRequest.updateDynamicRules(
          {
            addRules: [
              {
                action: {
                  type: "block",
                },
                condition: {
                  urlFilter: "www.linkedin.com", // block URLs that starts with this
                  domains: ["linkedin.com"], // on this domain
                },
                id: 2,
                priority: 1,
              },
            ],
            removeRuleIds: [2], // this removes old rule if any
          },
          () => {
            console.log("successfully blocked post");
            chrome.tabs.sendMessage(tab.id, {message:'click_post'});
          });
        }); 

      }

      if (query == 'post_submitted'){
        chrome.tabs.query({url: 'http://localhost:8080/report.html'}, function (response) {
          console.log("Submitting Post")
          console.log(response);  
          if (response == '' || response == undefined) {
            chrome.tabs.create({"url": 'http://localhost:8080/report.html' });
          } else {
            chrome.tabs.update(response[0].id, {highlighted: true});
          }
        })
      }

      if (query == 'clicked_ex'){
        chrome.declarativeNetRequest.updateDynamicRules
        (
          {
            removeRuleIds: [2]
          },
          (response) => {
            console.log("response: "+response);
            console.log('rule removed');
          }
        );
      }

      if (query == 'post_data'){
        console.log('post_data:');
        console.log(msg.body);
        let message = {body: msg.body};
        chrome.cookies.get({'url':'http://localhost:8080/', "name": "org-id"}, function(cookie){
          console.log(cookie.value);
          message['org_id'] = cookie.value;
          chrome.cookies.get({'url': 'http://localhost:8080', "name": "name"}, (cookie) => {
            console.log(cookie.value);
            message['name'] = cookie.value;
            chrome.cookies.get({'url': 'http://localhost:8080', "name": "type"}, (cookie) => {
              console.log(cookie.value);
              message['type'] = cookie.value; 
              console.log('message type: '+message.type);
              fetch('http://localhost:8080/user_report.json', {
                method: 'post',
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(message)
              }).then(function(r) {
                return r.json();
              }).then(function(data) {
                console.log(data);
              });
            });
          });
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
