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
    currentLanguage: {},
    detailId:""//子表的id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var cansubmit = util.hasMenu("7");
    var that = this;
    // wx.setNavigationBarTitle({
    //   title: options.navigationBarTitle || that.data.currentLanguage.position_navigation_bar_title
    // })
    
    this.setData({
      shopID: options.shopId,
      currentLanguage: getCurrentLanguage(),
      detailId: options.detailId,
      optionCount: options.amt
    });

    this.loadProductById(options.productId);
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
    var that = this;
    if (app.globalData.selectedPositionId && app.globalData.selectedPositionId != "") {
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
  getPositionById: function (id) {
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
          //that.getInventory();
        }
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.fail, error);
        console.log('仓库获取失败', error);
      }
    }
    qcloud.request(options)
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
        //   //重新查库存
        //   that.getInventory();
        } else {
           util.showModel(that.data.currentLanguage.system_prompt, that.data.currentLanguage.request_success);
           that.receiveOver();
        //   console.log('更新库存提交成功', result);
        //   //提交成功后初始化数据
        //   that.init()
        //   //提交成功后,标识需要刷新
           app.globalData.needRefresh = true;
           wx.navigateBack({
              delta: 1
           })
       }
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.submit_fail, error);
        console.log('更新库存提交失败', error);
      }
    }
    qcloud.request(options)

  },
  loadProductById:function(id){
    var that = this;
    util.showSuccess(that.data.currentLanguage.success)
    var options = {
      url: config.service.getById,
      login: true,
      data: {
        id: id
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        
      
          that.setData({
            currentProduct: result.data.data
          })
         
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.fail, error);
        console.log('仓库获取失败', error);
      }
    }
    qcloud.request(options)
  },
  //改变子表的状态为完成状态
  receiveOver: function () {
    var that = this;
    var detaiId = that.data.detailId;
    var options = {
      url: config.service.updateDetailStatus,
      login: true,
      data: {
        id: detaiId,
        status: 2
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        
        wx.navigateBack({
          delta: 1
        })
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)
  },
  selectPositon: function () {
    var that = this;
    wx.navigateTo({
      url: '../position/positionList?shopID=' + that.data.shopID + "&isselect=" + true
    })
  }
})