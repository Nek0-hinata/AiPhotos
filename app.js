// app.js
App({
    onLaunch() {
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
    },
    globalData: {
        userInfo: null
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
                    success(res) {
                        successes(res)
                        resolve(res)
                    }, fail(res) {
                        unSuccesses(res)
                        reject(res)
                    }
                }), ...params)
            })
        }
    }
})
