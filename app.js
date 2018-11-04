const express = require('express');
const bodyParser = require('body-parser');

const teacher = require('./api/teacher');
const student = require('./api/student');
const servey = require('./api/servey');
const User = require('./api/user');
const app = express();
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.use('/students', student);
app.use('/teachers', teacher);
app.use('/serveys', servey);
app.use('/teacher', teacher);
app.use('/student', student);
app.use('/servey', servey);
app.use('/user', User);

module.exports = app;