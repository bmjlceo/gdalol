const mysql = require('mysql')

let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root2',
    password : '123456',
    database : 'gdalol'
})

const insertData = async(entry,output,code)=>{
    connection.query(`insert into gdalol (fileName,gdalFileName,createTime,ctime,changeOrNot) VALUES (${entry},${output},${new Date()},${Date.now()},${code})`,function(error, results, fields) {
        if (error) throw error;
        console.log('瓦片已保存进数据库 ', results[0].solution);
      })
}


module.exports = {
    insertData
};