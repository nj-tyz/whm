var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var getCurrentLanguage = require('../../lan/currentLanguage')
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeID: 0,
    shopID: 0,
    shoreName: "",
    positionList: [],
    currentLanguage: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || "条码库存管理"
    })
    this.setData({
      storeID: options.storeID || 0,
      shopID: options.shopID || 0,
      shoreName: options.shoreName || "",
      currentLanguage: getCurrentLanguage()
    });
    //获取仓库下所有仓位
    this.getAllPosition();
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
    if (app.globalData.needRefresh) {
      var that = this;
      that.getAllPosition();
    }
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
    //获取仓库下所有仓位
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getAllPosition();
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
  //获取所有产品
  getAllPosition: function () {

    var that = this;


    util.showBusy(that.data.currentLanguage.loading)
    var options = {
      url: config.service.positionList,
      login: true,
      data: {
        storeID: that.data.storeID
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        console.log('仓位列表获取成功', result)
        that.setData({
          positionList: result.data.data
        })

        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
        console.log('request fail', error);

        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    }
    qcloud.request(options)
  },


  //增加仓位
  addPosition: function () {
    var that = this;

    wx.navigateTo({
      url: '../position/addPosition?navigationBarTitle=' + that.data.currentLanguage.position_add+'&storeID=' + that.data.storeID + "&shopID=" + that.data.shopID
    })
  },
  //显示二维码
  showQrCode: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../qrcode/show?navigationBarTitle=' + that.data.currentLanguage.position_qrcode +'&storeID=' + that.data.storeID + "&id=" + event.currentTarget.dataset.positionid + "&shopName=" + event.currentTarget.dataset.shopname + "&storeName=" + event.currentTarget.dataset.storename + "&positionName=" + event.currentTarget.dataset.positionname

    })
  }
})