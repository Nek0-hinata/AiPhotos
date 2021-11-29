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
            //图片在画布上的真实坐标
            data.test.x = 10
            data.test.y = 10
            //图片缩放比例
            data.test.scale = 2
            //图像长宽
            data.test.width /= data.test.scale
            data.test.height /= data.test.scale
            //图像旋转角度
            data.test.rotate = 0
            //点击时手指坐标
            data.test.start = {
                x: data.test.x,
                y: data.test.y
            }
            //图像中间坐标
            data.test.center = {
                x: data.test.x + data.test.width / 2,
                y: data.test.y + data.test.height / 2
            }
            //用户点击后状态
            data.test.status = -1
            //图像是否被选中
            data.test.selected = true

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
     * 绘制时按照x，y原坐标进行绘制
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
                close.onload = () => {
                    zoom.onload = () => {
                        c.drawImage(bg, 0, 0, that.data.bg?.width, that.data.bg?.height)
                        c.save()
                        //旋转画布，并将旋转后人像绘制出来
                        c.translate(P.center.x, P.center.y)
                        c.rotate(P.rotate)
                        c.translate(-P.center.x, -P.center.y)
                        //绘制人像
                        c.drawImage(person, P.x, P.y, P?.width, P?.height)
                        //绘制其他按钮
                        if (that.data.portrait.selected) {
                            c.drawImage(close, P.x - 12, P.y - 12, 24, 24)
                            c.drawImage(zoom, P.x + P.width - 12, P.y + P.height - 12, 24, 24)
                            c.setLineDash([10, 10])
                            c.lineWidth = 2
                            c.strokeStyle = 'red'
                            c.lineDashOffset = 10
                            c.strokeRect(P.x, P.y, P.width, P.height)
                        }
                        //恢复画布
                        c.restore()
                    }
                    zoom.src = '/statics/zoom.png'
                }
                close.src = '/statics/close.png'
            }
            person.src = P?.url
        }
        bg.src = that.data.bg?.url
    },

    // TODO 图像的变换方法可能要由第一次点击时确定
    start: function (e) {
        const {x, y} = e.touches[0]
        this.setData({
            ['portrait.start']: {x, y},
            ['portrait.selected']: this.isInWhere(x, y) !== 3,
            ['portrait.status']: this.isInWhere(x, y)
        })
        this.draw()
    },

    // TODO 之后优化可能要将start的状态存到图像对象里，在move时不更改其值
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
        switch (that.data.portrait.status) {
            case 0:
                //点击坐标减中心坐标，算出与中心点所成角度
                let before = Math.atan2(that.data.portrait.start.y - center.y, that.data.portrait.start.x - center.x)
                //移动坐标减中心坐标，同上
                let after = Math.atan2(y - center.y, x - center.x)
                that.setData({
                    ['portrait.rotate']: that.data.portrait.rotate + after - before
                })
                break
            case 2:
                that.setData({
                    ['portrait.x']: X + x - that.data.portrait.start.x,
                    ['portrait.y']: Y + y - that.data.portrait.start.y
                })
                break
            case 3:

                break
        }
        //每次移动后，重新计算移动后图像中心点坐标
        that.setData({
            ['portrait.start.x']: x,
            ['portrait.start.y']: y,
            ['portrait.center.x']: that.data.portrait.x + that.data.portrait.width / 2,
            ['portrait.center.y']: that.data.portrait.y + that.data.portrait.height / 2,
        })
        this.draw()
    },

    end: function (e) {
        // this.setData({
        //     ['portrait.rotate']: 0
        // })
    },

    /**
     * 0是缩放区域， 1是删除区域, 2是图片内， 3是图片外
     * 计算坐标所处位置时按照旋转后的虚拟坐标计算
     * @param x
     * @param y
     * @returns int
     */
    isInWhere: function (x, y) {
        let that = this
        const P = that.data.portrait
        let x1 = P.center.x + (x - P.center.x) * Math.cos(-P.rotate) - (y - P.center.y) * Math.sin(-P.rotate)
        let y1 = P.center.y + (x - P.center.x) * Math.sin(-P.rotate) + (y - P.center.y) * Math.cos(-P.rotate)
        x = x1
        y = y1
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
        } else if (x >= that.data.portrait.x && x <= that.data.portrait.x + that.data.portrait.width && y >= that.data.portrait.y && y <= that.data.portrait.y + that.data.portrait?.height) {
            return 2
        } else {
            return 3
        }
    },

});