var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var getCurrentLanguage = require('../../lan/currentLanguage')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    damageList:[],
    currentLanguage:{},
    shopId:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      currentLanguage: getCurrentLanguage(),
      shopId: options.shopID
    })
    wx.setNavigationBarTitle({
      title: that.data.currentLanguage.damage_list
    })
    this.loadDamage();
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
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载

    that.loadDamage();
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
  addDamage:function(){
    
      var that = this;
      wx.navigateTo({
        url: '../inventory/outPut?shopID=' + that.data.shopId + "&optionType=damage"
      })
   
  },
  loadDamage:function(){
    var that = this;
    util.showBusy(this.data.currentLanguage.loading)
    var options = {
      url: config.service.findDamage,
      login: true,
      data: {
        shopId:that.data.shopId
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        that.setData({
          damageList: result.data.data
        })
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.fail, error);

      }
    }
    qcloud.request(options)
  },
  comfireDamage:function(e){
    var that = this;
    wx.showModal({
      title: "提示",
      content: "确定要废弃么",
      confirmText: that.data.currentLanguage.confirm,
      cancelText: that.data.currentLanguage.cancel,
      success: function (res) {
       
        //确认
        if (res.confirm) {
          console.log("comfirm")
          var id = e.currentTarget.dataset.id;
          var options = {
            url: config.service.updateDamageStatus,
            login: true,
            data: {
              id: id,
              status: 1
            },
            success(result) {
              util.showSuccess(that.data.currentLanguage.success)
              that.loadDamage();

            },
            fail(error) {
              util.showModel(that.data.currentLanguage.fail, error);

            }
          }
          qcloud.request(options)
        } else {
          
        }
      }
    });



    
  },
  cancelDamage:function(e){
    var that = this;
    wx.showModal({
      title: "提示",
      content: "确定要取消么",
      confirmText: that.data.currentLanguage.confirm,
      cancelText: that.data.currentLanguage.cancel,
      success: function (res) {

        //确认
        if (res.confirm) {
          console.log("comfirm")
          var id = e.currentTarget.dataset.id;
          var options = {
            url: config.service.cancelDamage,
            login: true,
            data: {
              id: id,
            },
            success(result) {
              util.showSuccess(that.data.currentLanguage.success)
              that.loadDamage();

            },
            fail(error) {
              util.showModel(that.data.currentLanguage.fail, error);

            }
          }
          qcloud.request(options)
        } else {

        }
      }
    });

  }

})