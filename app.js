// app.js

App({
  onLaunch () {
    // 展示本地存储能力
    // this.globalData.token = wx.getStorageSync('token') || null
    // console.log(this.globalData.token)
    // const that = this
    // if (!this.globalData.token) {
    //     wx.login({
    //         success(res) {
    //             if (res.code) {
    //                 console.log(res.code)
    //                 wx.request({
    //                     url: `${that.globalData.apiUrl}/login`,
    //                     data: {
    //                         code: res.code
    //                     },
    //                     success(res) {
    //                         wx.setStorageSync('token', res.token)
    //                     }
    //                 })
    //             } else {
    //                 console.log(res.errMsg)
    //             }
    //         }
    //     })
    // }
    // const that = this
    // wx.login({
    //   success(res) {
    //     wx.request({
    //       url: `http://42.193.126.196:9000/login`,
    //       data: {
    //         code: res.code
    //       },
    //       method: 'POST',
    //       complete(res1) {
    //         console.log(res.code)
    //         console.log(res1)
    //       }
    //     })
    //   }
    // })
    // Auth.request({}, this.promixify).then(res => {})
  },

  globalData: {
    token: null,
    apiUrl: 'http://42.193.126.196:9000'
  },

  /**
     * 将一个微信api封装为期约，第一个参数为api的设置，第二个参数为成功函数，第三个为失败函数
     * @param api
     * @returns {function(*=, *, *, ...[*]): Promise<unknown>}
     */
  promixify: function (api) {
    return (options, successes, unSuccesses, ...params) => {
      return new Promise((resolve, reject) => {
        api(Object.assign({}, options, {
          success: (res) => {
            successes(res)
            resolve(res)
          },
          fail: (res) => {
            unSuccesses(res)
            reject(res)
          }
        }), ...params)
      })
    }
  }
})
