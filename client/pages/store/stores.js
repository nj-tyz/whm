
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopID: 0,
    shopName: "",
    storeList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || "条码库存管理"
    })
    this.setData({
      shopID: options.shopID,
      shopName: options.shopName,
    });


    //获取门店下的所有仓库数据
    this.getAllStore();
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
      that.getAllStore();
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

  //获取店铺下的所有仓库
  getAllStore: function () {
    util.showBusy('获取本店仓库列表')
    var that = this
    var options = {
      url: config.service.getStoreListByShop,
      login: true,
      data: {
        shopID: that.data.shopID
      },
      success(result) {
        util.showSuccess('获取成功')
        console.log('仓库列表获取成功', result)
        that.setData({
          storeList: result.data.data
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    }
    qcloud.request(options)
  },

  //查询所有SKU
  showAllProduct: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../product/products?navigationBarTitle=' + event.currentTarget.dataset.storename + 'SKU&storeID=' + event.currentTarget.dataset.storeid
    })
  },

 

  //增加仓库
  addStore: function () {
    var that = this;
    wx.navigateTo({
      url: '../store/addStore?navigationBarTitle=' + that.data.shopName + '增加仓库&shopID=' + that.data.shopID
    })
  },
  //跳转到仓库明细
  showStoreInfo: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../store/storeInfo?navigationBarTitle=仓库明细&objId=' + event.currentTarget.dataset.id
    })
  },


})