var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    no: "",
    storeID: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || "条码库存管理"
    })
    console.log(options.storeID);
    this.setData({
      storeID: options.storeID || 0
    });
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

  bindChangeNo: function (e) {
    this.setData({
      "no": e.detail.value
    })
  },


  //提交表单
  submitForm: function () {
    var that = this;

    //校验数据完整
    if (!this.data.no || !this.data.storeID) {
      //util.showModel('提示', '数据不完整!');
      //return;
    }



    //提交
    util.showBusy('正在提交')

    var options = {
      url: config.service.addPosition,
      login: true,
      data: that.data,
      success(result) {

        console.log('添加仓位成功', result);
        wx.navigateTo({
          url: '../msg/success?title=系统提示&content=添加仓位成功&bt点击返回'
        })



      },
      fail(error) {
        util.showModel('提交失败', error);
        console.log('添加仓位失败', error);
      }
    }
    qcloud.request(options)

  },

})