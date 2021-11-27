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
            sizeType: ['original'],
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
            console.log(id)
            temp[i] = i === id;
        }
        this.setData({
            Selected: temp
        })
    },

    Start: function () {
        const that = this
        const getImageInfo = getApp().promixify(wx.getImageInfo)
        Promise.all(
            [that.data.portrait, that.data.bg].map(obj => getImageInfo(
                {
                    src: obj.url
                },
                res => {
                    const {width, height} = res
                    console.log(width)
                    that.getScale(width, height)
                        .then(res => {
                            let scale = res
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
                })
            )
        ).then(res => {
            wx.showLoading({
                title: '合成中'
            })
            setTimeout(()=>{
                wx.hideLoading()
            }, 3000)
        })
    },

    getScale: function (width, height) {
        return new Promise((resolve, reject) => {
            wx.getSystemInfoAsync({
                success(res) {
                    const rHeight = res.windowHeight
                    const rWidth = res.windowWidth
                    resolve(Math.max(1, rHeight / height, rWidth / width))
                },
                fail(res) {
                    reject(res)
                }
            })
        })
    }
})
;