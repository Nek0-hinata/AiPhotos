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
        isNotSelectColor: '#fdd62f',
        bgScale: undefined
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
        if (that.data.portrait.url == '/statics/add2.png') {
            wx.showToast({
                title: '请选择人像',
                icon: 'error'
            })
            return
        }
        if (that.data.bg.url == '/statics/add1.png') {
            wx.showToast({
                title: '请选择背景图',
                icon: 'error'
            })
            return
        }
        if (!that.data.Selected.filter(ele => ele == true).length) {
            wx.showToast({
                title: '请选择帽子',
                icon: 'error'
            })
            return
        }
        const getImageInfo = getApp().promixify(wx.getImageInfo)
        const upload = getApp().promixify(wx.uploadFile)
        let P1 = upload({
            url: `${getApp().globalData.apiUrl}/upload-fore`,
            filePath: that.data.portrait.url,
            header: {
                'token': Auth.getToken()
            },
            formData: {
                'hat': that.data.Selected.findIndex(value => value == true)
            },
            name: 'file'
        }, res => {

        }, res => {
            wx.showToast({
                title: '网络失联啦',
                icon: 'error'
            })
            console.log(res)
        })
        let P2 = upload({
            url: `${getApp().globalData.apiUrl}/upload-back`,
            filePath: that.data.bg.url,
            header: {
                'token': Auth.getToken
            }
        })
        Promise.all([P1, P2])
            .then(values => {
                if (values.every(value => value.statusCode == 200)) {
                    wx.request({
                        url: `${getApp().globalData.apiUrl}/start`,
                        header: {
                            'token': Auth.getToken
                        },
                        success: res => {
                            if (res.statusCode == 200) {
                                wx.downloadFile({
                                    url: res.data.url,
                                    header: {
                                        'token': Auth.getToken
                                    },
                                    success: res1 => {
                                        if (res1.statusCode == 200) {
                                            that.setData({
                                                'portrait.url': tempFilePaths || filePath
                                            })
                                            Promise.all(
                                                [that.data.portrait, that.data.bg].map(obj => getImageInfo({
                                                    src: obj.url
                                                }, res2 => {
                                                    const {
                                                        width,
                                                        height
                                                    } = res
                                                    console.log(width, height)
                                                    that.getScale(width, height)
                                                        .then(res3 => {
                                                            let scale = res3
                                                            that.setData({
                                                                'bgScale': scale
                                                            })
                                                            that.setData({
                                                                [`${obj.name}.width`]: width / scale,
                                                                [`${obj.name}.height`]: height / scale
                                                            })
                                                        })
                                                        .catch(err => {
                                                            wx.showToast({
                                                                title: err
                                                            })
                                                        })
                                                }, res => {
                                                    wx.showToast({
                                                        title: '出现错误啦'
                                                    })
                                                }
                                                ))
                                            )
                                                .then(res4 => {
                                                    wx.navigateTo({
                                                        url: '/pages/photo/photo',
                                                        success(res) {
                                                            res.eventChannel.emit('size', {
                                                                data: that.data.bg,
                                                                test: that.data.portrait,
                                                                bgScale: that.data.bgScale
                                                            })
                                                        }
                                                    })
                                                })
                                        }
                                    }
                                })
                            }
                        }
                    })
                } else {
                    //图片下载失败
                }
            })
            .catch(res => {
                wx.showToast({
                    title: '网络出错啦',
                    icon: 'error'
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