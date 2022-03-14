const mysql =require('mysql2');

var mysqlConnection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'login',
    multipleStatements: true
});

mysqlConnection.connect((err) =>{
    if (!err) 
    console.log('BD connection suceess');
    else
    console.log('DB connection failed \n Error' + JSON.stringify(err,undefined,2));
    
});

module.exports = mysqlConnection;