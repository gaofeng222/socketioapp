import $ from 'jquery'
import io from 'socket.io-client'

// let socket = io('ws://192.168.1.104:8080')
let socket = io('ws://192.168.1.18:8080')

console.log(socket, 'socket')
socket.on('connect', () => {
  console.log(socket.id) // 输出客户端的id
})
$(function () {
  let cur_username = '',
    msg = '',
    oUl = $('#content')
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
    socket.on('lgn_ret', (data) => {
      console.log(data, 'code')
      if (data.code == 1) {
        alert('登录失败：' + data.msg)
      } else {
        alert('登录成功：' + data.msg)
        cur_username = username
        localStorage.setItem('cur_username', cur_username)
        // $(location).attr('href', '/chat.html')
        $('.login-form').hide()
        $('.chat').show()
      }
    })
  })

  $('#txtArea').bind('keypress', function (event) {
    if (event.keyCode == '13') {
      submit()
    }
  })
  $('#send').click(function () {
    submit()
  })

  socket.on('msg_ret', (data) => {
    if (data.code == 1) {
      alert('信息发送失败')
    } else {
      // console.log('msg_ret', data)
      let oLi = document.createElement('li')
      oLi.className = 'mine'
      oLi.innerHTML = `<p>${msg}</p><h4>${cur_username}</h4>`
      oUl.append(oLi)
      $('#txtArea').val('')
    }
  })
  socket.on('msg', (data) => {
    console.log('msg', data)
    let oLi = document.createElement('li')
    oLi.className = 'others'
    oLi.innerHTML = `<h4>${data.cur_userName}</h4><p>${data.msg}</p`
    oUl.append(oLi)
  })
  socket.on('logout_ret', (data) => {
    alert(data.msg)
  })

  function submit() {
    msg = $('#txtArea').val()
    if (!msg.trim()) {
      return
    }
    socket.emit('msg', { cur_username, msg })

    var h4 = $('#content').prop('scrollHeight') //等同 $('#content')[0].scrollHeight
    // $('.out-box').scrollTop(h4)
    console.log(h4, 'h4')
    //移动到对话框底部
    $('#content').animate({ scrollTop: 9999 }, 1000)
  }
})
