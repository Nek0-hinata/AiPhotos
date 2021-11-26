Page({
    data: {
        portrait: {
            url: '/statics/add2.png',
            width: undefined,
            height: undefined
        },
        bg: {
            url: '/statics/add1.png',
            width: undefined,
            height: undefined
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
        wx.getImageInfo({
            src: that.data.portrait.url,
            success(res) {
                const {width, height} = res
                let scale = that.getScale(width, height)
                scale = scale > 1 ? scale + 0.5 : scale
                that.setData({
                    'portrait.width': width / scale,
                    'portrait.height': height / scale
                })
            },
            fail(res) {
                wx.showToast({
                    title: '图片获取失败',
                    icon: "error"
                })
            }
        })
        wx.getImageInfo({
            src: that.data.bg.url,
            success(res) {
                const {width, height} = res
                let scale = that.getScale(width, height)
                scale = scale > 1 ? scale + 0.5 : scale
                that.setData({
                    'portrait.width': width / scale,
                    'portrait.height': height / scale
                })
            },
            fail(res) {
                wx.showToast({
                    title: '图片获取失败',
                    icon: "error"
                })
            }
        })
    },

    getScale: function (width, height) {
        wx.getImageInfo({
            success(res) {
                const rHeight = res.windowHeight
                const rWidth = res.windowWidth
                return Math.max(1, rHeight / height, rWidth / width)
            }
        })
    }
});