//import dependencies
const express = require('express');
// bodyParser is not needed because the latest version express can directly pass data 
// create an Express.js instance
const app = express();

// config Express.js
// Cross-Origin Resource Sharing (CORS) Allows the server to respond to ANY request indicated by '*'
app.use(express.json())
app.set('port', 3000)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")

    next();
})

// connect MongoDB
const MongoClient = require('mongodb').MongoClient;

// err - this just means an error will be shown to the client if the server can't be seen
let db;
MongoClient.connect('mongodb+srv://ElijahLegacy:uA1yXRRQfvgScQox@cluster0.mkhsgyb.mongodb.net', (err, client) => {
    db = client.db('webstore')
})

// '/' use when first time being used, usually its the route we're using 
// displays message for root path to show that API is working
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages')
})

// app.param() [parameter] middleware allows to do something every time there is this value in the URL pattern on the request handler
// get the collection name
app.param('collectionName', (req, res,next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

// /collection/:collectionName is the route
// find is like a cursor to find the data
// e is error 
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    }
    )
})

// ops unique object identifier in postman
// req.body is for the postman when an object is being inserted 
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e)
        res.send(results.ops)
    }
    )
})

const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, results) => {
        if (e) return next(e)
        res.send(results)
    }
    )
})

app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
        {
            _id: new ObjectID(req.params.id)
        },
        {
            $set: req.body
        },
        {
            // tells mongodb to wait before callback function to process only 1 item
            safe: true, multi : false
        },
        (e, result) => {
        if (e) return next(e)
        res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
    }
    )
})

app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        {
            _id: ObjectID(req.params.id)
        },
        (e, result) => {
        if (e) return next(e)
        res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
    }
    )
})

// cURL - Client URL
app.listen(3000, () => {
    console.log('express is running on port 3000')
})