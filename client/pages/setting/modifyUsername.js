var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var currentLanguage = require('../../lan/currentLanguage')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentLanguage:{},
    username:"",
    openId:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "修改用户名"
    })
    this.setData({
      currentLanguage: currentLanguage(),
      username: options.username,
      openId: options.openId
    })
    console.log(options.username + "+++++" + options.openId);
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
  changeInput:function(e){
    console.log(e);
    this.setData({
      username: e.detail.value
    })
  },
  clearInput:function(){
    this.setData({
      username: ""
    })
  },
  modifyUsername:function(){
    var that= this;
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.modifyUsername,
      login: true,
      data: {
        opneId: that.data.openId,
        username:that.data.username
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.img_upload_success)

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)
  }
})