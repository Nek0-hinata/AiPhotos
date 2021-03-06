import Auth from '../../utils/netTools.js'

Page({
  data: {
    portrait: {
      url: '/statics/add2.png',
      width: undefined,
      height: undefined,
      name: 'portrait'
    },
    bg: {
      url: '/statics/add1.png',
      width: undefined,
      height: undefined,
      name: 'bg'
    },
    Selected: [
      false,
      false,
      false,
      false,
      false
    ],
    isSelectColor: '#AF601A',
    isNotSelectColor: '#fdd62f',
    bgScale: undefined
  },
  onLoad: function (options) {
    const event = this.getOpenerEventChannel()
    const that = this
    event.on('num', data => {
      that.setData({
        method: data.num
      })
    })
  },

  // onShow: function(options) {
  //   const that = this
  //   that.setData({
  //     ['bg.url']: '/statics/add1.png',
  //     ['portrait.url']: '/statics/add2.png',
  //     Selected: [
  //       false,
  //       false,
  //       false,
  //       false
  //     ]
  //   })
  // },

  SelectPhoto: function (e) {
    const that = this
    wx.chooseImage({
      count: 1,
      success (res) {
        const tempFiles = res.tempFilePaths[0]
        if (e.mark.style === '0') {
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
    const that = this
    const id = e.mark.hat
    const temp = that.data.Selected
    for (const i in temp) {
      temp[i] = i === id
    }
    this.setData({
      Selected: temp
    })
  },

  /**
   * 缩放图片并保存缩放后宽高
   * @constructor
   */
  Start: function () {
    const that = this
    wx.showLoading({
      title: '图片上传中'
    })
    if (that.data.portrait.url === '/statics/add2.png') {
      wx.showToast({
        title: '请选择人像',
        icon: 'error'
      })
      return
    }
    if (that.data.bg.url === '/statics/add1.png') {
      wx.showToast({
        title: '请选择背景图',
        icon: 'error'
      })
      return
    }
    if (that.data.method == 0 && !that.data.Selected.filter(ele => ele === true).length) {
      wx.showToast({
        title: '请选择帽子',
        icon: 'error'
      })
      return
    }
    const getImageInfo = getApp().promixify(wx.getImageInfo)
    // const upload = getApp().promixify(wx.uploadFile)
    // // Auth.getToken().then(res => {
    // const token = res
    // console.log(res)
    const P1 = Auth.request({
      url: '/upload-fore',
      filePath: that.data.portrait.url,
      name: 'file',
      timeout: 60000
    }, wx.uploadFile)
    // const P1 = upload({
    //   url: `${getApp().globalData.apiUrl}/upload-fore`,
    //   filePath: that.data.portrait.url,
    //   header: {
    //     token: token
    //   },
    //   name: 'file'
    // }, res => {
    //
    // }, res => {
    //   console.log(res)
    //   wx.showToast({
    //     title: '网络失联啦',
    //     icon: 'error'
    //   })
    // })
    // console.log(that.data.bg.url)
    const P2 = Auth.request({
      url: '/upload-back',
      filePath: that.data.bg.url,
      name: 'file',
      timeout: 60000
    }, wx.uploadFile)
    // const P2 = upload({
    //   url: `${getApp().globalData.apiUrl}/upload-back`,
    //   filePath: that.data.bg.url,
    //   header: {
    //     token: token
    //   },
    //   name: 'file'
    // }, () => {
    //
    // }, res => {
    //   wx.showToast({
    //     title: '网络失联啦',
    //     icon: 'error'
    //   })
    // })
    Promise.all([P1, P2])
      .then(values => {
        const myUrl = that.data.method == 0 ? '/start' : '/style'
        // let token = null
        // Auth.getToken().then(res => token = res)
        console.log(values.every(value => value.statusCode == 200))
        if (values.every(value => value.statusCode == 200)) {
          Auth.request({
            url: myUrl,
            data: {
              hat: that.data.Selected.findIndex(value => value == true) + 1
            },
            method: 'POST'
          }, wx.request).then(res => {
            wx.hideLoading({
              success: (res) => {
              }
            })
            wx.showLoading({
              title: '图片合成中'
            })
            if (res.statusCode == '200') {
              if (that.data.method == 1) {
                const methodUrl = []
                methodUrl.push(`${getApp().globalData.apiUrl}/${res.data.url}`)
                wx.previewImage({
                  urls: methodUrl,
                  success (res) {
                    wx.hideLoading()
                  }
                })
              } else {
              // console.log(`${getApp().globalData.apiUrl}/${res.data.url}`)
                wx.downloadFile({
                  url: `${getApp().globalData.apiUrl}/${res.data.url}`,
                  success: res1 => {
                    if (res1.statusCode == '200') {
                      that.setData({
                        'portrait.url': res1.tempFilePath,
                        bgScale: null
                      })
                      Promise.all(
                        [that.data.portrait, that.data.bg].map(obj => getImageInfo({
                          src: obj.url
                        }, res => {
                          that.setData({
                            [`${obj.name}.height`]: res.height,
                            [`${obj.name}.width`]: res.width
                          })
                        }, res => {
                          wx.showToast({
                            title: '获取图片失败'
                          })
                          console.log(res)
                        })
                        )).then(res4 => {
                        const {
                          width,
                          height
                        } = that.data.bg
                        that.getScale(width, height).then(res5 => {
                          const scale = res5
                          that.setData({
                            bgScale: scale
                          })
                          console.log(that.data.portrait.width)
                          that.setData({
                            'bg.width': width / scale,
                            'bg.height': height / scale,
                            'portrait.width': that.data.portrait.width / scale,
                            'portrait.height': that.data.portrait.height / scale
                          })
                          wx.hideLoading({
                            success: (res) => {
                            }
                          })
                          wx.navigateTo({
                            url: '/pages/photo/photo',
                            success (res) {
                              res.eventChannel.emit('size', {
                                data: that.data.bg,
                                test: that.data.portrait,
                                bgScale: that.data.bgScale
                              })
                            }
                          })
                        }).catch(err => {
                          failed()
                          console.log(err)
                        })
                      })
                        .catch(res4 => {
                          failed()
                          console.log(res4)
                        })
                    }
                  },
                  fail () {
                    failed()
                  }
                })
              }
            } else {
              failed()
            }
          })
            .catch(res => {
              failed()
              console.log(res)
            })
        } else {
          failed()
        }
      })
      .catch(res => {
        failed()
        console.log(res)
      })

    function failed () {
      wx.hideLoading({
        success: (res) => {
        }
      })
      wx.showToast({
        title: '合成失败',
        icon: 'error'
      })
    }

    //     wx.request({
    //       url: `${getApp().globalData.apiUrl}/start`,
    //       header: {
    //         token: token
    //       },
    //       data: {
    //         hat: that.data.Selected.findIndex(value => value == true)
    //       },
    //       method: 'POST',
    //       success: res => {
    //         if (res.statusCode == '200') {
    //           wx.downloadFile({
    //             url: res.data.url,
    //             header: {
    //               token: token
    //             },
    //             success: res1 => {
    //               if (res1.statusCode == '200') {
    //                 that.setData({
    //                   'portrait.url': res1.tempFilePath,
    //                   bgScale: null
    //                 })
    //                 Promise.all(
    //                   [that.data.portrait, that.data.bg].map(obj => getImageInfo({
    //                     src: obj.url
    //                   }, res => {
    //                   }, res => {
    //                     wx.showToast({
    //                       title: '获取图片失败'
    //                     })
    //                   })
    //                   )).then(res4 => {
    //                   const {
    //                     width,
    //                     height
    //                   } = that.data.bg
    //                   that.getScale(width, height).then(res5 => {
    //                     const scale = res5
    //                     that.setData({
    //                       bgScale: scale
    //                     })
    //                     that.setData({
    //                       'bg.width': width / scale,
    //                       'bg.height': height / scale,
    //                       'portrait.width': that.data.portrait?.width / scale,
    //                       'portrait.height': that.data.portrait?.height / scale
    //                     })
    //                     wx.navigateTo({
    //                       url: '/pages/photo/photo',
    //                       success (res) {
    //                         res.eventChannel.emit('size', {
    //                           data: that.data.bg,
    //                           test: that.data.portrait,
    //                           bgScale: that.data.bgScale
    //                         })
    //                       }
    //                     })
    //                   }).catch(err => {
    //                     console.log(err)
    //                   })
    //                 })
    //               }
    //             }
    //           })
    //         }
    //       }
    //     })
    //   } else {
    //     // 图片下载失败
    //   }
    // })
    // .catch(res => {
    //   wx.showToast({
    //     title: '网络出错啦',
    //     icon: 'error'
    //   })
    // })
    // })
  },

  getScale: function (width, height) {
    return new Promise((resolve, reject) => {
      wx.getSystemInfoAsync({
        success (res) {
          const rHeight = res.windowHeight
          const rWidth = res.windowWidth
          resolve(Math.max(1, height / rHeight, width / rWidth))
        },
        fail (res) {
          reject(res)
        }
      })
    })
  }
})
