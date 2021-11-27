Component({
    properties: {},
    data: {},
    methods: {},
    lifetimes: {
        ready() {
            let that = this
            wx.createSelectorQuery().in(this)
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
                    const dpr = wx.getSystemInfoSync().pixelRation
                    canvas.width = width * dpr
                    canvas.height = height * dpr
                })
        }
    }
});
