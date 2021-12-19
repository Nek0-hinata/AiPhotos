Page({
  data: {
    type: 'outline'
  },
  onLoad: function (options) {
  },

  back: function () {
    wx.navigateBack({})
  },

  SwitchTo: function (e) {
    const event = this.getOpenerEventChannel()
    wx.navigateTo({
      url: '/pages' + e.mark.url,
      success (res) {
        event.on('num', data => {
          res.eventChannel.emit('num', {
            num: data.num
          })
        })
      }
    })
  }
})
