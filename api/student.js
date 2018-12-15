const express = require('express');
const database = require('../Database/database')
const student = express.Router();

student.get('/', (req, res, next) => {
    var message = {}
    database.connection.getConnection((err, connection) => {
        if (err) {
            message['error'] = true;
            message['data'] = 'Internal Server Error';
            res.status(500).json(message);
        }else{
            connection.query('select * from Students', (err, rows, feilds) => {
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

student.get('/:studentId', (req, res, next) => {
    var Id = req.params.studentId;
    var message = {};
    database.connection.getConnection((err, connection) => {
        if(err){
            message['error'] = true;
            message['data'] = 'Internal Server Error';
            res.status(500).json(message);
        }else{
            // var sql = 'select c.Subject from classes from Classes C left join StudentClasses SC on C.Id = SC.ClassId where SC.studentId = ?' + connection.escape(Id)
            connection.query('select c.Subject from Classes c left join StudentClasses SC on c.Id = SC.ClassId where SC.studentId = ?',[Id] ,(err, rows, feilds) => {
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

student.get('/a',function(req,res){
    res.sendFile(__dirname + "/index.html");
});

student.post('/upload', (req, res, next) => {
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
                            values.push([result[i].username, result[i].password, 'student']);
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
                                let student = values[i];
                                var sql = "INSERT INTO Users (userName, password, role) VALUES (?)"
                                connection.query(sql,[student] ,(err, rows) => {
                                    console.log(rows.affectedRows);
                                    if (err) {
                                        message['error'] = true;
                                        message['data'] = 'Error Ocured!';
                                        res.status(400).json(message);
                                    }else{
                                        Id = rows.insertId;
                                        var student1 = [];
                                        student1.push(Id, 'student','abc','abc',16020055,'abc');
                                        console.log(student1);
                                        console.log(Id);
                                        var insert = "INSERT INTO Students (Id_Students, Role, Vnumail, Content, Code, Name) VALUES (?)"
                                        connection.query(insert,[student1] ,(err, row) => {
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

student.put('/edit', (req, res, next) => {
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
                            values.push([result[i].id, result[i].username, result[i].password, result[i].name, result[i].Vnumail, 'student']);
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
                                let student = values[i];
                                var Id = student[0];
                                var sql = "UPDATE Users SET userName = ?, password = ? where Id_Users = ?"
                                connection.query(sql,[student[1], student[2], student[0]] ,(err, rows) => {
                                    console.log(rows.affectedRows);
                                    if (err) {
                                        message['error'] = true;
                                        message['data'] = 'Error Ocured!';
                                        res.status(400).json(message);
                                    }else{
                                        Id = rows.insertId;
                                        var student1 = [];
                                        student1.push(Id, 'student','abc','abc',16020055,'abc');
                                        console.log(student1);
                                        console.log(Id);
                                        var edit = "UPDATE Students SET Code = ?, Co VALUES (?)"
                                        connection.query(insert,[student1] ,(err, row) => {
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

student.delete('/delete/:studentId', (req, res, next) => {
    var Id = req.params.studentId;
    var message = {};
    database.connection.getConnection((err, connection) => {
        if(err){
            message['error'] = true;
            message['data'] = 'Internal Server Error';
            res.status(500).json(message);
        }else{
            var sql = "DELETE FROM Students WHERE Id_Students = ?";
            connection.query(sql,[Id] ,function (err, result) {
                if (err) throw err;
                console.log("Number of records deleted: " + result.affectedRows);
            });
            connection.release();
        }
    });
});
// student.get('/classes', (req, res, next) => {
//     var id = req.body.id;
// });

// student.post('/create', (req, res, next) => {

// });
// student.get('/classes', (rep, res, next) => {
    
//     });
// });

// student.post('/create', (rep, res, next) => {

// });
module.exports = student;
