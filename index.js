const express = require('express');
const app = express();

// hs008 use mongoDB
const mongoose = require('mongoose');
const PostsM = require('./toDoModel.js').PostsM;
const DB_URI = 'mongodb://mongo:27017/toDoApp';

mongoose.connect(DB_URI).then(() => {
    console.log("connected to mongo db");
});


// 001hs
const bodyParser = require('body-parser');
const {randomBytes} = require('crypto');
const posts = {};
app.use(bodyParser.json());
const cors = require('cors'); 
app.use(cors());

// 003hs get rid of problem
//  has been blocked by CORS policy: Response to preflight request doesn't pass access control check
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
   
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
// 002hs
const axios = require('axios');
const { resolveAny } = require('dns');
app.get('/posts', (req,res)=>{
  // 001hs - when a get request is received send all data / post back to client
  //res.send(posts);
  PostsM.find()
      .then((postsData) => res.status(200).send(postsData))
      .catch((err) => res.status(400).send(err));

});


// hs002  new for event bus implementation (async)
app.post('/posts',  async(req, res) =>{
    // 001hs generate a unique id for each new post request
    const id = randomBytes(4).toString('hex');
    // 001hs data from request body into title
    const { title } = req.body;
    // 001hs put the data into the data array with id as key
    posts[id] = {
        id, title 
    };
    
    // hs002 new for event bus implementation
    await axios.post('http://docker-compose_dhbw-exercise1-nodejs-eventbus_1:4005/events', {
        type: 'PostCreated',
        data: { 
            id,
            title
        } 
    });
    const postsM = new PostsM({
        id: id,
        title: title,
    });
    postsM.save(function(err, postM) {
        if(err) {
            console.log(err);
            return res.status(500).send(); 
        }     
    });

    // 001 return status 201 to client and the data itself
    res.status(201).send(posts[id]);
});
// hs008
app.get('/postsdata', (req, res) => {
    PostsM.find()
      .then((postsData) => res.status(200).send(postsData))
      .catch((err) => res.status(400).send(err));

      
});


// hs002 new for event bus implementation
app.post('/events', (req, res) => {
    console.log('Event received', req.body.type);
    res.send({});
});

app.listen(4000, () =>{
    console.log('Listening on port 4000')
});