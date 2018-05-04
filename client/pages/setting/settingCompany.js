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
    currentLanguage: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentLanguage: currentLanguage()
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

  bindChangeName: function (e) {
    this.setData({
      "name": e.detail.value
    })
  },
  scanCompanyCode: function () {
    var that = this;
    wx.scanCode({
      success: (res) => {
        var name = "";
        var codeType = "";
        try {
          codeType = res.result.split(":")[0];
          name = res.result.split(":")[1];
        } catch (e) {
          console.error(e);
          name = "";
        }

        if (!codeType || codeType != 'companyName' || !name || name == "") {
          console.log(that.data.currentLanguage.qrcode_error);
          util.showModel(that.data.currentLanguage.hint, that.data.currentLanguage.qrcode_error);
          return;
        }

        console.log('公司扫码得到', name)
        this.setData({
          "name": name
        })

        //检查名称
        checkname();
      }
    })
  },


  checkname: function () {
    var that = this;
    if (!this.data.name || util.trim(this.data.name) == "") {
      util.showModel(that.data.currentLanguage.hint, that.data.currentLanguage.missing_data);
      return;
    }else{
      wx.navigateTo({
        url: '../setting/checkCompanyName?name=' + this.data.name
      })
    }
  }
})