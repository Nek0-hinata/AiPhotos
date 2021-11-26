Page({
    data: {
        portraitUrl: '/statics/add2.png',
        bgUrl: '/statics/add1.png',
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
                const tempFiles = res.tempFilePaths
                if (e.mark.style == 0) {
                    that.setData({
                        portraitUrl: tempFiles
                    })
                } else {
                    that.setData({
                        bgUrl: tempFiles
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
    }
});