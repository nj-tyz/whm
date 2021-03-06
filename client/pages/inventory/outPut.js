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
    var cansubmit = util.hasMenu("7");
    var that = this;
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || that.data.currentLanguage.position_navigation_bar_title
    })
    console.log(options.optionType);
    this.setData({
      shopID: options.shopID,
      optionType: options.optionType,
      currentLanguage: getCurrentLanguage(),
      cansubmit: cansubmit
    });
    var position = wx.getStorageSync("defaultPosition");
    if (position != ''){
      this.getPositionById(position);
    }
  },

 // radioChange: function (e) {
 //   this.setData({
 //     "optionType": e.detail.value
 //   })
    //console.log(e.detail.value)
  //},




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
    var that = this;

    //如果全局变量中有selectedBarcode,则代表是从选择产品页面返回的,直接填充产品
    if (app.globalData.selectedBarcode && app.globalData.selectedBarcode != "") {
      //调用查询商品bybarcode方法
      console.log("选择到的条码:" + app.globalData.selectedBarcode);
      that.getProductByBarcode(app.globalData.selectedBarcode);

      //设置全局app.globalData.selectedBarcode为空
      app.globalData.selectedBarcode = "";
    }
    if (app.globalData.selectedPositionId && app.globalData.selectedPositionId != ""){
      that.getPositionById(app.globalData.selectedPositionId);
      app.globalData.selectedPositionId = "";
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

        this.getPositionById(id);
        //通过id获取仓库
        
      }
    })
  },
  //通过id获取仓位
  getPositionById:function(id){
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
  },
  //通过条码获取产品
  getProductByBarcode(barCode) {
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
          util.showSuccess(that.data.currentLanguage.success)
          console.log('产品获取成功', result.data.data)
          that.setData({
            currentProduct: result.data.data
          })

          //查询本仓本品库存
          that.getInventory();
        } else {
          util.showModel(that.data.currentLanguage.hint, that.data.currentLanguage.scan_product_fail);
        }
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.fail, error);
        console.log('产品获取失败', error);
      }
    }
    qcloud.request(options)
  },

  //扫描产品条码
  scanProduct: function () {
    var that = this;
    wx.scanCode({
      success: (res) => {
        var barCode = res.result;

        if (!barCode || barCode == "") {
          util.showModel(that.data.currentLanguage.hint, that.data.currentLanguage.qrcode_error);
          return;
        }

        console.log('商品扫码结果', res)


        //通过扫描到的条码去后台查询产品信息
        that.getProductByBarcode(barCode);
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
  //修改数字
  checkNumber: function (e) {
    if (e.detail.value == 0) {
      this.setData({
        "optionCount": ""
      })
    }
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
    if (this.data.optionType == "out"  ) {
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
        if (result.data.data.errocode == 1) {
          util.showModel(that.data.currentLanguage.submit_fail, result.data.data.msg);
          //重新查库存
          that.getInventory();
        } else {
          util.showModel(that.data.currentLanguage.system_prompt, that.data.currentLanguage.request_success);
          console.log('更新库存提交成功', result);
          //提交成功后初始化数据
          that.init()
          //提交成功后,标识需要刷新
          app.globalData.needRefresh = true;
        }
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.submit_fail, error);
        console.log('更新库存提交失败', error);
      }
    }
    qcloud.request(options)

  },

  //跳转到选择产品页面
  selectProduct: function () {
    var that = this;
    wx.navigateTo({
      url: '../product/products?navigationBarTitle=SKU&shopID=' + that.data.shopID + "&isselect=" + true
    })
  },
  //overstock
  addOverstock:function(){
    var that = this;
    console.log(this.data)
    //校验数据完整
    if (this.data.optionCount == 0 || !this.data.currentStore.id || !this.data.currentProduct.id) {
      util.showModel(this.data.currentLanguage.hint, this.data.currentLanguage.missing_data);
      return;
    }

    //校验出库数量是否大于库存数量
    if (this.data.optionType == "overstock") {
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
      url: config.service.addOverStock,
      login: true,
      data: {
        shopId: that.data.shopID,
        storeId: that.data.currentStore.id,
        positionId: that.data.currentStore.positionId,
        productId: that.data.currentProduct.id,
        total: that.data.optionCount
      },
      success(result) {
         if (result.data.data.errocode == 1) {
          util.showModel(that.data.currentLanguage.submit_fail, result.data.data.msg);
        //   //重新查库存
        //   that.getInventory();
         } else {
           util.showModel(that.data.currentLanguage.system_prompt, that.data.currentLanguage.request_success);
        //   console.log('更新库存提交成功', result);
        //   //提交成功后初始化数据
        //   that.init()
        //   //提交成功后,标识需要刷新
        //   app.globalData.needRefresh = true;
         }
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.submit_fail, error);
        console.log('更新库存提交失败', error);
      }
    }
    qcloud.request(options)
  },
  //damage
  addDamage:function(){
    var that = this;
    //校验数据完整
    if (this.data.optionCount == 0 || !this.data.currentStore.id || !this.data.currentProduct.id) {
      util.showModel(this.data.currentLanguage.hint, this.data.currentLanguage.missing_data);
      return;
    }

    //校验出库数量是否大于库存数量
    if (this.data.optionType == "damage") {
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
      url: config.service.addDamage,
      login: true,
      data: {
        shopId: that.data.shopID,
        storeId: that.data.currentStore.id,
        positionId: that.data.currentStore.positionId,
        productId: that.data.currentProduct.id,
        amount: that.data.optionCount
      },
      success(result) {
        if (result.data.data.errocode == 1) {
          util.showModel(that.data.currentLanguage.submit_fail, result.data.data.msg);
          //   //重新查库存
          //   that.getInventory();
        } else {
          util.showModel(that.data.currentLanguage.system_prompt, that.data.currentLanguage.request_success);
          //   console.log('更新库存提交成功', result);
          //   //提交成功后初始化数据
          //   that.init()
          //   //提交成功后,标识需要刷新
          //   app.globalData.needRefresh = true;
        }
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.submit_fail, error);
        console.log('更新库存提交失败', error);
      }
    }
    qcloud.request(options)
  },
  selectPositon:function(){
    var that = this;
    wx.navigateTo({
      url: '../position/positionList?shopID=' + that.data.shopID + "&isselect=" + true
    })
  }


})