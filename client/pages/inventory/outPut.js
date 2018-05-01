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
    optionType: 'in',
    currentStore: {},
    currentProduct: {},
    currentInventory: {},
    optionCount: 0,
    currentLanguage: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || that.data.currentLanguage.position_navigation_bar_title
    })
    console.log(options.shopID);
    this.setData({
      shopID: options.shopID,
      currentLanguage: getCurrentLanguage()
    });
  
  },

  radioChange: function (e) {
    this.setData({
      "optionType": e.detail.value
    })
    //console.log(e.detail.value)
  },

  


  init: function () {
    this.setData({
      //currentStore: {},
      currentProduct: {},
      currentInventory: {},
      optionCount: 0
    });
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
      app.globalData.needRefresh = true;
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
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
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


  scanStore: function () {
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
          util.showModel(this.data.currentLanguage.hint, this.data.currentLanguage.qrcode_error);
          return;
        }

        console.log('仓库扫码得到id', id)


        //通过id获取仓库
        util.showBusy(this.data.currentLanguage.loading)
        var that = this
        var options = {
          url: config.service.getStore,
          login: true,
          data: {
            id: id
          },
          success(result) {
            util.showSuccess(that.data.currentLanguage.success)
            console.log('仓库获取成功', result.data.data)
            if (result.data.data.shop != that.data.shopID) {
              util.showModel(that.data.currentLanguage.hint, that.data.currentLanguage.store_load_error1);
              return;
            } else {
              that.setData({
                currentStore: result.data.data
              })
              //查询本仓本品库存
              that.getInventory();
            }
          },
          fail(error) {
            util.showModel(that.data.currentLanguage.fail, error);
            console.log('仓库获取失败', error);
          }
        }
        qcloud.request(options)
      }
    })
  },

  //扫描产品条码
  scanProduct: function () {
    wx.scanCode({
      success: (res) => {
        var barCode = res.result;

        if (!barCode || barCode == "") {
          util.showModel(this.data.currentLanguage.hint, this.data.currentLanguage.qrcode_error);
          return;
        }

        console.log('商品扫码结果', res)


        //通过id获取商品
        util.showBusy(this.data.currentLanguage.loading)
        var that = this
        var options = {
          url: config.service.getProductByBarCode,
          login: true,
          data: {
            barCode: barCode
          },
          success(result) {
            if (result && result.data && result.data.data && result.data.data.id) {
              util.showSuccess(this.data.currentLanguage.success)
              console.log('产品获取成功', result.data.data)
              that.setData({
                currentProduct: result.data.data
              })

              //查询本仓本品库存
              that.getInventory();
            } else {
              util.showModel(this.data.currentLanguage.hint, this.data.currentLanguage.scan_product_fail);
            }
          },
          fail(error) {
            util.showModel(this.data.currentLanguage.fail, error);
            console.log('产品获取失败', error);
          }
        }
        qcloud.request(options)
      }
    })
  },

  //查询本仓本品库存
  getInventory: function () {
    var that = this
    //有仓库,有产品且均有id再去查询
    if (!that.data.currentStore || !that.data.currentStore.id || !that.data.currentProduct || !that.data.currentProduct.id) {
      return;
    }

    util.showBusy(that.data.currentLanguage.loading)

    var options = {
      url: config.service.getInventoryBySidAndPid,
      login: true,
      data: {
        positionId: that.data.currentStore.positionId,
        productId: that.data.currentProduct.id
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        console.log('产品库存获取成功', result.data.data)
        that.setData({
          currentInventory: result.data.data
        })
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.fail, error);
        console.log('产品库存获取失败', error);
      }
    }
    qcloud.request(options)
  },
  bingOptionCount: function (e) {
    this.setData({
      "optionCount": e.detail.value
    })
  },
  //提交表单
  submitForm: function () {
    var that = this;
    console.log(this.data)
    //校验数据完整
    if (this.data.optionCount == 0 || !this.data.currentStore.id || !this.data.currentProduct.id) {
      util.showModel(this.data.currentLanguage.hint, this.data.currentLanguage.missing_data);
      return;
    }

    //校验出库数量是否大于库存数量
    if (this.data.optionType == "out") {
      //出库判断库存
      var maxCount = this.data.currentInventory.count;
      if (this.data.optionCount > maxCount) {
        util.showModel(this.data.currentLanguage.hint, this.data.currentLanguage.cant_more);
        return;
      }
    }


    //提交
    util.showBusy(this.data.currentLanguage.loading)

    var options = {
      url: config.service.optionInventory,
      login: true,
      data: {
        shopId: that.data.shopID,
        storeId: that.data.currentStore.id,
        positionId: that.data.currentStore.positionId,
        productId: that.data.currentProduct.id,
        optionType: that.data.optionType,
        optionCount: that.data.optionCount
      },
      success(result) {
        util.showSuccess(this.data.currentLanguage.success);
        console.log('更新库存提交成功', result);
        //提交成功后初始化数据
        that.init()
      },
      fail(error) {
        util.showModel(this.data.currentLanguage.submit_fail, error);
        console.log('更新库存提交失败', error);
      }
    }
    qcloud.request(options)

  },
 
})