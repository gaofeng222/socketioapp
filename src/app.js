import $ from 'jquery'
$(document).ready(function () {
  $('#btnrReg').click(function () {
    const $username = $('#username').val()
    const $password = $('#password').val()
    fetch(`/api/reg?username=${$username}&pwd=${$password}`, { mode: 'cors' })
      .then((res) => {
        console.log(res, 'res')
        return res.json()
      })
      .then((res) => {
        if (res.code == 1) {
          alert(res.msg)
        } else {
          alert(res.msg)
        }
      })
  })

  $('#btnLgn').click(function () {
    const $username = $('#username').val()
    const $password = $('#password').val()
    fetch(`/api/login?username=${$username}&pwd=${$password}`, { mode: 'cors' })
      .then((res) => {
        console.log(res, 'res')
        return res.json()
      })
      .then((res) => {
        if (res.code == 1) {
          alert(res.msg)
        } else {
          alert(res.msg)
        }
      })
  })
})

if (module.hot) {
  module.hot.accept(() => {
    console.log('hmr')
  })
}
