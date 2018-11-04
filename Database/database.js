const mysql = require('mysql');

var connection = mysql.createPool({
    onnectionLimit: 100,
    host:'localhost',
    user:'hoangminh',
    password:'minhtran224',
    database:'classSurvey',
 
});

module.exports.connection = connection;