Page({
    data: {
        ctx: null,
        bg: null
    },
    onLoad: function (options) {
        const that = this
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.on('size', data => {
            that.setData({
                bg: data.data
            })
        })
    },
    onShow: function () {
        let that = this
        wx.createSelectorQuery()
            .select('#canvas')
            .fields({
                node: true,
                size: true
            })
            .exec(res => {
                const canvas = res[0].node
                that.setData({
                    ctx: canvas.getContext('2d')
                })
                const dpr = wx.getSystemInfoSync().pixelRatio
                canvas.width = that.data.bg?.width
                canvas.height = that.data.bg?.height
                //that.data.ctx.scale(dpr, dpr)
                console.log(canvas.height, canvas.width)
                let img = canvas.createImage()
                img.src = that.data.bg.url
                img.onload = function () {
                    that.data.ctx.drawImage(img, 0, 0, that.data.bg?.width, that.data.bg?.height)
                }
            })
    }
});