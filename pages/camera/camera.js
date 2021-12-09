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
    wx.navigateTo({
      url: '/pages' + e.mark.url
    })
  }
})
