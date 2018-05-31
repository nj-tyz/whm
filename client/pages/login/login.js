//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var getCurrentLanguage = require('../../lan/currentLanguage')

//获取应用实例
const app = getApp();

Page({
  data: {
    pageSize: 5,
    pageNo: 1,
    nomore: false,
    waiting: true,
    logged: false,
    userInfo: {},
    shopList: [],
    array: ['English', '中文'],
    index: 0,
    currentLanguage: {}
  },
  onLoad: function () {
     var that = this;
    // this.setData({
    //   currentLanguage: getCurrentLanguage()
    // })
    // that.getUserInfo();
    //console.log(this.data.currentLanguage.name);

  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData({
      userInfo:{}
    })
    this.getUserInfo();
  },

  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    //判断是否需要刷新界面
    if (app.globalData.needRefresh) {
      app.globalData.needRefresh = false;
      var that = this;
      that.setData({
        pageNo: 1,
        nomore: false,
        shopList: []
      })
      that.getUserInfo();
    }
  },
  /**
  * 页面相关事件处理函数--监听用户下拉动作
  */
  onPullDownRefresh: function () {
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.setData({
      pageNo: 1,
      nomore: false,
      shopList: []
    })
    that.getUserInfo();
  },
  getUserInfo: function () {
    var that = this;
    util.showBusy('请求中...')
      // 微信登陆完毕，请求用户信息接口获取
      qcloud.request({
        url: config.service.getLoginUserUrl,
        login: true,
        success(result1) {
          console.log("getLoginUserUrl over");
          util.showSuccess('获取用户信息成功')
          console.log(result1.data.data);
          that.setData({
            logged: true,
            userInfo: result1.data.data
          })
          console.log(result1.data.data)
          wx.setStorage({
            key: "userItem",
            data: JSON.stringify(result1.data.data)
          })
          wx.hideNavigationBarLoading() //完成停止加载
          wx.stopPullDownRefresh() //停止下拉刷新
          //判断有公司并且已审核,跳转到首页
           if (result1.data.data.company_id && result1.data.data.company_reviewed == 1) {
             that.openIndex();
          }
        },
        fail(error) {
        //  util.showModel(that.data.currentLanguage.request_fail, error)
          console.log('request fail', error)


          wx.hideNavigationBarLoading() //完成停止加载
          wx.stopPullDownRefresh() //停止下拉刷新
        }
      })
  },



  //打开操作页面
  openOptions(event) {
    //data-xxx 只认小写
    wx.navigateTo({
      url: '../shop/shop?navigationBarTitle=' + event.currentTarget.dataset.shopname + '&shopID=' + event.currentTarget.dataset.shopid
    })
  },


 

  //设置公司
  settingCompany: function () {
    wx.navigateTo({
      url: '../setting/settingCompany?navigationBarTitle=完善公司'
    })
  },
  changeLanguage: function (e) {
    console.log(JSON.stringify(this));
    var _that = this;
    console.log('picker发送选择改变，携带值为', e.detail.value)
    _that.setData({
      index: e.detail.value
    })
    var language = _that.data.array[_that.data.index];
    try {
      wx.setStorageSync('currentLanguage', language)
    } catch (e) {
    }
    _that.setData({
      currentLanguage: getCurrentLanguage()
    })
  },
  //翻页
  loadmore: function () {
    var that = this;
    that.setData({
      pageNo: that.data.pageNo + 1
    })
    //重新查询后台
    that.getUserShop();
  },
  openPermissionSetting(event) {
    var that = this;
    var openId = that.data.userInfo.openId;
    console.log(openId);
    wx.navigateTo({
      url: '../setting/setting?&openId=' + openId
    })
  },
  openIndex: function (event) {
    var that = this;
    var openId = that.data.userInfo.openId;
    console.log("啊飒飒" + openId)
    // wx.switchTab({
    //   url: '../index/index?&openId=' + openId
    // });  
    wx.redirectTo({
      url: '../index/index?&openId=' + openId
    })
  },
  //撤销公司审核
  revocationCompany:function(){
    var that = this;
    var openId = this.data.userInfo.openId;
    util.showBusy('请求中...')
    qcloud.request({
      url: config.service.userUpdateUrl,
      login: true,
      data:{
        open_id: openId,
        companyId:'-1'
      },
      success(result1) {
        console.log("getLoginUserUrl over");
        util.showSuccess('撤销成功')
        that.getUserInfo();
      },
      fail(error) {
   
        console.log('request fail', error)
      }
    })

  }


})
