const sqlite3 = require('sqlite3');
const crypto = require('crypto');

function hash_code(code){
  code = code + code[6]                       // salt with the 7th character in the password
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
            console.log(this.db)
    });

  }


  addOrg(org) {
    this.db.all(`INSERT INTO Organizations (name, code_hash) VALUES (@name, @code);
      `, {'@name':org['name'], '@code': hash_code(org['org_code'])}, (err)  => {
          console.log(hash_code(org['org_code']));
          if(err){
            if (err.code == 'SQLITE_CONSTRAINT'){
              console.log("Org not added")
              console.log("Organization already added")
            }
          }
          else if (this.checkForOrg(org)) {
            console.log(org['name'])
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
            console.log("Something went wrong")
            console.log(this.db.rows)
            console.log(err);
          } 
          console.log("An error occurred.")
        }
        else if (rows.length == 0){
          console.log(hash_code(code))
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
    this.createTable();
  }
  createTable() {
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
        first_name text,
        last_name text,
        instance_id text primary key not null,
        org_code_hash text not null
    );
        `, (err)  => {
          if (err){
            console.error(err);
            return;
          }
            console.log("table created");
            console.log(this.db)
    });
  }

  addUser(user) {
    this.db.all(`INSERT INTO Users (first_name, last_name, instance_id, code_hash) VALUES (@name, @code);
      `, {'@first_name':user['name'], '@last_name':user['last_name'], '@instance_id':user['instance_id'],'@code': hash_code(user['org_code'])}, (err)  => {
          console.log(hash_code(org['org_code']));
          if(err){
            if (err.code == 'SQLITE_CONSTRAINT'){
              console.log("Org not added")
              console.log("Organization already added")
            }
          }
          else if (this.checkForOrg(org)) {
            console.log(org['name'])
            console.log("Added new org");
          }
        });
  }
}

module.exports.Organizations = Organizations
module.exports.Users = Users
module.exports.hash_code = hash_code
