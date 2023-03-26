const http = require('http')
const fs = require('fs')
const { Server } = require('socket.io')
const url = require('url')
const OptPool = require('./utils/mysql')
const reg = /^\w{6,32}$/
const optPool = new OptPool()
const db = optPool.getPool()
let httpServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.end('ok')
})

const wsSocket = new Server(httpServer, { cors: true })
// const wsSocket = io.listen(httpServer)
let cur_userId = 0,
  cur_userName = ''
let allSockets = []
wsSocket.on('connection', (sock) => {
  sock.on('reg', (res) => {
    // console.log(res, 'res')

    if (!reg.test(res.username) || !reg.test(res.password)) {
      sock.emit('reg_ret', { code: 1, msg: '用户名或密码不符合规范' })
    } else {
      db.getConnection((err, conn) => {
        let sqlSearch = `select * from user_table WHERE username = ?`
        let insetSql = `insert into user_table (username,password,online) values(?,?,0)`
        let parmas1 = [`${res.username}`]
        db.query(sqlSearch, parmas1, (err, docs) => {
          // console.log('insetSql222')
          if (err) {
            sock.emit('reg_ret', { code: 1, msg: '数据库有误' })
          } else if (docs.length > 0) {
            sock.emit('reg_ret', { code: 1, msg: '此用户名已经存在' })
          } else {
            let params = [`${res.username}`, `${res.password}`]
            db.query(insetSql, params, function (err, docs) {
              if (err) {
                sock.emit('reg_ret', { code: 1, msg: '数据库错误' })
              } else {
                sock.emit('reg_ret', { code: 0, msg: '插入成功' })
              }
              conn.release() //放回连接池
            })
          }
        })
      })
    }
  })
  allSockets.push(sock)
  sock.on('login', (res) => {
    console.log(res, 'res')
    if (!reg.test(res.username) || !reg.test(res.password)) {
      sock.emit('lgn_ret', { code: 1, msg: '用户名或密码不符合规范' })
    } else {
      db.getConnection((err, conn) => {
        let sqlSearch = `select * from user_table WHERE username = ?`
        let updateSql = `update user_table set online=1 where id=?`

        let parmas1 = [`${res.username}`]
        db.query(sqlSearch, parmas1, (err, docs) => {
          // console.log('insetSql222')
          if (err) {
            sock.emit('lgn_ret', { code: 1, msg: '数据库有误' })
          } else if (docs.length == 0) {
            sock.emit('lgn_ret', { code: 1, msg: '此用户不存在' })
          } else {
            let params = [`${res.username}`, `${res.password}`]
            let params2 = [docs[0].id]
            cur_userId = docs[0].id
            cur_userName = docs[0].username
            db.query(updateSql, params2, (err, docs) => {
              if (err) {
                sock.emit('lgn_ret', { code: 1, msg: '数据库有误' })
              } else {
                sock.emit('lgn_ret', { code: 0, msg: '登录成功' })
              }
            })
          }
        })

        conn.release()
      })
    }
  })

  sock.on('msg', (res) => {
    console.log(res, 'msg')
    if (!res) {
      sock.emit('msg_ret', {
        code: 1,
        msg: '消息文本不能为空'
      })
    } else {
      //广播事件
      allSockets.forEach((ele) => {
        if (ele == sock) return

        ele.emit('msg', {
          code: 0,
          msg: res.msg,
          cur_userName: res.cur_username
        })
      })
      sock.emit('msg_ret', {
        code: 0,
        msg: '发送成功'
      })
    }
  })

  sock.on('disconnect', () => {
    console.log('退出')
    let params3 = [cur_userId]
    db.getConnection((err, conn) => {
      let updateSqlOffLine = `update user_table set online=0 where id=?`
      db.query(updateSqlOffLine, params3, (err, docs) => {
        if (err) {
          console.log('数据库有误')
        } else {
          sock.emit('logout_ret', { code: 0, msg: `${cur_userName}退出` })
          cur_userName = ''
          cur_userId = ''

          allSockets = allSockets.filter((ele) => ele != sock)
        }
      })
    })
  })
})

httpServer.listen(8080)
