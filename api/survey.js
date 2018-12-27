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
survey.post('/create', (req, res, next) => {
                var message = {};
                var content = req.body.content;
                var id_student = req.body.id_student;
                var id_class = req.body.id_class;
                console.log(content, id_student, id_class)
                database.connection.getConnection((err, connection) => {
                        if(err){
                            message['error'] = true;
                            message['data'] = 'Internal Server Error';
                            res.status(500).json(message);
                        }else{
                            var insert = "INSERT INTO Survey (Content) VALUES (?)";
                            connection.query(insert, [JSON.stringify(content)], (err, rows) =>{
                                if(err){
                                    message['error'] = true;
                                    message['data'] = "Insert survey fail!";
                                    console.log(err);
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


module.exports = survey;