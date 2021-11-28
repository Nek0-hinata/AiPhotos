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
            data.test.scale = 2
            data.test.width /= data.test.scale
            data.test.height /= data.test.scale
            data.test.start = {
                x: data.test.x,
                y: data.test.y
            }
            data.test.center = {
                x: (data.test.width - data.test.x) / 2,
                y: (data.test.height - data.test.y) / 2
            }
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
                canvas.width = that.data.bg?.width
                canvas.height = that.data.bg?.height
                that.setData({
                    ctx: canvas.getContext('2d'),
                    canvas: canvas
                })
                that.draw()
            })
    },

    /**
     * 根据appData中的值绘制图片
     */
    draw: function () {
        const that = this
        let canvas = that.data.canvas
        let bg = canvas.createImage()
        let person = canvas.createImage()
        let close = canvas.createImage()
        let zoom = canvas.createImage()
        const c = that.data.ctx
        const P = that.data.portrait
        c.clearRect(0, 0, canvas.width, canvas.height)
        bg.onload = () => {
            person.onload = () => {
                if (that.data.selected) {
                    close.onload = () => {
                        zoom.onload = () => {
                            c.drawImage(zoom, P.x + P.width - 12, P.y + P.height - 12, 24, 24)
                            c.setLineDash([10, 10])
                            c.lineWidth = 2
                            c.strokeStyle = 'red'
                            c.lineDashOffset = 10
                            c.strokeRect(P.x, P.y, P.width, P.height)
                        }
                        zoom.src = '/statics/zoom.png'
                        c.drawImage(close, P.x - 12, P.y - 12, 24, 24)
                    }
                }
                close.src = '/statics/close.png'
                c.drawImage(person, P.x, P.y, P?.width, P?.height)
            }
            person.src = P?.url
            c.drawImage(bg, 0, 0, that.data.bg?.width, that.data.bg?.height)
        }
        bg.src = that.data.bg?.url
    },

    start: function (e) {
        const that = this
        const {x, y} = e.touches[0]
        switch (this.isInWhere(x, y)) {
            case 0:

                break
            case 2:
                let start = {
                    x: x,
                    y: y
                }
                that.setData({
                    selected: true,
                    ['portrait.start']: start
                })
                break
            case 3:
                that.setData({
                    selected: false
                })
        }
        this.draw()
    },

    move: function (e) {
        const {x, y} = e.touches[0]
        const that = this
        const startX = that.data.portrait.x
        const startY = that.data.portrait.y
        switch (this.isInWhere(x, y)) {
            case 0:

                break
            case 2:
                that.setData({
                    ['portrait.x']: startX + x - that.data.portrait.start.x,
                    ['portrait.y']: startY + y - that.data.portrait.start.y
                })
        }
        that.setData({
            ['portrait.start.x']: x,
            ['portrait.start.y']: y
        })
        this.draw()
    },

    end: function (e) {

    },

    /**
     * 0是缩放区域， 1是删除区域, 2是图片内， 3是图片外
     * @param x
     * @param y
     * @returns int
     */
    isInWhere: function (x, y) {
        let that = this
        let zoom = {
            x: that.data.portrait.x + that.data.portrait?.width,
            y: that.data.portrait.y + that.data.portrait?.height,
            w: 12,
            h: 12
        }
        let del = {
            x: that.data.portrait.x,
            y: that.data.portrait.y,
            w: 12,
            h: 12
        }
        if (x <= zoom.x + zoom.w && x >= zoom.x - zoom.w && y <= zoom.y + zoom.h && y >= zoom.y - zoom.h) {
            return 0
        } else if (x <= del.x + del.w && x >= del.x - del.w && y <= del.y + del.h && y >= del.y - del.h) {
            return 1
        } else if (x - that.data.portrait.x >= 0 && x - that.data.portrait.y >= 0 && that.data.portrait.x + that.data.portrait.width - x >= 0 && that.data.portrait.y + that.data.portrait.height - y >= 0) {
            return 2
        } else {
            return 3
        }
    }
});