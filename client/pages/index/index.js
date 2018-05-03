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
    this.setData({
      currentLanguage: getCurrentLanguage()
    })
    that.getUserInfo();
    //console.log(this.data.currentLanguage.name);

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
    console.log(this.data.currentLanguage);
    util.showBusy(this.data.currentLanguage.loading);

    var that = this;

    console.log("调用登陆接口qcloud.login");
    // 调用登录接口
    qcloud.login({
      success(result) {
        console.log("调用登陆接口qcloud.login over");
        // 微信登陆完毕，请求用户信息接口获取
        qcloud.request({
          url: config.service.getLoginUserUrl,
          login: true,
          success(result1) {
            console.log("getLoginUserUrl over");
            //util.showSuccess('获取用户信息成功')
            console.log(result1);
            that.setData({
              logged: true,
              userInfo: result1.data.data
            })
            if (!that.data.userInfo.company_name) {
              //没有公司名
              util.showModel(that.data.currentLanguage.system_prompt, that.data.currentLanguage.no_company, function () {
                //  跳转到公司设置界面
                that.settingCompany();
              });

            } else if (that.data.userInfo.company_reviewed != 1) {
              //有公司但是未审核
              util.showModel(that.data.currentLanguage.system_prompt, that.data.currentLanguage.company_no_check);
            } else {
              util.showSuccess(that.data.currentLanguage.load_success)
              //获取门店
              that.getUserShop();
            }
            wx.hideNavigationBarLoading() //完成停止加载
            wx.stopPullDownRefresh() //停止下拉刷新
          },

          fail(error) {
            util.showModel(that.data.currentLanguage.request_fail, error)
            console.log('request fail', error)


            wx.hideNavigationBarLoading() //完成停止加载
            wx.stopPullDownRefresh() //停止下拉刷新
          }
        })
      },

      fail(error) {
        util.showModel(that.data.currentLanguage.load_fail, error)
        console.log('登录失败', error)
      }
    })

  },
  //获取用户门店
  getUserShop: function () {
    var that = this

    util.showBusy(that.data.currentLanguage.loading)
    var options = {
      url: config.service.shopList,
      login: true,
      data: {
        id: 1,
        pageSize: that.data.pageSize,
        pageNo: that.data.pageNo
      },
      success(result) {
        that.setData({
          waiting: false
        })
        util.showSuccess(that.data.currentLanguage.success)
        console.log('门店获取成功', result.data.data)
        that.setData({
          shopList: that.data.shopList.concat(result.data.data),
          nomore: result.data.data.length < that.data.pageSize ? true : false
        })

        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.fail, error);
        console.log('request fail', error);
      }
    }
    qcloud.request(options)
  },


  //打开操作页面
  openOptions(event) {
    //data-xxx 只认小写
    wx.navigateTo({
      url: '../shop/shop?navigationBarTitle=' + event.currentTarget.dataset.shopname + '&shopID=' + event.currentTarget.dataset.shopid
    })
  },


  //增加店铺
  addStore: function () {
    wx.navigateTo({
      url: '../shop/addShop?navigationBarTitle=增加店铺'
    })
  },

  //增加商品
  addProduct: function () {
    wx.navigateTo({
      url: '../product/addProduct?navigationBarTitle=增加商品'
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

  }


})
