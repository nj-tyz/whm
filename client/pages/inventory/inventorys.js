var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopID: 0,
    storeID: 0,
    productID: 0,
    shopName: "",
    shoreName: "",
    inventoryList: [],
    storeMap: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || "条码库存管理"
    })
    this.setData({
      shopID: options.shopID || 0,
      shopName: options.shopName || "",
      storeID: options.storeID || 0,
      shoreName: options.shoreName || "",
      productID: options.productID || 0
    });
    //获取门店下的所有仓库数据
    this.getAllInventory();
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
  //获取所有库存
  getAllInventory: function () {
    var that = this
    //组合参数
    var params = {};
    if (that.data.shopID) {
      params.shopID = that.data.shopID;
    }

    if (that.data.storeID) {
      params.storeID = that.data.storeID;
    }

    if (that.data.productID) {
      params.productID = that.data.productID;
    }


    util.showBusy('获取库存列表')

    var options = {
      url: config.service.listInventory,
      login: true,
      data: params,
      success(result) {
        util.showSuccess('获取成功')
        console.log('库存列表获取成功', result)
        //数据按照仓库-仓位分组
        var storeMap = that.data.storeMap;
        for (var i = 0; i < result.data.data.length; i++) {
          var inventory = result.data.data[i];
          var storeInventoryList = storeMap[inventory.storeName + "-" + inventory.positionName];

          if (!storeInventoryList) {
            storeInventoryList = new Array();
          }
          storeInventoryList.push(inventory);
          storeMap[inventory.storeName + "-" + inventory.positionName] = storeInventoryList;
        }
        console.log(storeMap);
        that.setData({
          storeMap: storeMap
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    }
    qcloud.request(options)
  },


  //产品库存
  showProductInventory: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../product/productInfo?navigationBarTitle=产品库存&barcode=' + event.currentTarget.dataset.barcode
    })
  },
})