// 获取基础配置
const configs = require('./config')

const mysql = require('mysql')
const pool = mysql.createPool({
  connectionLimit : 10,  
  host            : configs.mysql.host,  
  port            : configs.mysql.port,  
  user            : configs.mysql.user,  
  password        : configs.mysql.pass, 
  database        : configs.mysql.db
})

let query = function( sql, values ) {
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        var log = connection.query(sql, values, ( err, rows) => {

          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
        console.log("执行sql:"+log.sql);
      }
    })
  })
}

module.exports = { query }