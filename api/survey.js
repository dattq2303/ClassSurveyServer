const express = require('express');
const database = require('../Database/database')
const survey = express.Router();


survey.get('/', (req, res, next) => {
    var message = {}
    database.connection.getConnection((err, connection) => {
        if (err) {
            message['error'] = true;
            message['data'] = 'Internal Server Error';
            res.status(500).json(message);
        }else{
            connection.query('select * from Survey', (err, rows, feilds) => {
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

survey.post('/create', (req, res, next) => {
    var exceltojson;
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            if(!req.file){
                res.json({error_code:1,err_desc:"No file passed"});
                return;
            }
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
                    var message = {};
                    console.log(result);
                    var content = result.content;
                    var id_student = result.id_student;
                    var id_class = result.id_class;
                    database.connection.getConnection((err, connection) => {
                        if(err){
                            message['error'] = true;
                            message['data'] = 'Internal Server Error';
                            res.status(500).json(message);
                        }else{
                            var insert = "INSERT INTO Survey (Content) VALUES (?)";
                            connection.query(insert, [content], (err, rows) =>{
                                if(err){
                                    message['error'] = true;
                                    message['data'] = "Insert survey fail!";
                                    res.status(400).json(message);
                                }else{
                                    var surveyId = rows.insertId;
                                    var student_survey = [];
                                    var class_survey = [];
                                    student_survey.push(id_student, surveyId);
                                    class_survey.push(id_class, surveyId);
                                    connection.query("INSERT INTO Student_Survey (StudentId, SurveyId) VALUES (?)", [student_survey], (err, result1) => {
                                        if(err){
                                            message['error'] = true;
                                            message['data'] = "Insert student_survey fail";
                                            res.status(400).json(message);
                                        }else{
                                            console.log("Insert student_survey success", result1);
                                        }
                                    });
                                    connection.query("INSERT INTO Class_Survey (ClassId, SurveyId) VALUES (?)", [class_survey], (err, result2) => {
                                        if(err){
                                            message['error'] = true;
                                            message['data'] = "Insert class_survey fail";
                                            res.status(400).json(message);
                                        }else{
                                            console.log("Insert class_survey success", result2);
                                        }
                                    });
                                    message['error'] = false;
                                    message['data'] = "Insert survey success";
                                    res.status(200).json(message);
                                }
                            });
                            connection.release();
                        }
                    });
                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        });
});


module.exports = survey;