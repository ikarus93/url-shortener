const MongoClient = require('mongodb').MongoClient,
    ObjectId = require('mongodb').ObjectID,
    dotenv = require('dotenv');
    dotenv.config();
const dbUrl = process.env.MONGOLAB_URI;


function verifyUrl(url) {
      if (url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g) !== null) {
            return true;
      } else {
          return false;
      }
}

function createUniqueUrl(key) {
    //Creates Unique Url based on key saved in primaryKey collection
    return `${key}${Math.floor(Math.random() * (1000 - 1 + 1)) + 1}`
}



function createUrl(baseUrl, cb) {
    const connection = MongoClient.connect(dbUrl);

    //Creates shortened URL out of primaryKey, and updates primary key afterwards so it stays unique
    connection.then(database => {
        const db = database.db('urlshortener');
        return Promise.all([database, db, db.collection('primaryKey').findOne({"_id": ObjectId("5a85d84cf36d2873fccf586d")})])
    }).then(([database, db, key]) => {
        let shortUrl = createUniqueUrl(key.key);
       return Promise.all([database, db, db.collection('urls').insertOne({"baseUrl": baseUrl, "shortUrl": shortUrl})]);
    }).then(([database, db, res]) => {
        return Promise.all([database, res, db.collection('primaryKey').findOneAndUpdate({"_id": ObjectId("5a85d84cf36d2873fccf586d")}, {$inc: {"key": 1}})]);
    }).then(([database,res, updateRes]) => {
        database.close();
        return cb(null,res.ops[0]);
    }).catch( err => {
        return cb(err);
    })
}

function redirectUrl(url, cb) {
    //Takes short url ending, verifies it, and then if verified sends callback to redirect
    const connection = MongoClient.connect(dbUrl);
    connection.then( database => {
        const db = database.db('urlshortener');
        return Promise.all([database, db.collection('urls').findOne({shortUrl: url})]);
    }).then(([database, res]) => {
        database.close();
        if (res) {
            cb(null, res);
        } else {
            cb(null, null);
        }  
        
    }).catch(err => {
        cb(err);
    })
}





module.exports.verifyUrl = verifyUrl;
module.exports.create = createUrl;
module.exports.redirect = redirectUrl;