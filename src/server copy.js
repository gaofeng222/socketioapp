const http = require('http')
const fs = require('fs')
const io = require('socket.io')
const url = require('url')
const OptPool = require('./utils/mysql')

const optPool = new OptPool()
const db = optPool.getPool()
const reg = /^\w{6,32}$/
let httpServer = http.createServer((req, res) => {
  console.log(url.parse(req.url, true).query)
  // let [path, params] = req.url.split('?')
  res.setHeader('Content-Type', 'text/json; charset=utf-8')
  let { pathname, query } = url.parse(req.url, true)
  let { username, pwd } = query

  //校验用户名
  if (!reg.test(username)) {
    res.write(JSON.stringify({ code: 1, msg: '用户名不符合规范' }))
    res.end()
  } else if (!reg.test(pwd)) {
    res.write(JSON.stringify({ code: 1, msg: '密码不符合规范' }))
    res.end()
  }
  if (pathname == '/reg') {
    db.getConnection((err, conn) => {
      let sqlSearch = `select * from user_table WHERE username = ?`
      let insetSql = `insert into user_table (username,password,online) values(?,?,0)`
      let parmas1 = [`${username}`]
      db.query(sqlSearch, parmas1, (err, docs) => {
        // console.log('insetSql222')
        if (err) {
          res.write(JSON.stringify({ code: 1, msg: '数据库有误' }))
          res.end()
        } else if (docs.length > 0) {
          res.write(JSON.stringify({ code: 1, msg: '此用户名已经存在' }))
          res.end()
        } else {
          let params = [`${username}`, `${pwd}`]
          db.query(insetSql, params, function (err, docs) {
            console.log('insetSql66', err)
            if (err) {
              console.log('insetSql777')
              res.write(JSON.stringify({ code: 1, msg: '数据库错误' }))
              res.end()
            } else {
              console.log('insetSql666')
              res.write(JSON.stringify({ code: 0, msg: '插入成功' }))
              res.end()
            }
            conn.release() //放回连接池
          })
        }

        // conn.release() //放回连接池
      })
    })
    console.log('请求了注册~~~', pwd)
  } else if (pathname == '/login') {
    console.log('请求了login')
    let sqlSearch = `select * from user_table WHERE username = ?`
    let updateSql = `update user_table set online=1 where id=?`
    let parmas1 = [`${username}`]
    db.getConnection((err, conn) => {
      db.query(sqlSearch, parmas1, (err, docs) => {
        if (err) {
          res.write(JSON.stringify({ code: 1, msg: '数据库有误' }))
          res.end()
        } else if (docs.length == 0) {
          res.write(JSON.stringify({ code: 1, msg: '此用户名不存在' }))
          res.end()
        } else if (docs[0].password != pwd) {
          res.write(JSON.stringify({ code: 1, msg: '用户名或密码不正确' }))
          res.end()
        } else {
          let params2 = [docs[0].id]
          db.query(updateSql, params2, (err, docs) => {
            if (err) {
              res.write(JSON.stringify({ code: 1, msg: '数据库有误' }))
              res.end()
            } else {
              res.write(JSON.stringify({ code: 0, msg: '登录成功' }))
              res.end()
            }
          })
        }
      })
    })
  }
})

httpServer.listen(8080)
