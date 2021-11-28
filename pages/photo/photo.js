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
            data.test.rotate = 0
            data.test.start = {
                x: data.test.x,
                y: data.test.y
            }
            data.test.center = {
                x: data.test.x + data.test.width / 2,
                y: data.test.y + data.test.height / 2
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
                //c.drawImage(bg, 0, 0, that.data.bg?.width, that.data.bg?.height)
                close.src = '/statics/close.png'
                c.translate(P.center.x, P.center.y)
                c.rotate(P.rotate)
                c.translate(-P.center.x, -P.center.y)
                console.log('旋转时', P.rotate)
                c.drawImage(person, P.x, P.y, P?.width, P?.height)
                c.rotate(-P.rotate)
                that.setData({
                    ['portrait.rotate']: 0
                })
            }
            person.src = P?.url

        }
        bg.src = that.data.bg?.url

    },

    start: function (e) {
        const that = this
        const {x, y} = e.touches[0]
        switch (this.isInWhere(x, y)) {
            case 0:

            case 2:
                let start = {
                    x: x,
                    y: y
                }
                that.setData({
                    selected: true,
                    ['portrait.start']: start,
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
        //人像图左上角坐标
        const X = that.data.portrait.x
        const Y = that.data.portrait.y
        //中心点坐标
        const center = {
            x: that.data.portrait.center.x,
            y: that.data.portrait.center.y
        }
        switch (this.isInWhere(x, y)) {
            case 0:
                //点击坐标减中心坐标，算出与中心点所成角度
                let before = Math.atan2(that.data.portrait.start.y - center.y, that.data.portrait.start.x - center.x)
                //移动坐标减中心坐标，同上
                let after = Math.atan2(y - center.y, x - center.x)
                console.log('before, after', before * 180 / Math.PI, after * 180 / Math.PI, before + after)
                that.setData({
                    ['portrait.rotate']: after - before
                })
                console.log(that.data.portrait.rotate)
                //求出旋转后角度
                let r = Math.sqrt(Math.pow(that.data.portrait.x - that.data.portrait.center.x, 2) + that.data.portrait.y - that.data.portrait.center.y)
                let angle = Math.atan2(that.data.portrait.y - that.data.portrait.center.y, that.data.portrait.x - that.data.portrait.center.x) - that.data.portrait.rotate
                that.setData({
                    ['portrait.x']: r * Math.cos(angle) + that.data.portrait.center.x,
                    ['portrait.y']: r * Math.sin(angle) + that.data.portrait.center.y
                })
                break
            case 2:
                that.setData({
                    ['portrait.x']: X + x - that.data.portrait.start.x,
                    ['portrait.y']: Y + y - that.data.portrait.start.y,
                })
                break
        }
        that.setData({
            ['portrait.start.x']: x,
            ['portrait.start.y']: y,
            ['portrait.center.x']: that.data.portrait.x + that.data.portrait.width / 2,
            ['portrait.center.y']: that.data.portrait.y + that.data.portrait.height / 2,
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