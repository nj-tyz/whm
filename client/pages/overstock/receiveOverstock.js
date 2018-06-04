// pages/overstock/receiveOverstock.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var getCurrentLanguage = require('../../lan/currentLanguage')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentLanguage: {},
    osId:"",  
    overStock:{},
    shopId:'',  //当前店铺
    isOwner:false, //是不是overstock发布店铺
    amount:0 , //本次领取的数量
  
    hiddenmodalput:true  //添加输入框是否显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      currentLanguage: getCurrentLanguage(),
      shopId : options.shopId,
      osId: options.osId
    })
    wx.setNavigationBarTitle({
      title: that.data.currentLanguage.receive_list
    })
    this.loadOverstock();
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (app.globalData.needRefresh) {
      app.globalData.needRefresh = false;
      var that = this;
      that.loadOverstock();
    }
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
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载

    that.loadOverstock();
   
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
  loadOverstock:function(){
    var that = this;
    var id = that.data.osId;
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.getOverstockById,
      login: true,
      data: {
        id:id,
        shopId:that.data.shopId
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        var isOwner = (result.data.data.shop == that.data.shopId)
        that.setData({
          overStock: result.data.data,
          isOwner: isOwner
        })
        console.log(that.data.overStock);
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.fail, error);

      }
    }
    qcloud.request(options)
  },
  //添加框 出现事件
  addOverstock:function(){
    this.setData({
      hiddenmodalput: false
    });
  },
 //添加框消失事件
  cancelDetail: function () {
    this.setData({
      hiddenmodalput: true
    });
  },
  //添加框确认事件 领取 添加子表
  comfirmDetail: function (e) {
    var that = this;
    
    var amount = this.data.amount;
    var shopId = this.data.shopId;
    var company = this.data.overStock.company;
    var osid = this.data.overStock.id;
    var useable = this.data.overStock.useable - this.data.amount;

    if (useable < 0 ){
      wx.showModal({
        content: that.data.currentLanguage.not_enough_overstock_amount + that.data.overStock.useable,
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
           
          }
        }
      });
      return;
    }
    
    console.log(shopId);
    wx.showModal({
      title: that.data.currentLanguage.hint,
      content: that.data.currentLanguage.receive + "  "+that.data.amount + "?",
      confirmText: that.data.currentLanguage.confirm,
      cancelText: that.data.currentLanguage.cancel,
      success: function (res) {
        console.log(res);
        //确认
        if (res.confirm) {
          var options = {
            url: config.service.addDetail,
            login: true,
            data: {
              amount: amount,
              shopId: shopId,
              company: company,
              osId: osid
            },
            success(result) {
              util.showSuccess(that.data.currentLanguage.success)
              that.updateUseableAmt(useable, osid);
            },
            fail(error) {
              util.showModel(that.data.currentLanguage.request_fail, error);
            }
          }
          qcloud.request(options)


          that.setData({
            hiddenmodalput: true
          })

        } else {
          that.setData({
            hiddenmodalput: true
          })
        }
      }
    });

  },
  setAmount:function(e){
    var amount = e.detail.value * 1;
    if (isNaN(amount)){
      amount = 0
    } 

    this.setData({
      amount: amount
    })
  },
  //修改主表可用数量(回调中用到)
  updateUseableAmt: function (amount,osid){
    var that  = this;
    var options = {
      url: config.service.updateUseableAmt,
      login: true,
      data: {
        amount: amount,
        osId: osid
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        that.loadOverstock();
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)
  },
  //发货改变状态
  sendproduct:function(e){
    var that = this;
    var detaiId = e.currentTarget.dataset.id;
    var options = {
      url: config.service.updateDetailStatus,
      login: true,
      data: {
        id: detaiId,
        status: 1
      },
      success(result) {
        //util.showSuccess(that.data.currentLanguage.success)
        that.loadOverstock(that.data.osId)
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)
  },
  receiveProduct:function(e){
    var amt = e.currentTarget.dataset.amt;
    var did = e.currentTarget.dataset.id;
    var pid = this.data.overStock.product;
    var shopId = this.data.shopId;
    console.log(amt+"_"+did+"_"+pid+"_"+shopId);

    wx.navigateTo({
      url: './receiveProduct?productId=' + pid + '&shopId=' + shopId + "&detailId=" + did + "&amt=" + amt
    })
  }
})