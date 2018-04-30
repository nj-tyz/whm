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
    pageSize: 5,
    pageNo: 1,
    nomore:false,

    shopID: 0,
    storeID: 0,
    shopName: "",
    shoreName: "",
    productList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || "条码库存管理"
    })
    this.setData({
      shopID: options.shopID || 1,
      shopName: options.shopName || "",
      storeID: options.storeID || 0,
      shoreName: options.shoreName || ""
    });
    //获取门店下的所有仓库数据
    this.getAllProduct();
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
      that.getAllProduct();
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
      nomore: false,
      productList: []
    });
    that.getAllProduct();
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
  //产品库存
  showProductInventory: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../product/findProduct?navigationBarTitle=产品库存&barcode=' + event.currentTarget.dataset.barcode
    })
  },


  //增加商品
  addProduct: function () {
    wx.navigateTo({
      url: '../product/addProduct?navigationBarTitle=增加商品'
    })
  },
  //获取所有产品
  getAllProduct: function () {

    var that = this;
    //组合参数
    var params = {
      pageSize: that.data.pageSize,
      pageNo: that.data.pageNo,
    };
    if (that.data.shopID) {
      params.shopID = that.data.shopID;
    }
    if (that.data.storeID) {
      params.storeID = that.data.storeID;
    }

    console.log(params);


    util.showBusy('获取商品列表')
    var options = {
      url: config.service.productList,
      login: true,
      data: params,
      success(result) {
        util.showSuccess('获取成功')
        console.log('商品列表获取成功', result)
        //有翻页,所以使用合并
        that.setData({
          productList: that.data.productList.concat(result.data.data),
          //标识是不是没有更多数据了
          nomore: result.data.data.length<that.data.pageSize?true:false
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    }
    qcloud.request(options)
  },
  //翻页
  loadmore: function () {
    var that = this;
    that.setData({
      pageNo: that.data.pageNo + 1
    })
    //重新查询后台
    that.getAllProduct();
  }
})