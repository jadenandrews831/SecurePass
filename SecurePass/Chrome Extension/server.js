const express = require("express");
const bodyParser = require('body-parser'); 
const cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3'); 
const set = require('./set.js'); 

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const Orgs = new set.Organizations('orgs.db');
const Users = new set.Users('users.db')

app.get("/", (req, res) => {
  if (req.cookies['org-id']) {
    res.sendFile(__dirname+'/securepass.html');
  } else {
    res.sendFile(__dirname+'/index.html');
  }
  
});

app.get("/securepass.html", (req, res) => {
  res.sendFile(__dirname+'/securepass.html');
});

app.get('/report.html', (req, res) => {
  res.sendFile(__dirname+'/report.html');
})

app.get('/report.js', (req, res) => {
  console.log("getting report")
  getReport(req, res);
})

app.get("/logo.png", (req, res) => {
  res.sendFile(__dirname+'/logo.png');
})

app.get('/ui.js', (req, res) => {
  res.sendFile(__dirname+'/ui.js');
});

app.get('/index.css', (req, res) => {
  res.sendFile(__dirname+'/index.css');
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

app.post('/user_report.json', (req, res) => {
  console.log(req.body);
  let msg = req.body;
  let id = Math.floor(Math.random()*10000000);
  msg['sender'] = 'localhost:8080';
  msg['id'] = id;
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
  res.sendFile(__dirname+'/access.html');
});

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

async function getReport(req, res)
{
  console.log('Report Cookies: '+JSON.stringify(req.cookies));
  let report = await Users.getuserReport(req.cookies['id']);
  if (report)
  {
    console.log('REPORT: '+report[0].post_text);
    res.send(`
  let report = document.getElementById('report');
  console.log(report);
  report.innerHTML = "<h1>Post Body:</h1><br><p>${report[0].post_text}</p>";
  `);
  }
  if (!report)
  {
    console.log("Not Report Found");
    res.send(`
    let report = document.getElementById('report);
    report.innerHTML = "No Report Generated";
    `)
  }
  
}

async function addUser(req, res)
{
  const usr = req.body.first_name;
  const pass = req.body.last_name;
  let type = 'general';

  console.log(req.cookies);

  let user = {
    "username":usr,
    "password": pass,
    "org_code": req.cookies['org-id']
  }

  console.log(user);

  resp = await Users.searchForUser(user);
  if (resp){
    const admin = await Users.isAdmin(user);
    
    res.cookie('name', usr)
    if (admin){
      console.log("Admin: "+admin)
      console.log('User is admin')
      type = 'admin'
      res.cookie('type', type);
      res.sendFile(__dirname+"/securepass_admin.html");
    } else {
      console.log("Admin: "+admin)
      res.cookie('type', type);
      res.sendFile(__dirname+'/securepass.html')
    }
    
    
  }
  if (!resp) {
    res.sendFile(__dirname+'/user_details.html');   // make webpage dynamic show user not found in database
  }

  

  
}

app.listen(8080, () => {
  console.log("Listening on Port http://localhost:8080");
  Orgs.addOrg({"name":"Shiba Inu", "org_code":"W5IM3R5CSN11XMU"});
  Orgs.addOrg({"name":"Nikola", "org_code":"NZKIVUE90CXK66D"});
  Orgs.addOrg({"name":"Arizona", "org_code":"Y56U2VLC8GYRIN4"});
  Orgs.addOrg({"name":"Dom Inu", "org_code":"3OGG0E545FWG0R9"});
  Orgs.addOrg({"name":"Keltic", "org_code":"1FZHPQF40NY1RTH"});
});