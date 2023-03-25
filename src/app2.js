import $ from 'jquery'
import io from 'socket.io-client'

let socket = io('ws://192.168.1.18:8080')

console.log(socket, 'socket')
socket.on('connect', () => {
  console.log(socket.id) // 输出客户端的id
})
$(function () {
  $('#btnrReg').click(function () {
    let username = $('#username').val()
    let password = $('#password').val()
    socket.emit('reg', { username, password })
    socket.on('reg_ret', (data) => {
      console.log(data, 'code')
      if (data.code == 1) {
        alert('注册失败：' + data.msg)
      } else {
        alert('注册成功：' + data.msg)
      }
    })
  })
  $('#btnLgn').click(function () {
    let username = $('#username').val()
    let password = $('#password').val()
    socket.emit('login', { username, password })
    socket.on('reg_ret', (data) => {
      console.log(data, 'code')
      if (data.code == 1) {
        alert('登录失败：' + data.msg)
      } else {
        alert('登录成功：' + data.msg)
      }
    })
  })
})
