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
    res.sendFile(__dirname+'/securepass.html')
  } else {
    res.sendFile(__dirname+'/index.html');
  }
  
});

app.get("/securepass.html", (req, res) => {
  res.sendFile(__dirname+'/securepass.html');
});

app.get("/logo.png", (req, res) => {
  res.sendFile(__dirname+'/logo.png')
})

app.get('/ui.js', (req, res) => {
  res.sendFile(__dirname+'/ui.js');
});

app.get('/index.css', (req, res) => {
  res.sendFile(__dirname+'/index.css')
})

app.get('/user_details.html', (req, res) => {
  console.log("Cookies:"+req.cookies['org-id'])
  res.sendFile(__dirname+'/user_details.html')
})

app.get('/users', (req, res) => {
  const id = req.query.id;
  console.log(id);
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
    res.sendFile(__dirname+'/index.html')   // use php for html dynamics
  }
  
}

async function addUser(req, res)
{
  const first = req.body.first_name;
  const last = req.body.last_name;
  const type = 'general';

  res.cookie('type', type);

  console.log(req.cookies);
  res.sendFile(__dirname+"/securepass.html");
}

app.listen(8080, () => {
  console.log("Listening on Port http://localhost:8080");
  Orgs.addOrg({"name":"Shiba Inu", "org_code":"W5IM3R5CSN11XMU"});
  Orgs.addOrg({"name":"Nikola", "org_code":"NZKIVUE90CXK66D"})
  Orgs.addOrg({"name":"Arizona", "org_code":"Y56U2VLC8GYRIN4"})
  Orgs.addOrg({"name":"Dom Inu", "org_code":"3OGG0E545FWG0R9"})
  Orgs.addOrg({"name":"Keltic", "org_code":"1FZHPQF40NY1RTH"})
});