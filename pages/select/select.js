import Auth from '../../utils/netTools.js'

Page({
    data: {
        portrait: {
            url: '/statics/add2.png',
            width: undefined,
            height: undefined,
            name: 'portrait'
        },
        bg: {
            url: '/statics/add1.png',
            width: undefined,
            height: undefined,
            name: 'bg'
        },
        Selected: [
            false,
            false,
            false,
            false
        ],
        isSelectColor: '#AF601A',
        isNotSelectColor: '#fdd62f'
    },
    onLoad: function (options) {

    },

    SelectPhoto: function (e) {
        let that = this
        wx.chooseImage({
            count: 1,
            success(res) {
                const tempFiles = res.tempFilePaths[0]
                if (e.mark.style == 0) {
                    that.setData({
                        'portrait.url': tempFiles
                    })
                } else {
                    that.setData({
                        'bg.url': tempFiles
                    })
                }
            }
        })
    },

    SelectHat: function (e) {
        let that = this
        let id = e.mark.hat
        let temp = that.data.Selected
        for (let i in temp) {
            temp[i] = i === id;
        }
        this.setData({
            Selected: temp
        })
    },

    /**
     * 缩放图片并保存缩放后宽高
     * @constructor
     */
    Start: function () {
        const that = this
        if (!that.data.Selected.filter(ele => ele == true).length) {
            wx.showToast({
                title: '请选择帽子',
                icon: 'error'
            })
            return
        }
        const getImageInfo = getApp().promixify(wx.getImageInfo)
        Promise.all(
            [that.data.portrait, that.data.bg].map(obj => getImageInfo({
                    src: obj.url
                },
                res => {
                    const {
                        width,
                        height
                    } = res
                    console.log(width, height)
                    that.getScale(width, height)
                        .then(res => {
                            let scale = res
                            console.log(scale)
                            that.setData({
                                [`${obj.name}.width`]: width / scale,
                                [`${obj.name}.height`]: height / scale
                            })
                        })
                        .catch(res => {
                            wx.showToast({
                                title: res
                            })
                        })
                },
                res => {
                    wx.showToast({
                        title: '出现错误啦'
                    })
                }))
        ).then(values => {
            const upload = getApp().promixify(wx.uploadFile)
            let P1 = upload({
                url: `${getApp().globalData.apiUrl}/upload-fore`,
                filePath: that.data.portrait.url,
                header: {
                    'token': Auth.getToken()
                },
                formData: {
                    'hat': that.data.Selected.findIndex(value => value == true)
                }
            }, res => {
                wx.downloadFile({
                  url: res.data.url,
                  success: res1 => {
                      
                  }
                })
            })
            let P2 = upload({
                url: `${getApp().globalData.apiUrl}/upload-back`,
                filePath: that.data.bg.url,
                header: {
                    'token': Auth.getToken
                }
            })
            // Promise.all([{
            //         url: `${getApp().globalData.apiUrl}/upload-fore`,
            //         filePath: that.data.portrait.url
            //     },
            //     {
            //         url: `${getApp().globalData.apiUrl}/upload-back`,
            //         filePath: that.data.bg.url
            //     },
            //     {
            //         url: `${getApp().globalData.apiUrl}/back`,
            //         filePath: `/statics/hat${that.data.Selected.findIndex(value => value == true) + 1}.png`
            //     }
            // ].map(obj => {
            //     let Token = wx.getStorageSync('token')
            //     let success = function(res) {
            //         if (res.statusCode == 401) {
            //             wx.login({
            //                 success: res => {
            //                     wx.request({
            //                         url: `${getApp().globalData.apiUrl}/login`,
            //                         data: {
            //                             code: res.code
            //                         },
            //                         success: res => {
            //                             wx.setStorageSync('token', res.data.token)
            //                             upload({
            //                                 url: obj.url,
            //                                 filePath: obj.filePath,
            //                                 name: 'file',
            //                                 header: {
            //                                     token: res.data.token
            //                                 }
            //                             })
            //                         }
            //                     })
            //                 }
            //             })
            //         }
            //     }
            //     if (!Token) {
            //         wx.login({
            //             success: res => {
            //                 wx.request({
            //                     url: `${getApp().globalData.apiUrl}/login`,
            //                     data: {
            //                         code: res.code
            //                     },
            //                     success: res => {
            //                         wx.setStorageSync('token', res.data.token)
            //                         upload({
            //                             url: obj.url,
            //                             filePath: obj.filePath,
            //                             name: 'file',
            //                             header: {
            //                                 token: res.data.token
            //                             }
            //                         })
            //                     }
            //                 })
            //             }
            //         })
            //     } else {
            //         upload({
            //             url: obj.url,
            //             filePath: obj.filePath,
            //             name: 'file',
            //             header: {
            //                 token: Token
            //             }
            //         })
            //     }
            //     upload({
            //         url: obj.url,
            //         filePath: obj.filePath,
            //         name: 'pic'
            //     })
            // }))
            wx.navigateTo({
                url: '/pages/photo/photo',
                success(res) {
                    res.eventChannel.emit('size', {
                        data: that.data.bg,
                        test: that.data.portrait
                    })
                }
            })
        })
    },

    getScale: function (width, height) {
        return new Promise((resolve, reject) => {
            wx.getSystemInfoAsync({
                success(res) {
                    const rHeight = res.windowHeight
                    const rWidth = res.windowWidth
                    resolve(Math.max(1, height / rHeight, width / rWidth))
                },
                fail(res) {
                    reject(res)
                }
            })
        })
    }
});