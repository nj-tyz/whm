var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var getCurrentLanguage = require('../../lan/currentLanguage')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentLanguage:{},
    overstockList:[],
    shopId:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      currentLanguage: getCurrentLanguage(),
      shopId: options.shopID
    })
    wx.setNavigationBarTitle({
      title: that.data.currentLanguage.overstock
    })
    this.loadoverstock();
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
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    
    that.loadoverstock();
    
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

  loadoverstock:function(){
    var that = this;
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.findOverStock,
      login: true,
      data: {
        
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        that.setData({
          overstockList: result.data.data
        })
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.fail, error);
        
      }
    }
    qcloud.request(options)
  },
  addOverstock:function(){
    var that = this;
    wx.navigateTo({
      url: '../inventory/outPut?navigationBarTitle=' +  that.data.currentLanguage.overstock + '&shopID=' + that.data.shopId +"&optionType=overstock"
    })
  },
  //领取页面
  receive:function(e){
    var that = this;
    var osid = e.currentTarget.dataset.osid;
    console.log(osid);
    wx.navigateTo({
      url: './receiveOverstock?osId=' + osid + '&shopId=' + that.data.shopId
    })
  }
})