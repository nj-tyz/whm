
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
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

  //查询所有库存
  showAllInventory: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../inventory/inventorys?navigationBarTitle=' + event.currentTarget.dataset.storename + '库存&storeID=' + event.currentTarget.dataset.storeid
    })
  },
  showAllStorePosition: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../position/positions?navigationBarTitle=' + event.currentTarget.dataset.storename + '仓位&storeID=' + event.currentTarget.dataset.storeid
    })
  },

  //增加仓库
  addStore: function () {
    var that = this;
    wx.navigateTo({
      url: '../store/addStore?navigationBarTitle=' + that.data.shopName + '增加仓库&shopID=' + that.data.shopID
    })
  },

  //打开仓库查询界面
  findByCode: function () {
    var that = this;
    wx.navigateTo({
      url: '../store/findStore?navigationBarTitle=' + that.data.shopName + '查找仓库&shopID=' + that.data.shopID
    })
  },

  //扫码查库存
  findByCode1: function () {
    wx.scanCode({
      success: (res) => {
        var id = 0;
        var codeType = "";
        try {
          codeType = res.result.split(":")[0];
          id = res.result.split(":")[1];
        } catch (e) {
          console.error(e);
          id = 0;
        }

        if (!codeType || codeType != 'positionID' || !id || id == 0) {
          util.showModel('提示', '二维码错误!');
          return;
        }

        console.log('仓库扫码得到id', id)


        //通过id获取仓库
        util.showBusy('正在获取仓库数据')

        var options = {
          url: config.service.getStore,
          login: true,
          data: {
            id: id
          },
          success(result) {
            util.showSuccess('获取成功')
            console.log('仓库获取成功', result.data.data)
            console.log('仓库获取成功', that.data)
            if (result.data.data.shop != that.data.shopID) {
              util.showModel('提示', '该仓库不在本店铺,请切换店铺!');
              return;
            } else {
              //打开库存查询界面
              var that = this;
              wx.navigateTo({
                url: '../inventory/inventorys?navigationBarTitle=' + result.data.data.name + '-' + result.data.data.positionNo + '库存&positionID=' + result.data.data.positionId
              })
            }
          },
          fail(error) {
            util.showModel('获取失败', error);
            console.log('仓库获取失败', error);
          }
        }
        qcloud.request(options)
      }
    })
  }



})