const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const {mongoose} = require('./db/mongodb');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//CREATING USERS HERE FROM '/users' ROUTER

app.post('/users',(req,res)=>{
    var body = _.pick(req.body,['email','password']);
    var user = new User(body);

    user.save().then((user)=>{
        return user.generateAuthToken();
    }).then((token)=>{
        res.header('x-auth',token).send(user);
    }).catch((e)=>{
        res.send(e);
    });
});

//FINDING A USER HERE FROM '/users/me' ROUTER

app.get('/users/me',authenticate,(req,res)=>{
   res.send(req.user);
});

//LOGIN USER HERE FROM '/users/login' ROUTER

app.post('/users/login',(req,res)=>{

    var body = _.pick(req.body,['email','password']);
    User.findByCredentials(body.email,body.password).then((user)=>{
        user.generateAuthToken().then((token)=>{
            res.header('x-auth',token).send(user);
        })
    }).catch((e)=>{
        res.status(400).send();
    });

});

//LOGOUT USER HERE FROM '/users/me/logout' ROUTER

app.delete('/users/me/logout',authenticate,(req,res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    }, ()=>{
        res.status(400).send();
    });
});

app.listen(port, ()=>{
    console.log(`Started up at the port ${port}`);
});

module.exports = {app};