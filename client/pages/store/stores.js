
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
    shopID: 0,
    shopName: "",
    storeList: [],
    nomore: true,
    pageNo: 1,
    pageSize: 5,
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
      shopID: options.shopID,
      shopName: options.shopName,
      currentLanguage: currentLanguage()
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
      this.setData({
        pageNo: 1,
        nomore: true,
        storeList: []
      });
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
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData({
      pageNo: 1,
      nomore: true,
      storeList: []
    });
    that.getAllStore();
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
    util.showBusy(this.data.currentLanguage.loading)
    var that = this
    var options = {
      url: config.service.getStoreListByShop,
      login: true,
      data: {
        shopID: that.data.shopID,
        pageSize: that.data.pageSize,
        pageNo: that.data.pageNo
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        console.log('仓库列表获取成功', result)
        that.setData({
          storeList: that.data.storeList.concat(result.data.data),
          nomore: result.data.data.length < that.data.pageSize ? true : false
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
    console.log(that.data);
    wx.navigateTo({
      url: '../store/storeInfo?navigationBarTitle=仓库明细&objId=' + event.currentTarget.dataset.id + "&shopID=" + that.data.shopID + "&shopName=" + that.data.shopName + "&storeName=" + event.currentTarget.dataset.name
    })
  },
  loadmore: function () {
    var that = this;
    that.setData({
      pageNo: that.data.pageNo + 1
    })
    //重新查询后台
    that.getAllStore();
  },
  findStore: function () {
    var that = this;
    console.log("stores.findStore:" + that.data.shopID)
    //跳转到仓库界面
    wx.navigateTo({
      url: '../store/findStore?navigationBarTitle=查找仓位&shopId=' + that.data.shopID
    })
  }


})