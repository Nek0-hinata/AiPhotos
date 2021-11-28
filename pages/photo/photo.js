class dragImg {
    constructor(img, ctx) {
        //初始坐标
        this.x = 100
        this.y = 100
        //初始宽高
        this.w = img.width
        this.h = img.height
        this.url = img.url
        this.ctx = ctx
        this.rotate = 0
        this.selected = true
    }
}

Page({
    data: {
        ctx: null,
        canvas: null,
        bg: null,
        portrait: null,
        selected: true,
    },
    onLoad: function (options) {
        const that = this
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.on('size', data => {
            data.test.x = 10
            data.test.y = 10
            that.setData({
                bg: data.data,
                portrait: data.test
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
                    ctx: canvas.getContext('2d'),
                    canvas: canvas
                })
                canvas.width = that.data.bg?.width
                canvas.height = that.data.bg?.height
                let bg = canvas.createImage()
                let person  = canvas.createImage()
                let close  = canvas.createImage()
                let scale  = canvas.createImage()
                const c = that.data.ctx
                const P = that.data.portrait
                bg.onload =  () => {
                    person.onload = () => {
                        close.onload = () => {
                            scale.onload = () => {
                                c.drawImage(scale, P.x + P.width - 15, P.y + P.height - 15, 24, 24)
                            }
                            scale.src = '/statics/zoom.png'
                            c.drawImage(close, P.x - 15, P.y - 15, 24, 24)
                        }
                        close.src = '/statics/close.png'
                        c.drawImage(person, P.x, P.y, P?.width/2, P?.height/2)
                    }
                    person.src = P?.url
                    c.drawImage(bg, 0, 0, that.data.bg?.width, that.data.bg?.height)
                }
                bg.src = that.data.bg?.url
                if (that.data.selected) {
                    c.setLineDash([10, 10])
                    c.lineWidth = 2
                    c.strokeStyle = 'red'
                    c.lineDashOffset = 10
                    c.strokeRect(P.x, P.y, P.width, P.height)
                }
            })
    },

    isInWhere: function (x, y) {

    },

    paint: function () {

    },

    promixify: function (api) {
        return (options, success) => {
            return new Promise((resolve, reject) => {
                api(Object.assign({}, options,
                    {
                        onload: () => {
                            success()
                            resolve()
                        }
                    }
                ))
            })
        }
    }
});