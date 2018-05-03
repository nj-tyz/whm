var getcurrentLanguage = require('../../lan/currentLanguage')
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputShowed: false,
    inputVal: "",
    shopId:"",
    userList:[],
    searchList:[],
    currentLanguage:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentLanguage: getcurrentLanguage(),
      
    })
    this.setData({
      shopId: options.shopId
    })
    this.shopUsers();
    
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
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });

    this.getOutShopUsers();
    
    
  },
  shopUsers:function(){
    var that = this;

    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.shopUsers,
      login: true,
      data: {
        shopId: that.data.shopId
      },
      success(result) {
        
        var i = 0;
        var userList = result.data.data
        for (; i < userList.length; i++) {

          userList[i].userInfo = JSON.parse(userList[i].userInfo);
        }
        that.setData({
          userList: userList
        })
       
        util.showSuccess(that.data.currentLanguage.success)
        
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)
  },
  removeUser: function (event){
    var that = this;
    var usershopId = event.currentTarget.dataset.id;
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.updateShopUser,
      login: true,
      data: {
        
        usershopId: usershopId,
        status:0,
      },
      success(result) {

        that.shopUsers();
        util.showSuccess(that.data.currentLanguage.success)

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)


  },
  addUser: function (event){
    var that = this;
    var openId = event.currentTarget.dataset.openid;
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.updateShopUser,
      login: true,
      data: {
        shopId: that.data.shopId,
        openId: openId,
        status: 1,
      },
      success(result) {

        that.shopUsers();
        that.hideInput();
        util.showSuccess(that.data.currentLanguage.success)

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)

  },
  getOutShopUsers:function(){
    var that = this;
    
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.outShopUser,
      login: true,
      data: {
        shopId: that.data.shopId,
        username: that.data.inputVal
      },
      success(result) {
        
        var i = 0;
        var searhcList = result.data.data
        for (; i < searhcList.length; i++) {
          searhcList[i].user_info = JSON.parse(searhcList[i].user_info);
        }
        
        
        
        that.setData({
          searchList: searhcList
        })
        util.showSuccess(that.data.currentLanguage.success)

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)


  }



})