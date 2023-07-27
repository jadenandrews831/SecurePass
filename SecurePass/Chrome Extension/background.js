let reporting = false;

function stopblocking(){
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

function startblocking(tab, post) {
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
      if (post){
        chrome.tabs.sendMessage(tab.id, {message:'click_post'});
      }
    });
}


chrome.tabs.onUpdated.addListener(function (tabID, changeInfo, tab) {
  console.log("tab info: "+Object.getOwnPropertyNames(changeInfo));
  console.log(changeInfo.audible)
  stopblocking();
  if (changeInfo.url == 'http://localhost:8080/') {
    chrome.cookies.get({'url':'http://localhost:8080/', "name": "org-id"}, function(cookie){
      console.log(cookie.value);
      // chrome.storage.local.set({'org-id': cookie.value});  add org-id to local storage
      console.log('set cookie');
    })
  }

  chrome.tabs.query({active: true, url: `http://localhost:8080/report/report.html`}, function (tbs) {
    reporting = true;
    if (tbs.length > 1){
      chrome.tabs.remove(tabID, function () {
        console.log("stopped multiple tabs from opening")
      });
    }
    if (tbs.length == 0 || tbs.length == undefined) {
      reporting = false;
    }
    
  })

  if (changeInfo.audible == false){
    console.log("blocking")
    chrome.tabs.query({active:true, audible:true}, function (tabs) {
      let tab = tabs[0];
      startblocking(tab, false);
    });
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
          startblocking(tab.id, false);
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
        stopblocking();
        console.log("making new report");
        chrome.tabs.query({active:true, currentWindow: true}, function(tabs) {
          var tab = tabs[0];
          startblocking(tab, false);
          console.log("tabs: "+Object.getOwnPropertyNames(tab))
          waitForLoad(tab);
          console.log('loaded from background...')
        })
      }

      if (query == 'click'){
        chrome.tabs.query({active:true, status:'complete'}, function (tabs) {
          var tab = tabs[0];
          startblocking(tab, true);
        }); 

      }

      if (query == 'post_submitted'){
        chrome.tabs.query({url: 'http://localhost:8080/report.html'}, function (response) {
          console.log("Submitting Post")
          console.log("Reporting: "+reporting)
          console.log(response[0]);  
          if (response == '' || response == undefined) {
            chrome.cookies.get({'url': 'http://localhost:8080/', 'name': 'id'}, function(cookie) {
              chrome.tabs.query({url: `http://localhost:8080/report/*`}, function (resp) {
                console.log("resp.length: "+resp.length)
                if (resp.length == 0){
                  chrome.tabs.create({"url": `http://localhost:8080/report/` }, function (tabs) {
                    reporting = true;
                    chrome.tabs.query({active: true, url: `http://localhost:8080/report/`}, function (tbs){
                      console.log("Number of report tabs: "+tbs.length)
                    })
                  });
                } else {
                  chrome.tabs.update(resp[0].id, {highlighted: true})
                }
                
              })
            })
          } else {
            chrome.tabs.update(response[0].id, {highlighted: true});
            chrome.tabs.reload(response[0].id, function (err) {
              console.log("Err: "+err)
              console.log("tab reloaded");
            });
          }
          chrome.tabs.query({active: true, highlighted: true}, (tabs) => {
            let tab = tabs[0]
            startblocking(tab, true);
          })
        })
      }

      if (query == 'clicked_ex'){
        stopblocking();
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
                console.log("r: "+JSON.stringify(r))
                return r.json();
              }).then(function(data) {
                console.log("Data from post_data: "+JSON.stringify(data));
                //set cookie to id
                chrome.cookies.set({"url": "http:localhost:8080/", "name": "id", "value": String(data.id)}, function(cookie) {
                  console.log("reset cookie: "+cookie)
                })
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
