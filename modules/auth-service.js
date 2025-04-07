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

let User = mongoose.model('users', userSchema); 

let initialize = () => {
    return new Promise(function(resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGODB_URI); 

        db.on('error', (err) => {
            reject(err); 
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
            if (users.length == 0) { 
                reject(`Unable to find user: ${userData.userName}`); 
            } 

            bcrypt.compare(userData.password, users[0].password)
            .then((result) => {
                if (result) { 
                if (users[0].loginHistory.length === 8) {
                    users[0].loginHistory.pop(); 
                }
                
                users[0].loginHistory.unshift({ 
                    dateTime: (new Date()).toString(), 
                    userAgent: userData.userAgent
                }); 

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
            reject(`Unable to find user: ${userData.userName}`); 
        }); 
    })
}
        
module.exports = { initialize, registerUser, checkUser }; 