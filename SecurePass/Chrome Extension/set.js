const sqlite3 = require('sqlite3');
const crypto = require('crypto');
const papa = require('papaparse');
const fs = require('fs');


function hash_code(code){
  code = code + code[6];                       // salt with the 7th character in the password
  var hash = crypto.createHash('sha256');
  data = hash.update(code, 'utf-8');
  code_hash = data.digest('hex');
  return code_hash;
}

class Organizations{
  constructor(db_name){
    this.db_name
    this.db = new sqlite3.Database(db_name, (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Connected to ${db_name}`);
    });
    this.createTable();
  }

  createTable() {
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS Organizations (
        Name text not null,
        code_hash text primary key not null
    );
        `, (err)  => {
          if (err){
            console.error(err);
            return;
          }
            console.log("table created");
            console.log(this.db);
    });

  }


  addOrg(org) {
    this.db.all(`INSERT INTO Organizations (name, code_hash) VALUES (@name, @code);
      `, {'@name':org['name'], '@code': hash_code(org['org_code'])}, (err)  => {
          console.log(hash_code(org['org_code']));
          if(err){
            if (err.code == 'SQLITE_CONSTRAINT'){
              console.log("Org not added");
              console.log("Organization already added");
            }
          }
          else if (this.checkForOrg(org)) {
            console.log(org['name']);
            console.log("Added new org");
          }
        });
  }

  searchByCode(code) {
    return new Promise(send => {
      this.db.all(`
      SELECT name FROM Organizations WHERE code_hash=@code;
      `, {'@code': hash_code(code)}, (err, rows) => {
        if(err){
          if (err.code == 'SQLITE_CONSTRAINT') {
            send(false);
            console.log("Something went wrong");
            console.log(this.db.rows);
            console.log(err);
          } 
          console.log("An error occurred.");
        }
        else if (rows.length == 0){
          console.log(hash_code(code));
          send(false);
        } else if (rows.length >= 1){
          rows.forEach(row => {
            console.log(row);
          })
          console.log("Found org " + rows[0].Name + " with matching code");
          send(true);
        } else {
          send(false);
          console.log("Hmm... something went wrong. Multiple orgs Found");
        }
      })
    })
  }

  checkForOrg(org) {
    return new Promise(send => { 
      this.db.all(`
      SELECT name FROM Organizations WHERE name=@name AND code_hash=@code;
      `, {'@name': org['name'], '@code': hash_code(org['org_code'])}, (err, rows) => {
        if (err){
          if (err.code == 'SQLITE_CONSTRAINT') {
            send(false);
            console.log("Organization already added");
            console.log(this.db.rows);
            console.log(err);
          } 
        }
        else if (rows.length == 0){
          send(false);
        } else if (rows.length >= 1){
          rows.forEach(row => {
            console.log(row);
          })
          console.log("Found org " + rows[0].Name + " with matching code");
          send(true);
        } else {
          send(false);
          console.log("Hmm... something went wrong. Multiple orgs Found")
        }

        });
    });
  }
}

class Users{
  constructor(db_name){
    this.db_name
    this.db = new sqlite3.Database(db_name, (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Connected to ${db_name}`);
    });
    this.db.get("PRAGMA foreign_keys = ON");
    this.createTable();
    this.createReportsTable();
  }
  createTable() {
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
        username text primary key not null,
        pass_hash text not null,
        code_hash text not null,
        grp text
    );
        `, (err)  => {
          if (err){
            console.error(err);
            return;
          }
            console.log("table created");
            console.log(this.db)
            this.loadCSV(__dirname+'/users.csv');
    });
  }

  createReportsTable() {
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS Reports (
      post_text text not null,
      report_id text PRIMARY KEY not null,
      username text REFERENCES Users(username) not null
    );
    `, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("reports table created");
      console.log(this.db);
    })
  }

  adduserReport(msg){
    this.db.all(`INSERT INTO Reports (post_text, report_id, username) VALUES (@text, @id, @usr)`, 
    {'@text': msg['body'], '@id': msg['id'], '@usr': msg['name']}, (err) => {
      if (err) {
        console.log(err);
        console.log('duplicate report')
      } else {
        console.log('report added');
     }
    })
  }

  getuserReport(id){
    return new Promise(send => {
      this.db.all(`
        SELECT post_text FROM Reports WHERE report_id=@id
      `, {'@id': id}, (err, rows) => {
        if (err){
          console.error(err);
          send(err);
        } else {
          rows.forEach(row => {
            console.log(row);
          })
          send(rows);
        }
      })
    })
  }

  addUser(user) {
    this.db.all(`INSERT INTO Users (username, pass_hash, code_hash, grp) VALUES (@usr, @pass, @code, @grp)`, 
      {'@usr':user['username'], '@pass':hash_code(user['password']), '@code': hash_code(user['org_code']), '@grp': user['group']}, (err)  => {
      console.log(hash_code(user['username']));
      if(err){
        if (err.code == 'SQLITE_CONSTRAINT'){
          console.log("User not added")
          console.log("User already exists")
        }
        console.log(err.code);
      }
      else if (this.checkForUser(user)) {
        console.log(user['username'])
        console.log("Added new user");
      }
    });
  }

  isAdmin(user) {
    return new Promise(send => {
      console.log("checking admin status");
      let s_value = false;
      this.db.all(`
        SELECT username FROM Users WHERE username=@usr AND grp=@grp
        `, {'@usr': user['username'], '@grp': 'admin'}, (err, rows) => {
        if (err){
          if (err.code == 'SQLITE_CONSTRAINT') {
            console.log("User already added");
            console.log(this.db.rows);
            console.log(err);
            send(false);
          } 
        } else {
          console.log("Rows: ")
          rows.forEach(row => {
            console.log(row);
          })
          console.log("Rows length: "+rows.length)
          if (rows.length >= 1){
            
            console.log("Found user " + rows[0].username + " as " + rows[0].grp);
            console.log(Object.getOwnPropertyNames(rows[0]));
            s_value = true;
            console.log('s_value: '+ s_value)
            send(true);
          }else {
            console.log(rows);
            send(false);
          }
        }
      });
    });
  
  }

  loadCSV(file) {
    const file_data = fs.readFileSync(file, {encoding: 'utf8', flag:'r'});    // provide the full path to file
    const json_data = papa.parse(file_data).data;
    for (let i = 1; i < json_data.length; i++){
      var user = {
                  'username': json_data[i][0], 
                  'password': json_data[i][1], 
                  'org_code': json_data[i][2],
                  'group': json_data[i][3]
                }
      console.log(user);
      this.addUser(user);
    }
  }

  checkForUser(user) {
    return new Promise(send => { 
      this.db.all(`
      SELECT username FROM Users WHERE username=@username AND code_hash=@code;
      `, {'@username': user['username'], '@code': hash_code(user['org_code'])}, (err, rows) => {
        if (err){
          if (err.code == 'SQLITE_CONSTRAINT') {
            send(false);
            console.log("Organization already added")
            console.log(this.db.rows)
            console.log(err);
          } 
        }
        else if (rows.length == 0){
          send(false);
        } else if (rows.length >= 1){
          rows.forEach(row => {
            console.log(row);
          })
          console.log("Found user " + rows[0].username + " with matching code");
          send(true);
        } else {
          send(false);
          console.log("Hmm... something went wrong. Multiple users Found")
        }

      });
    });
  }

  searchForUser(user) {
    return new Promise(send => {
      this.db.all(`SELECT username FROM Users WHERE username=@usr and pass_hash=@pass`, {'@usr': user['username'], '@pass': hash_code(user['password'])}, (err, rows) => {
        if(err){
          send(false);
          console.log("Something went wrong");
          console.log(this.db.rows);
          console.log(err);
        } else if (rows.length == 0){
          send(false);
          console.log("No users found");
          this.db.all('SELECT username, pass_hash FROM Users WHERE username=@usr', {'@usr':user['username']}, (err, rows) => {
            if (err){
              console.log('Error')
            }else {
              console.log(rows)
              console.log("Pass_Hash: "+ hash_code(user['password']))
            }
          })
        } else if (rows.length == 1){
          rows.forEach(row => {
            console.log(row);
          });
          console.log("Found user " + rows[0].username + " with matching pass");
          send(true);
        } else {
          send(false);
          console.log("Hmm... something went wrong. Multiple users Found");
        }
      });
    });
  }

  searchByCode(code) {
    return new Promise(send => {
      this.db.all(`
      SELECT username FROM Users WHERE code_hash=@code;
      `, {'@code': hash_code(code)}, (err, rows) => {
        if(err){
          if (err.code == 'SQLITE_CONSTRAINT') {
            send(false);
            console.log("Something went wrong");
            console.log(this.db.rows);
            console.log(err);
          } 
          console.log("An error occurred.");
        }
        else if (rows.length == 0){
          console.log(hash_code(code));
          send(false);
        } else if (rows.length >= 1){
          rows.forEach(row => {
            console.log(row);
          })
          console.log("Found org " + rows[0].Name + " with matching code");
          send(true);
        } else {
          send(false);
          console.log("Hmm... something went wrong. Multiple orgs Found");
        }
      })
    })
  }
}

module.exports.Organizations = Organizations
module.exports.Users = Users
module.exports.hash_code = hash_code
