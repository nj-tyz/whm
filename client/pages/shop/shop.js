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
    shopID: 0,
    currentShop: {},
    optionType: 'out',
    currentStore: {},
    currentProduct: {},
    currentInventory: {},
    optionCount: 0,
    isLoadding: true
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    //获取门店
    that.getShop();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   var that = this;
    this.setData({
      title: options.navigationBarTitle || "条码库存管理",
      shopID: options.shopID,
      currentLanguage: getCurrentLanguage()
    });
    wx.setNavigationBarTitle({
      title: that.data.title
    })
    console.log(options.shopID);
    //获取门店
    this.getShop();
  },

  radioChange: function (e) {
    this.setData({
      "optionType": e.detail.value
    })
    //console.log(e.detail.value)
  },

  //通过id获取门店对象
  getShop: function () {
    util.showBusy(this.data.currentLanguage.loading)
    var that = this
    var options = {
      url: config.service.getShop,
      login: true,
      data: {
        id: that.data.shopID
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        util.hideLoadding();
        console.log('门店获取成功', result.data.data)
        wx.setNavigationBarTitle({
          title: result.data.data.name
        })
        that.setData({
          currentShop: result.data.data,
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
    this.getShop();
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
      that.getShop();
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

  

  //扫码
  scanCode: function () {
    var that = this;
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果', res)

        var id = 0;
        var codeType = "";
        if (res.result.split(":").length>1){
          //可能是仓库二维码
          codeType = res.result.split(":")[0];
          id = res.result.split(":")[1];
        }else{
          //可能是产品条码
          id = res.result;
        }
        console.log('扫码结果', id)
        if (!id || id == "") {
          util.showModel(that.data.currentLanguage.fail);
          return;
        }


        if (codeType && codeType == 'positionID'){
         //跳转到仓库界面
          wx.navigateTo({
            url: '../store/findStore?navigationBarTitle=仓位&positionId=' + id
          })
        }else{
           //跳转到产品查找页面
          wx.navigateTo({
            url: '../product/productInfo?navigationBarTitle=商品&barcode=' + id
          })
        }
      }
    })
  },


 
  //查询所有仓库
  showAllStore: function () {
    var that = this;
    wx.navigateTo({
      url: '../store/stores?navigationBarTitle=' + that.data.currentShop.name + '仓库&shopID=' + this.data.shopID + "&shopName=" + that.data.currentShop.name
    })
  },

  //查询所有SKU
  showAllProduct: function () {
    var that = this;
    wx.navigateTo({
      url: '../product/products?navigationBarTitle=' + that.data.currentShop.name + 'SKU&shopID=' + this.data.shopID + "&shopName=" + that.data.currentShop.name
    })
  },

  //查询所有库存
  showAllInventory: function () {
    var that = this;
    wx.navigateTo({
      url: '../inventory/inventorys?navigationBarTitle=' + that.data.currentShop.name + '库存&shopID=' + this.data.shopID + "&shopName=" + that.data.currentShop.name
    })
  },
  //增加仓库
  addStore: function () {
    var that = this;
    wx.navigateTo({
      url: '../store/addStore?shopID=' + this.data.shopID
    })
  },
  //增加产品
  addProduct: function () {
    var that = this;
    wx.navigateTo({
      url: '../product/addProduct?shopID=' + this.data.shopID
    })
  },
  //出入库
  outPut: function () {
    var that = this;
    wx.navigateTo({
      url: '../inventory/outPut?navigationBarTitle=' + that.data.currentShop.name + '出入库&shopID=' + this.data.shopID
    })
  },

})