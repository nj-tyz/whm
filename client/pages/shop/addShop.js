var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var currentLanguage = require('../../lan/currentLanguage')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    no: "",
    img: "",
    address: "",
    cAddressLength: 0,
    currentLanguage: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentLanguage: currentLanguage()
    })
    var _that = this; 
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || _that.data.currentLanguage.position_navigation_bar_title
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 上传图片接口
  doUpload: function () {
    var that = this

    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        util.showBusy(that.data.currentLanguage.uploading)
        var filePath = res.tempFilePaths[0]

        // 上传图片
        wx.uploadFile({
          url: config.service.uploadUrl,
          filePath: filePath,
          name: 'file',

          success: function (res) {
            util.showSuccess(that.data.currentLanguage.img_upload_success)
            //console.log(res)
            res = JSON.parse(res.data)

            console.log(res)
            that.setData({
              img: res.data.imgUrl
            })
          },

          fail: function (e) {
            util.showModel(that.data.currentLanguage.img_upload_fail)
          }
        })

      },
      fail: function (e) {
        console.error(e)
      }

    })
  },
  bindChangeNo: function (e) {
    this.setData({
      "no": e.detail.value
    })
  },
  bindChangeName: function (e) {
    this.setData({
      "name": e.detail.value
    })
  },
  bindChangeAddress: function (e) {
    this.setData({
      cAddressLength: e.detail.value.length,
      "address": e.detail.value
    })
  },
  //提交表单
  submitForm: function () {
    var that = this;

    //校验数据完整
    if (!this.data.no || !this.data.name || !this.data.address || !this.data.img) {
      //util.showModel('提示', '数据不完整!');
      //return;
    }



    //提交
    util.showBusy(that.data.currentLanguage.submiting)

    var options = {
      url: config.service.addShop,
      login: true,
      data: {
        no: that.data.no,
        name: that.data.name,
        address: that.data.address,
        img: that.data.img,
      },
      success(result) {

        console.log('添加店铺成功', result);
        wx.navigateTo({
          url: '../msg/success?title=' + that.data.currentLanguage.system_prompt + '&content=' + that.data.currentLanguage.shop_add_success + '&btn=' + that.data.currentLanguage.click_return
        })



      },
      fail(error) {
        util.showModel(that.data.currentLanguage.submit_fail, error);
        console.log('添加店铺失败', error);
      }
    }
    qcloud.request(options)

  },

})