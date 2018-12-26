const express = require('express');
const bodyParser = require('body-parser');

const lecturer = require('./api/lecturer');
const student = require('./api/student');
const survey = require('./api/survey');
const User = require('./api/user');
const app = express();
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.use('/students', student);
app.use('/lecturers', lecturer);
app.use('/surveys', survey);
app.use('/lecturer', lecturer);
app.use('/student', student);
app.use('/survey', survey);
app.use('/user', User);

module.exports = app;