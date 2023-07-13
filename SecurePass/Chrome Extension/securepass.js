let bg_port = chrome.runtime.connect({"name":"bg_port"});  // constant connection to the background script

bg_port.postMessage({message:"authenticate_sp"});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    let bg_port = chrome.runtime.connect({"name":"bg_port"});
    console.log("Request: ", request)
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);

      chrome.runtime.sendMessage({"message": "open_new_tab", "url": 'http://localhost:8080'});
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

    if (request.message == 'on_feed'){
      const post = document.getElementsByClassName("artdeco-button artdeco-button--muted artdeco-button--4 artdeco-button--tertiary ember-view share-box-feed-entry__trigger");
      if (post.length >= 1) {
        console.log('post: '+post[0]);
        post[0].addEventListener('click', () => {
          bg_port.postMessage({message:'new_report'});
        });
      }
    }

    if (request.message == 'submit_post') {
      console.log("securepass.js got message from background: submit_post")
      chrome.devtools.network.onRequestFinished.addListener(() => {
        bg_port.postMessage({message: 'request_post'});
        console.log('requesting post on bg');
      });
    }
    if (request.message == 'post'){
      // const post = document.getElementsByClassName("share-actions__primary-action artdeco-button artdeco-button--2 artdeco-button--primary");
      // console.log('post element: '+Object.getOwnPropertyNames(post));
      // post[0].addEventListener('click', () => {
      //   bg_post.postMessage({message: "post_clicked"})
      // });
      console.log("proxy should capture posted data");
      bg_port.postMessage({message: 'click'});
    }
    if (request.message == 'click_post'){
      let bg_port = chrome.runtime.connect({"name":"bg_port"});
      console.log("click_post: getting post and ex");
      setTimeout(() => {
        const ex = document.getElementsByClassName("artdeco-modal__dismiss artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--2 artdeco-button--tertiary ember-view")[0];
        setTimeout(() => {
          console.log('ex element: '+ex.tagName);
          const post = document.getElementsByClassName("share-actions__primary-action artdeco-button artdeco-button--2 artdeco-button--primary ember-view");
          setTimeout(() => {
            console.log('post btn element: '+post[0].tagName);
            post[0].addEventListener('click', () => {
              let bg_port = chrome.runtime.connect({"name":"bg_port"});
              bg_port.postMessage({message: 'post_submitted'});
              const post_text = document.querySelector(".ql-editor p");
              console.log("clicked post");
              let post_text_data = post_text.innerHTML;
              bg_port = chrome.runtime.connect({"name":"bg_port"});
              bg_port.postMessage({message: "post_data", body: post_text_data})
            });
          }, 1000)
          ex.addEventListener('click', () => {
            console.log("clicked ex");
            bg_port.postMessage({message: 'clicked_ex'});
          });
          
        }, 1000);
      }, 2500);
      
    }
  }
);