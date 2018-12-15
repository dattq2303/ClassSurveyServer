const express = require('express');
const user = express.Router()
const database = require('../Database/database');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
process.env.SECRET_KEY = "hoangminh";

var token;

user.post('/login', (req, res) => {
    var message = {}
    var email = req.body.email;
    var password = req.body.password;
    console.log(req.body);
    database.connection.getConnection((err, connection) => {
        if(err){
            message['error'] = true;
            message['data'] = 'Internal Server Error';
            res.status(500).json(message);
        } else {
            connection.query('select * from Users where userName = ?',[email],
            (err, rows, fields) => {
                console.log(rows, JSON.stringify(rows));
                if(err){
                    message.error = true;
                    message['data'] = 'Error Occured!';
                    res.status(400).json(message);
                    console.log('fail!');
                }
                else{
                    if(rows.length > 0){
                        console.log('succeed!');
                        if(rows[0].password == password){
                            token = jwt.sign(
                                {
                                    email: rows[0].email,
                                    password: rows[0].password
                                }, 
                                process.env.SECRET_KEY, 
                                {
                                expiresIn : "4h"
                            });
                            message.error = false;
                            message['token'] = token;
                            message['expiresIn'] = '4h';
                            message['_id'] = rows[0].Id;
                            message['role'] = rows[0].role;
                            res.status(200).json(message);
                        }
                        else{
                            message.error = true;
                            message['data'] = 'Email and Password does not match';
                            res.status(400).json(message);
                        }
                    }
                    else{
                        message.error = 1;
                        message['data'] = 'Email does not exist!';
                        res.status(400).json(message);
                        console.log('fail!');
                    }
                }
            });
            connection.release();
        }
    });
});

module.exports = user;