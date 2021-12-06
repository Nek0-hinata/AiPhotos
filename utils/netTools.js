const that = this
const app = getApp()
let loginQueue = []
let isLogin = false

function requestP(options = {}, ...params) {
  const {
    url,
    data,
    method
  } = options
  return new Promise((res, rej) => {
    wx.request(Object.assign({}, ...params, {
      url: `${app.apiUrl}${url}`,
      data: data,
      method: method || 'GET',
      success: res1 => {
        if (isHttpSuccess(res1.statusCode)) {
          res(res1)
        } else {
          rej(res1)
        }
      },
      fail: rej
    }))
  })
}

function Login() {
  return new Promise ((res, rej) => {
    wx.login({
      success: res1 => {
        if (res1.code) {
           requestP({
             url: `${app.apiUrl}/login`,
             data: {
               code: res1.code
             },
             method: 'POST'
           })
              .then(res2 => {
                wx.setStorageSync('token', res2.data.token)
                res(res1)
              })
              .catch(res2 => {
                console.log(res2)
              })
        } else {
          rej(res1)
        }
      },
      fail: res => {
        rej()
      }
    })
  })
}

function getToken() {
  return new Promise((res, rej) => {
    if (!wx.getStorageSync('token')) {
      loginQueue.push({res, rej})
      if (!isLogin) {
        isLogin = true
        Login()
          .then(res1 => {
            isLogin = false
            while (loginQueue.length) {
              loginQueue.shift().res(res1)
            }
          })
          .catch(err => {
            isLogin = false
            while (loginQueue.length) {
              loginQueue.shift().rej(err)
            }
          })
      }
    } else {
      res(wx.getStorageSync('token'))
    }
  })
}

function isHttpSuccess(status) {
  return status >= 200 && status < 300 || status == 304
}

function request(options = {}, needToken = true) {
  if (needToken) {
    return new Promise ((res, rej) => {
      getToken()
        .then( res1 => {
          requestP(options)
            .then(res2 => {
              if (res2.statusCode == 401) {
                wx.setStorageSync('token', null)
                getToken()
                  .then(res3 => {
                    requestP(options)
                      .then(res)
                      .catch(rej)
                  })
              } else {
                res(res2)
              }
            })
            .catch(rej)
        })
        .catch(rej)
    })
  } else {
    return requestP(options)
  }
}