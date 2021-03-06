const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trime: true,
        minlength: 1,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.pre('save', function(next) {
    var user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(user.password,salt,(err,hash)=>{
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});

UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;

    try{
        decoded = jwt.verify(token,'abc123');
    } catch (e) {
        return new Promise((resolve,reject)=>{
            reject();
        })
    }

    var user =  User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'Auth'
    });

    return user;
};

UserSchema.statics.findByCredentials = function(email,password) {
    var User = this;

    return User.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject();
        }
        return new Promise((resolve,reject)=>{
            bcrypt.compare(password,user.password,(err,result)=>{
                if(result){
                    resolve(user);
                } else {
                    reject();
                }
            })
        })
    })
}

// UserSchema.methods.toJSON = function() {
//     var user = this;
//     var userObject = user.toObject();

//     return _.pick(userObject,['_id','email']);
// };

UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'Auth';
    var token = jwt.sign({_id: user._id.toHexString(),access: access},'abc123').toString(); 

    user.tokens = user.tokens.concat([{access,token}]);

    return user.save().then(()=>{
        return token;
    });
};

UserSchema.methods.removeToken = function(token) {
    var user = this;

    return user.update({
        $pull: {
            tokens:{
                token: token
            }
        }
    });
};

var User = mongoose.model('User',UserSchema);

module.exports.User = User;