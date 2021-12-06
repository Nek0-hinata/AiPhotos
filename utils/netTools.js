const that = this
const app = getApp()
let loginQueue = []
let isLogin = false

/**
 * 请求的一个简单封装
 * @param {url, data, method} options 输入url，data，以及method
 * @param  {...any} params 输入其他变量
 */
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

/**
 * @returns 返回登录期约
 */
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
                res(wx.getStorageSync('token'))
              })
              .catch(res2 => {
                console.log(res2)
              })
        } else {
          rej(res1)
        }
      },
      fail: res1 => {
        rej(res1)
      }
    })
  })
}

function getToken() {
  return new Promise((res, rej) => {
    if (!wx.getStorageSync('token')) {
      loginQueue.push({res, rej})
      //登录锁
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

function request(options = {}, needToken = true, ...params) {
  if (needToken) {
    return new Promise ((res, rej) => {
      getToken()
        .then( res1 => {
          requestP(options, {
            header: {
              'token': res1
            }
          })
            .then(res2 => {
              if (res2.statusCode == 401) {
                wx.setStorageSync('token', null)
                getToken()
                  .then(res3 => {
                    requestP(options, {
                      header: {
                        'token': res3
                      }
                    })
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
    return requestP(options, ...params)
  }
}

export default request