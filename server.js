const express = require('express')

const dotenv = require('dotenv')
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const bcrypt = require('bcrypt');
const saltRounds = 10;

// or as an es module:
// import { MongoClient } from 'mongodb'
dotenv.config()
// Connection URL
const url = process.env.MONGO_URI || 'mongodb://localhost:27017'; // Use the environment variable or fallback to localhost
const client = new MongoClient(url);

// Database Name
const dbName = 'passDB';

// console.log(process.env.MONGO_URI) // remove this after you've confirmed it is working
const port = 3000
app.use(bodyParser.json())
app.use(cors())



client.connect();


// get all passwords
app.get('/', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.find({}).toArray();
    res.json(findResult)
})




// Save passwords with bcrypt
app.post('/', async (req, res) => {
    try {
        const { password, ...otherDetails } = req.body;
        const db = client.db(dbName);
        const collection = db.collection('passwords');

        // Hashing
        const hash = await bcrypt.hash(password, saltRounds);

        const saveData = { ...otherDetails, password: hash };
        const findResult = await collection.insertOne(saveData);
        res.send({ success: true, result: findResult });
       
    } catch (err) {
        res.status(500).send({ success: false, error: err.message });
    }
});


//delete a password by id
app.delete('/', async (req, res) => {
    const password = req.body
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.deleteOne(password);
    res.send({ sucess: true, result: findResult })
})

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
})