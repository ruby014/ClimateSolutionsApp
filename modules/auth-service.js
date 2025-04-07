const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs'); 
require('dotenv').config(); 

let Schema = mongoose.Schema; 

/*
DEFINING THE userSchema
Each schema maps to a MongoDB collection 
Like a blueprint of the documents to be added to the collection
*/
let userSchema = new Schema({
    userName: {
        type: String, 
        unique: true, 
    }, 
    password: String, 
    email: String, 
    loginHistory: [
        {
            dateTime: Date, 
            userAgent: String, 
        }, 
    ], 
}); 

let User = mongoose.model('users', userSchema); // to be defined on new connection (see 'initialize')

/* functions designed to work w/ the User Object (defined by userSchema) 
- each function must return a Promise the passes the data using resolve 
- if error - passes an error message using reject 
- when accessing these functions from server.js, respond with .then and catch 
- or with async/await and try/catch 
*/

let initialize = () => {
    return new Promise(function(resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGODB_URI); 

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        }); 

        db.once('open', () => {
            User = db.model('users', userSchema); 
            resolve(); 
        });
    });
}

let registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match"); 
        } else { // the passwords match 
            bcrypt.hash(userData.password, 10)
                .then((hash) =>{ // Hash the password using a Salt that was generated using 10 rounds
                // TODO: Store the resulting "hash" value in the DB
                userData.password = hash; 
                let newUser = new User(userData); 
                newUser.save()
                    .then(() => {
                        resolve(); 
                    }).catch(err => {
                        if (err.code === 11000) {
                            reject("User Name already taken."); 
                        } else {
                            reject(`There was an error creating the user: ${err}`); 
                        }
                    }); 
                })
                .catch(err => {
                    reject(`There was an error encrypting the password: ${err}`); // Show any errors that occurred during the process
                });
            }
        }); 
    } 

let checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
        .exec()
        .then((users) => {
            if (users.length == 0) { // users is an empty array
                reject(`Unable to find user (error1): ${userData.userName}`); 
            } 

            bcrypt.compare(userData.password, users[0].password)
            .then((result) => {
                if (result) { 
                // password matches that of the database
                // check if there are 8 login history items (max) 
                // if so, pop last element from array 
                if (users[0].loginHistory.length === 8) {
                    users[0].loginHistory.pop(); 
                }
                
                users[0].loginHistory.unshift({ 
                    dateTime: (new Date()).toString(), 
                    userAgent: userData.userAgent
                }); 

                //if (users.userName === users[0].userName) {
                users[0].updateOne({ $set: { loginHistory: users[0].loginHistory }})
                    .exec()
                    .then(() => {
                         resolve(users[0]); 
                    })
                    .catch(err => {
                        reject(`There was an error verifying the user: ${err}`); 
                    })
                } else {
                    reject(`Incorrect Password for user: ${userData.userName}`); 
                }
            })
        }).catch((error) => {
            reject(`Unable to find user (error2): ${userData.userName}`); 
        }); 
    })
}
        
module.exports = { initialize, registerUser, checkUser }; 