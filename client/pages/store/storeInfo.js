var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var currentLanguage = require('../../lan/currentLanguage')

//获取应用实例
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    objId: 0,
    currentObj: {},
    isLoadding: true,
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
      objId: options.objId,
      currentLanguage: currentLanguage()
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

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.fail, error);
        console.log('request fail', error);
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
    util.onPullDownRefresh(this.refresh);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  showAllStorePosition: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../position/positions?navigationBarTitle=仓位列表&storeID=' + that.data.objId
    })
  },

  //查询所有库存
  showAllInventory: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../inventory/inventorys?navigationBarTitle=' + event.currentTarget.dataset.storename + '库存&storeID=' + event.currentTarget.dataset.storeid
    })
  },

})