const express = require('express');
var cors = require('cors');
const app = express();
app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

const dbName = 'YouCanvas';
let db;

MongoClient.connect(url, { useUnifiedTopology: true } ,function(err, client) {
 console.log("Connected successfully to server");
 db = client.db(dbName);
});

app.use(express.json());
app.get('/', (req,res) => {
    res.send("ok");
});

app.post('/insertLabel', (req,res) => {
try {
console.log(req.body);
        db.collection('etiquettes').updateOne({ ClientName: req.body.client, tagName: req.body.tag},{ $set : { ClientName: req.body.client , tagName: req.body.tag, label: req.body.label }} , { upsert: true } );
 }
catch(e) {
        console.log(e);
 }
});

app.listen(8080, () => {
 console.log("Serveur à l'écoute sur me port 8080");
});