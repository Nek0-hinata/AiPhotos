
const that = this
const app = getApp()
const loginQueue = []
const isLogin = false
// TODO 外部调用无法使用header
/**
 * 请求的一个简单封装
 * @param {url, data, method} options 输入url，data，以及method
 * @param api 网络请求方法
 * @param  {...any} params 输入其他变量
 */
function requestP (options = {}, api, ...params) {
  return new Promise((res, rej) => {
    const {
      url,
      method
    } = options
    api(Object.assign({}, options, ...params, {
      url: `${getApp().globalData.apiUrl}${url}`,
      method: method || 'GET',
      success: res1 => {
        console.log(res1.statusCode)
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
function Login () {
  return new Promise((res, rej) => {
    wx.login({
      success: res1 => {
        if (res1.code) {
          requestP({
            url: '/login',
            data: {
              code: res1.code
            },
            method: 'POST'
          }, wx.request)
            .then(res2 => {
              console.log(res2)
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

function getToken () {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    if (!token) {
      Login()
        .then(res1 => {
          console.log('getToken()', res1)
          resolve(res1)
        })
        .catch(res1 => {
          console.log('getToken()fail', res1)
          reject(res1)
        })
    } else {
      resolve(token)
    }
  })
}

// function getToken () {
//   return new Promise((res, rej) => {
//     if (!wx.getStorageSync('token')) {
//       loginQueue.push({ res, rej })
//       // 登录锁
//       if (!isLogin) {
//         isLogin = true
//         Login()
//           .then(res1 => {
//             isLogin = false
//             console.log(loginQueue)
//             while (loginQueue.length) {
//               loginQueue.shift().res(res1)
//             }
//           })
//           .catch(err => {
//             console.log('dsa',loginQueue)
//             isLogin = false
//             while (loginQueue.length) {
//               loginQueue.shift().rej(err)
//             }
//           })
//       }
//     } else {
//       res(wx.getStorageSync('token'))
//     }
//   })
// }

function isHttpSuccess (status) {
  return status == 401 || status >= 200 && status < 300 || status == 304
}

function request (options = {}, api, needToken = true, ...params) {
  if (needToken) {
    return new Promise((res, rej) => {
      getToken()
        .then(res1 => {
          requestP(options, api, {
            header: {
              token: res1
            }
          })
            .then(res2 => {
              console.log(res2.statusCode)
              if (res2.statusCode == 401) {
                console.log('dsafadsfsdsafsa')
                wx.login({
                  success (resCode) {
                    requestP({
                      url: '/login',
                      method: 'POST',
                      data: {
                        code: resCode.code
                      }
                    }, wx.request)
                      .then(res3 => {
                        console.log(res3)
                        wx.setStorageSync('token', res3.data.token)
                        requestP(options, api, {
                          header: {
                            token: res3.data.token
                          }
                        })
                          .then(res4 => {
                            res(res4)
                          })
                          .catch(res4 => {
                            console.log(res4)
                            rej(res4)
                          })
                      })
                      .catch(res3 => {
                        console.log(res3)
                        rej(res3)
                      })
                  }
                })
                // wx.setStorageSync('token', null)
                // getToken()
                //   .then(res3 => {
                //     requestP(options, api, {
                //       header: {
                //         token: res3
                //       }
                //     })
                //       .then(res)
                //       .catch(res => {
                //         console.log(res)
                //         rej()
                //       })
                //   })
                //   .catch(res3 => {
                //     console.log(res3)
                //     rej()
                //   })
              } else {
                res(res2)
              }
            })
            .catch(res => {
              console.log(res)
              rej()
            })
        })
        .catch(res => {
          console.log(res)
          rej()
        })
    })
  } else {
    return requestP(options, api, ...params)
  }
}

const Auth = {
  request: request,
  getToken: getToken
}

export default Auth
