const mysql = require('mysql')

function OptPool() {
  this.flag = true //是否连接过
  this.pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '123456',
    database: 'db1'
  })

  this.getPool = function () {
    return this.pool
  }
}

module.exports = OptPool
