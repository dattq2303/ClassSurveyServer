const express = require('express');
const database = require('../Database/database')
const lecturer = express.Router();


lecturer.get('/', (req, res, next) => {
    var message = {}
    database.connection.getConnection((err, connection) => {
        if (err) {
            message['error'] = true;
            message['data'] = 'Internal Server Error';
            res.status(500).json(message);
        }else{
            connection.query('select * from Lecturers', (err, rows, feilds) => {
                console.log(rows);
                if (err) {
                    message['error'] = true;
                    message['data'] = 'Error Ocured!';
                    res.status(400).json(message);
                }else{
                    if (rows != 'undefined'){
                        message = JSON.stringify(rows);
                        res.status(200).json(message);
                    }else{
                        message['data'] = 'Empty';
                        res.json(message);
                    }
                }
            });
            connection.release();
        }
    });
});

lecturer.get('/:lecturerId', (req, res, next) => {
    var Id = req.params.lecturerId;
    var message = {};
    database.connection.getConnection((err, connection) => {
        if(err){
            message['error'] = true;
            message['data'] = 'Internal Server Error';
            res.status(500).json(message);
        }else{
            connection.query('select c.Subject from Classes c join Lecturers L on c.LecturerId = L.Id_Lecturers where L.Id_Lecturers = ?',[Id] ,(err, rows, feilds) => {
                console.log(rows);
                if (err) {
                    message['error'] = true;
                    message['data'] = 'Error Ocured!';
                    res.status(400).json(message);
                }else{
                    if (rows.lenght > 0){
                        message = JSON.stringify(rows);
                        res.status(200).json(message);
                    }else{
                        message['data'] = 'Empty';
                        res.json(message) ;
                    }
                }
            });
            connection.release();
        }
    });
}); 


var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var upload = multer({ //multer settings
                storage: storage,
                fileFilter : function(req, file, callback) { //file filter
                    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                        return callback(new Error('Wrong extension type'));
                    }
                    callback(null, true);
                }
            }).single('file');

lecturer.get('/a',function(req,res){
    res.sendFile(__dirname + "/index.html");
});

lecturer.post('/upload', (req, res, next) => {
    var exceltojson;
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                res.json({error_code:1,err_desc:"No file passed"});
                return;
            }
            /** Check the extension of the incoming file and 
             *  use the appropriate module
             */
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders:true
                }, function(err,result){
                    if(err) {
                        return res.json({error_code:1,err_desc:err, data: null});
                    } 
                    var values = [];
                    for(var i = 0; i < result.length; i++)
                        if (result[i].username != '')
                            values.push([result[i].username, result[i].password, 'lecturer']);
                        else break;
                    var message = {};
                    console.log(values)
                    database.connection.getConnection((err, connection) => {
                        if(err){
                            message['error'] = true;
                            message['data'] = 'Internal Server Error';
                            res.status(500).json(message);
                        }else{
                            var Id;
                            for (var i = 0; i < values.length; i++){
                                let lecturer = values[i];
                                var sql = "INSERT INTO Users (userName, password, role) VALUES (?)"
                                connection.query(sql,[lecturer] ,(err, rows) => {
                                    console.log(rows.affectedRows);
                                    if (err) {
                                        message['error'] = true;
                                        message['data'] = 'Error Ocured!';
                                        res.status(400).json(message);
                                    }else{
                                        Id = rows.insertId;
                                        var lecturer1 = [];
                                        lecturer1.push(Id, 'lecturer','abc','abc',0962495908,'abc');
                                        console.log(lecturer1);
                                        console.log(Id);
                                        var insert = "INSERT INTO Students (Id_Lecturers, Role, Vnumail, Code, Phone, Name) VALUES (?)"
                                        connection.query(insert,[lecturer1] ,(err, row) => {
                                            console.log(Id, '1');
                                            if(err) {
                                                message['error'] = true;
                                                res.status(400).json(message);
                                            }else{
                                                console.log(row.affectedRows);
                                            }
                                        });
                                        // message['error'] = false;
                                        // message['data'] = rows;
                                        // res.status(200).json(message);
                                    }
                            });
                        }
                            connection.release();
                        }
                    });
                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        })
});

lecturer.delete('/delete/:lecturerId', (req, res, next) => {
    var Id = req.params.lecturerId;
    var message = {};
    database.connection.getConnection((err, connection) => {
        if(err){
            message['error'] = true;
            message['data'] = 'Internal Server Error';
            res.status(500).json(message);
        }else{
            var sql = "DELETE FROM Students WHERE Id_Lecturers = ?";
            connection.query(sql,[Id] ,function (err, result) {
                if (err) throw err;
                console.log("Number of records deleted: " + result.affectedRows);
            });
            connection.release();
        }
    });
});

module.exports = lecturer;