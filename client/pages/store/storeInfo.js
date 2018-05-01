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
    objId: 0,
    shopID:0,
    currentObj: {},
    isLoadding: true,
    currentLanguage: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var that = this;
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || that.data.currentLanguage.position_navigation_bar_title
    })
    this.setData({
      objId: options.objId,
      shopID: options.shopID,
      currentLanguage: getCurrentLanguage()
    });
    //获取对象
    this.getObj();
  },

  //通过id获取对象
  getObj: function () {
    util.showBusy(this.data.currentLanguage.loading)
    var that = this
    var options = {
      url: config.service.getStoreById,
      login: true,
      data: {
        id: that.data.objId
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        util.hideLoadding();
        console.log('获取成功', result.data.data)
        wx.setNavigationBarTitle({
          title: result.data.data.name
        })
        that.setData({
          currentObj: result.data.data,
          isLoadding: false
        })


        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.fail, error);
        console.log('request fail', error);

        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    }
    qcloud.request(options)
  },


  refresh: function () {
    //重新查询店铺信息
    this.getObj();
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
      app.globalData.needRefresh = false;
      var that = this;
      that.getObj();
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
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.getObj();
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

  showAllStorePosition: function (event) {

    var that = this;
   
    wx.navigateTo({
      url: '../position/positions?navigationBarTitle=仓位列表&storeID=' + that.data.objId + "&shopID=" + that.data.shopID
    })
  },

  //查询所有库存
  showAllInventory: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../inventory/inventorys?navigationBarTitle=' + that.data.currentObj.name + '库存&storeID=' + that.data.objId
    })
  },

})