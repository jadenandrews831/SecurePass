const express = require("express");
const bodyParser = require('body-parser'); 
const cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3'); 
const set = require('./set.js'); 
const fs = require('fs')
const {Configuration, OpenAIApi} = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY    // OPENAI_API_KEY
});
console.log('api key: '+configuration.apiKey)
const openai = new OpenAIApi(configuration);

function getUser(req){
  const usr = req.body.first_name;
  const pass = req.body.last_name;
  let type = 'general';

  console.log(req.cookies);

  let user = {
    "username": usr,
    "password": pass,
    "org_code": req.cookies['org-id']
  }
  console.log(usr, pass, req.c);
  return user
}
function getUserName(req){
  let user = {
    "username": req.cookies['name'],
    "type": req.cookies['type'],
    "org_code": req.cookies['org-id']
  }
  console.log(user);
  return user
}

async function uploadFile(file) {
  try{
    const f = await openai.createFile(
      fs.createReadStream(file),
      "fine-tune"
    );
    console.log(`File ID: ${f.data.id}`)
    return f.data.id;
  } catch (err) {
    console.log(`err uploadfile: ${err}`)
  }
}

async function makeFineTune(id) {
  try{
    const ft = await openai.createFineTune({
      training_file: String(id),
      model: 'ada'
    });
    console.log(ft.data);
  } catch (err) {
    console.log(`err makefinetune: ${JSON.stringify(err.response.data.error)}`)
  }
}

async function getFineTunedModelName() {
  try {
    const modelName = await openai.listFineTunes();
    console.table(modelName.data.data, ["id", "status", "fine_tuned_model"]);
  } catch (err) {
    console.log(`err getmod: ${err}`);
  }
}

async function runTest() {
  try {
    const comp = await openai.createCompletion({
      model: getFineTunedModelName(),
      prompt: 'SSN: 478-32-9388',
      max_tokens: 50
    });
    if (comp.data){
      console.log(`choices: ${comp.data}`);
    }
  } catch (err) {
    console.log('err', err.response.statusText)
  }
}

async function startModel() {
  const id = await uploadFile('prompt_prepared.jsonl');
  makeFineTune(id);
  getFineTunedModelName();
  runTest();
}

// startModel();

async function run(text, type) {
  getFineTunedModelName();
  try {
    const comp = await openai.createCompletion({
      model: 'ada:ft-personal-2023-07-28-05-47-00',
      prompt: `${type}}: ${text}`,
      max_tokens: 30
    });
    if (comp.data){
      console.log('choices: ', comp.data.choices);
      const body = comp.data.choices[0].text;
      console.log('body: '+body);
      return body + '<br><br>'
    }
    return undefined
  } catch (err) {
    console.log('err run: ', err.response.status);
    return undefined
  }
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const Orgs = new set.Organizations('orgs.db');
const Users = new set.Users('users.db')


app.get("/", (req, res) => {
  if (req.cookies['org-id']) {
    if (req.cookies['type'] == 'admin'){
      console.log(JSON.stringify(req.cookies))
      res.sendFile(__dirname+'/securepass_admin.html');
    }
    else {
      res.sendFile(__dirname+'/securepass.html')
    }
    
  } else {
    res.sendFile(__dirname+'/index.html');
  }
  
});

app.get("/securepass.html", (req, res) => {
  res.sendFile(__dirname+'/securepass.html');
});

app.get('/report.html', (req, res) => {
  setTimeout(function () {
    res.sendFile(__dirname+'/report.html');   // slight delay to wait for user cookies to update
  }, 500);
})

app.get('*/index.css', (req, res) => {
  res.sendFile(__dirname+'/index.css');
})

app.get('*/report.js', (req, res) => {
  console.log("getting report")
  console.log("cookie: ", req.cookies['id'])
  getReport(req, res);
})

app.get("*/logo.png", (req, res) => {
  res.sendFile(__dirname+'/logo.png');
})


app.get('*/ui.js', (req, res) => {
  res.sendFile(__dirname+'/ui.js');
});

app.get('/json/report/:id', (req, res) => {
  reportIDJSON(req,res)
})

app.get('/report/', (req, res) => {
  setTimeout(() => {
    getReportID(req, res);
  }, 500);
})

app.get('/report/load/:id', (req, res) => {
  setTimeout(() => {
    res.redirect(`/report/${req.params.id}`)
  }, 1500);
})

app.get('/report/:id', (req, res) => {
  reportID(req, res);
})


app.get('/user_details.html', (req, res) => {
  console.log("Cookies:"+req.cookies['org-id']);
  res.sendFile(__dirname+'/user_details.html');
})

app.get('/users', (req, res) => {
  const id = req.query.id;
  console.log(id);
});

app.get ('/proxy', (req, res) => {
  console.log('incoming proxy connection');
  res.sendFile(__dirname+'/proxy.html');
});

app.get('*/rules.js', (req, res) => {
  getRules(req, res);
})

app.get('*/admin.js', (req, res) => {
  adminJS(req, res);
})


app.get('/rr/:name', (req, res) => {
  res.cookie('s_name', req.params.name);
  res.sendFile(__dirname+'/rules_and_reports.html');
})


app.post('/user_report.json', (req, res) => {
  console.log(req.body);
  let msg = req.body;
  let id = Math.floor(Math.random()*1000000000000);
  msg['sender'] = 'localhost:8080';
  msg['id'] = id;
  const date = new Date();
  msg['time'] = String(('0'+date.getHours()).slice(-2)+':'+("0"+date.getMinutes()).slice(-2)+':'+("0"+date.getSeconds()).slice(-2));
  console.log("id: "+id);
  console.log("Message: "+JSON.stringify(msg));
  Users.adduserReport(msg);
  if (req.cookies.hasOwnProperty('id')){
    res.clearCookie('id');
  }
  res.cookie('id', id);
  res.send(msg);
});

app.post("/", (req, res) => {
  login(req, res);
});

app.post("/user_details.html", (req, res) => {
  addUser(req, res);
});

app.post("/securepass.html", (req, res) => {
  res.clearCookie('org-id');
  res.clearCookie('type');
  res.redirect("http://localhost:8080/");
});

app.post("/adduser", (req, res) => {
  addNewUser(req, res);
  
});

app.post("/update_rule", (req, res) => {
  updateRule(req, res)
});

async function getReportID(req, res){
  const user = req.cookies['name']
  const lastReportID = await Users.getLastReport(user);
  setTimeout(function () {
    res.cookie('id', lastReportID)
    res.redirect(`/report/load/${lastReportID}`)
  }, 1000);
}

async function updateRule(req, res){
  let msg = req.body
  Users.updateRule(msg);
  res.send(`{
    message: rule updated;
  }`);
}

async function reportIDJSON(req, res){
  let report = await Users.getuserReport(req.params.id);
  if (report.length > 0){
    console.log("report: "+JSON.stringify(report));
    res.send(report)
  } else {
    res.send({report_id: null})
  }
}

async function reportID(req, res){
  let report = await Users.getuserReport(req.params.id);
  if (report.length > 0) {
    console.log('report: '+JSON.stringify(report));
    res.cookie('id', report[0].report_id)
    res.sendFile(__dirname+'/report.html');
  } else {
    res.redirect(`http://localhost:8080/load/${req.params.id}`)
  }
}


async function login(req, res)
{
  code = req.body.org_code; //get_org_code
  resp = await Orgs.searchByCode(code);
  if (resp){
    res.cookie("org-id", code);
    res.sendFile(__dirname+'/user_details.html');
  }
  if (!resp){
    res.sendFile(__dirname+'/index.html');   // use php for html dynamics
  }
  
}

async function getRules(req, res){
  const name = req.cookies['s_name'];
  let flags = await Users.getGroupStandardFlags(name);
  let usr_flags = await Users.getUserStandardFlags(name);
  
  
  if (flags == undefined){
    flags = await Users.getGrpStdFlags('generic');
  }

  console.log("flags: ", flags)
  console.log("usr_flags: ", usr_flags)

  flags = JSON.parse(flags)
  if (usr_flags !== undefined) {
    console.log("User has no flags")
    const keys = Object.keys(JSON.parse(usr_flags));
    const vals = Object.values(JSON.parse(usr_flags));
    const g_keys = Object.keys(flags);
    for (let i=0; i < vals.length; i++){
      if (g_keys.includes(keys[i])){
        let k = JSON.parse(usr_flags)[keys[i]];
        if (k !== null) {
          flags[keys[i]]=k;
          console.log('added: '+ keys[i] + " " + flags[keys[i]])
        }
      }
    }
  }
  
  const flag_keys = Object.keys(flags)
  let table = ''

  table += `
  <tr>
    <th>Rule</th>
    <th>Active</th>
  </tr>
  `
  for (let i =0; i < flag_keys.length; i++){
    table += `<tr><td>${flag_keys[i]}</td><td>`
    if (flags[flag_keys[i]].toLowerCase() == 'yes') {
      table += `exempt</td>`
    } else {
      table += `&#9989;</td>`
    }
    table += '</tr>'

  }

  table += `
  <tr>
    <th colspan=2 style="text-align: center;"><h1>Reports</h1></th>
  </tr>
  `

  const reports = await Users.getuserReports(name)
  if (reports.length > 0) {
    console.log(reports.length)
    for (let i = 0; i < reports.length; i++) {
      if (i > 10){
        break;
      }
      table += `<tr ><td colspan=2><a href="http://localhost:8080/report/${reports[i].report_id}">${reports[i].report_id}</a></td></tr>`
    }
  } else {
    table += `<tr><td colspan=2>No Reports</td></tr>`
  }


  // create table which displays each key from the standard rules and a radio button for yes or no.
  const modRuleText = `
  <table width=20% id="add_user_tbl" style="text-align: center">
  <tr>
    <th colspan=2 style="font-size: 23px; color: rgb(32.2, 34.9, 57.6);">Modify Rules<br><br></td>
  <tr>  
  <tr>
      <th>SSN:</th>
      <td width=60%><label for="yes">Active</label><input type="radio" class="yes" name="ssn_select" value="no" autocomplete="false" style="width: 100%"></td>
      <td width=60%><label for="no">Inactive</label><input type="radio" class="no" name="ssn_select" value="yes" autocomplete="false" style="width: 100%"></td>
    </tr>
    <tr>
      <th>EIN:</th>
      <td width=60%><input type="radio" class="yes" name="ein_select" value="no" autocomplete="false" style="width: 100%"></td>
      <td width=60%><input type="radio" class="no" name="ein_select" value="yes" autocomplete="false" style="width: 100%"></td>
    </tr>
    <tr>
      <th>Card:</th>
      <td width=60%><input type="radio" class="yes" name="card_select" value="no" autocomplete="false" style="width: 100%"></td>
      <td width=60%><input type="radio" class="no" name="card_select" value="yes" autocomplete="false" style="width: 100%"></td>
    </tr>
    <tr>
      <td style="text-align: right"><input type="submit" value="submit" id="submit_usr" onclick="send_rule()"></td><br><br>
    </tr>
    <tr>
      <td colspan=2 id="resp" style="text-align: center; color: red;"></td>
    </tr>
  </table>
  `


  res.send(`
  const tbl = document.querySelector('#users');
  const add = document.getElementById('add_user');
  const menu = document.getElementById('menu');

  menu.innerHTML = '<h1>Rules</h1>'

  function showModifyStandardRules() {
    manage.innerHTML =\`${modRuleText}\`
  }

  function send_rule() {
    const ssn = document.querySelectorAll('[name="ssn_select"]')
    const ein = document.querySelectorAll('[name="ein_select"]')
    const card = document.querySelectorAll('[name="card_select"]')

    results = {}

    for (let i = 0; i < ssn.length;i++){
      if (ssn[i].checked){
        results.ssn = ssn[i].value
      }
    }

    for (let i = 0; i < ein.length; i++){
      if (ein[i].checked){
        results.ein = ein[i].value
      }
    }

    for (let i = 0; i < card.length; i++){
      if (card[i].checked){
        results.card = card[i].value
      }
    }

    results.name = "${name}";

    fetch('http://localhost:8080/update_rule', {
      method: 'post',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(results)
    }).then(function(r) {
      let o = r.json();
      console.log(o)
      return o;
    }).then(function(data) {
      const msg = data.message
      console.log("message: ", msg)
    });
    
  }

  add.setAttribute('onclick', 'showModifyStandardRules()')
  add.setAttribute('value', 'change permissions');

  tbl.innerHTML = \`${table}\`
  `)
}


async function getReport(req, res)
{
  console.log('Report Cookies: '+JSON.stringify(req.cookies))
  console.log('params: ', req.params)
  let report = await Users.getuserReport(req.cookies['id']);
  console.log("getReport ID: "+ req.cookies['id'])
  
  console.log("flags:"+report[0].flags)
  if (report[0].flags == null || report[0].flags == 'No Flags Found (RETRY)'){
    console.log("finishing report")
    report[0].service = 'Linkedin'
    let name = report[0].username;
    report[0].admin = await Users.getUserAdmin(name);
    let flags = await Users.getGroupStandardFlags(name);
    let usr_flags = await Users.getUserStandardFlags(name);
    console.log("usr_flags: ", usr_flags)
    
    flags = JSON.parse(flags)
    if (usr_flags !== undefined) {
      console.log("User has no flags")
      const keys = Object.keys(JSON.parse(usr_flags));
      const vals = Object.values(JSON.parse(usr_flags));
      const g_keys = Object.keys(flags);
      for (let i=0; i < vals.length; i++){
        if (g_keys.includes(keys[i])){
          let k = JSON.parse(usr_flags)[keys[i]];
          if (k !== null) {
            flags[keys[i]]=k;
            console.log('added: '+ keys[i] + " " + flags[keys[i]])
          }
        }
    }
    }
    

    const flag_entries = Object.entries(flags)
    console.log(flag_entries)
    report[0].flags = 'None'
    for (let i=0; i < flag_entries.length; i++){
      if (flag_entries[i][1] == 'no') {
        if (report[0].flags == 'None'){
          report[0].flags = ''
        }
        let completion = await run(report[0].post_text, flag_entries[i][0].toUpperCase());
        completion = completion.split('\n')
        for (let i = 0; i < completion.length; i++){
          let flag = completion[i]
          if (flag.toLowerCase().includes("yes found here")){
            report[0].flags += `${flag_entries[i][0].toUpperCase()}: Yes Found Here: <br><p>${completion[i]}</p><br>`;
            break;
          } else if (flag.toLowerCase().includes('not found')){
            report[0].flags += `${flag_entries[i][0].toUpperCase()}: Not Found<br>`;
            break;
          } else {
            console.log(completion[i])
            report[0].flags += 'No Flags Found (RETRY)'
          }
        }
        console.log("Key: "+flag_entries[i][0])
      }
    }
    await Users.finishuserReport(report[0]);
  } 

  console.log("Report: "+report);
  if (report.hasOwnProperty(0))
  {
    console.log(report)
    console.log('REPORT: '+report[0].post_text+'\n\t'+report[0].report_id);
    const html = `
    let report = document.getElementById('report');
    console.log(report);
    report.innerHTML = \`
    <div>\
      <table width="75%" style="font-size: 24px; ">\
        <tr>\
          <th width="30%">User: </th>\
          <td width="35%" style="">${report[0].username}</td>\
          <th width="20%">Time: </th>\
          <td width="15%">${report[0].time}</td>\
        </tr>\
        <tr>
          <th>Service: </th>
          <td>${report[0].service}</td>
          <th>Report ID:</th>
          <td>${report[0].report_id}</td>
        </tr>
        <tr style="vertical-align: top;">
          <th>Admin Signature: </th>
          <td>${report[0].admin}</td>
        </tr>
        <tr style="vertical-align: top;">\
          <th>Post Body: </th>\
          <td colspan=3>${report[0].post_text}</td>\
        </tr>\
        <tr style="vertical-align: top;">
          <th>Attachments:</th>
          <td>${report[0].atchm}</td>
        </tr>
        <tr style="vertical-align: top;">\
          <th>Flags: </th>\
          <td>${report[0].flags}</td>\
        </tr>
      </table>\
    </div>\`;
    `;
    res.send(html);
  }else 
  {
    console.log("No Report Generated");
    console.log("Report: "+report);
    res.send(`
    let report = document.getElementById('report');
    report.innerHTML = "<p>No Report Generated</p>";
    `)
  }
  
}



async function addUser(req, res)
{
  const user = getUser(req)

  console.log(user);

  resp = await Users.searchForUser(user);
  if (resp){
    const admin = await Users.isAdmin(user);
    const usr = req.body.first_name;
    res.cookie('name', usr);
    type = 'general'
    if (admin){
      console.log('User is admin')
      type = 'admin'
    } 
    console.log("Admin: "+admin)
    res.cookie('type', type);
    res.redirect("http://localhost:8080");
  }
  if (!resp) {
    res.sendFile(__dirname+'/user_details.html');   // make webpage dynamic show user not found in database
  } 
}

async function addNewUser(req, res){
  let usr = req.body;
  console.log("password: "+usr.password);
  let added = await Users.checkForUser(usr);
  console.log("added: "+added)
  if (!added) {
    Users.addUser(usr);
    let add = await Users.checkForUser(usr);
    if (add){
      res.json({message: "User Added Successfully"})
    }
    else {
      res.json({message: "User not added"})
    }
  } else{
    res.json({message: "Cannot Add User"})
  }
}

async function adminJS(req, res){
  console.log('getting admin.js');
  const user = getUserName(req);
  console.log('User: '+JSON.stringify(user));
  let text = await Users.getAllUsers(user);
  text = JSON.parse(text)
  const menu = `
  <div id="menu">
  <h1>Users</h1>
  </div>
  <br>
  `
  const table = function(text) {
    let tbl = '<table style="text-align: center;" id="users">'
    let i;
    tbl+='<tr><th class="left head"><b>Username</b></th><th class="right head"><b>Group</b></th></tr>'
    for (i = 0; i < text.length; i++){
      if(text[i].grp == null || text[i].grp == "General User"){
        text[i].grp = "generic"
      }
      tbl+=`<tr><td class="left"><a href="http://localhost:8080/rr/${text[i].username}" class="data">${text[i].username}</a></td><td class="right"><a href="http://localhost:8080/rr/${text[i].grp}" class="data">${text[i].grp}</a></td></tr>`
    }
    tbl+='</table><br><br>'
    tbl+=`<input type="submit" id="add_user" value="add +" onclick="showAddUserWindow()">`
    return menu+tbl
  }

  const addUserText = `
  <table width=20% id="add_user_tbl" style="text-align: center">
  <tr>
    <th colspan=2 style="font-size: 23px; color: rgb(32.2, 34.9, 57.6);">Add New User +<br><br></td>
  <tr>  
  <tr>
      <th>Username:</th>
      <td width=60%><input type="text" id="username" autocomplete="false" style="width: 100%" required></td>
    </tr>
    <tr>
      <th>Password:</th>
      <td><input type="password" id="pswd" autocomplete="new-password" style="width: 100%" required></td>
    </tr>
    <tr>
      <th>Group:</th>
      <td><input type="text" id="usr_grp" style="width: 100%" required></td>
    </tr>
    <tr>
      <td style="text-align: left"><input type="submit" value="back" id="to_usrs" onclick="showUserTable()"></td>
      <td style="text-align: right"><input type="submit" value="add +" id="submit_usr" onclick="send_user()"></td><br><br>
    </tr>
    <tr>
      <td colspan=2 id="resp" style="text-align: center; color: red;"></td>
    </tr>
  </table>
  `

  const html = `
  const org_id = document.getElementById('org_id');
  org_id.innerHTML = "Organization ID: ${req.cookies['org-id']}"

  function showAddUserWindow() {
    manage.innerHTML = \`${addUserText}\`
  }

  function showUserTable(){
    manage.innerHTML = \`${table(text)}\`;
  }

  function send_user(){
    let username = document.getElementById('username');
    let pswd = document.getElementById('pswd');
    let usr_grp = document.getElementById('usr_grp');


    let user = {
      username: username.value,
      password: pswd.value,
      group: usr_grp.value,
      org_code: getCookie("org-id")
    }

    fetch('http://localhost:8080/adduser', {
      method: 'post',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user)
    }).then(function(r) {
      let o = r.json();
      console.log(o)
      return o;
    }).then(function(data) {
      const msg = data.message
      if (msg=="Cannot Add User"){
        console.log(msg)
        const resp = document.getElementById('resp');
        resp.innerHTML = ''
        setTimeout(function() {
          resp.innerHTML = msg
        }, 100)
      } else if (msg=="User Added Successfully") {
        console.log(msg)
        window.location.replace("http://localhost:8080/");
      } else {
        console.log(msg)
        const resp = document.getElementById('resp');
        resp.innerHTML = msg
      }
    });
  }
  

  console.log("Getting Users" );
  const manage = document.getElementById('manage');
  console.log(manage)

  showUserTable();
  
  `
  // 
  res.send(html);
}


app.listen(8080, () => {
  console.log("Listening on Port http://localhost:8080");
  Orgs.addOrg({"name":"Shiba Inu", "org_code":"W5IM3R5CSN11XMU"});
  Orgs.addOrg({"name":"Nikola", "org_code":"NZKIVUE90CXK66D"});
  Orgs.addOrg({"name":"Arizona", "org_code":"Y56U2VLC8GYRIN4"});
  Orgs.addOrg({"name":"Dom Inu", "org_code":"3OGG0E545FWG0R9"});
  Orgs.addOrg({"name":"Keltic", "org_code":"1FZHPQF40NY1RTH"});
});