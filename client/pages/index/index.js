//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

//获取应用实例
const app = getApp();

Page({
  data: {
    waiting: true,
    logged: false,
    userInfo: {},
    shopList: []
  },
  onLoad: function () {
    var that = this;
    that.getUserInfo();
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    //判断是否需要刷新界面
    if (app.globalData.needRefresh){
      app.globalData.needRefresh=false;
      var that = this;
      that.getUserInfo();
    }
  },
  /**
  * 页面相关事件处理函数--监听用户下拉动作
  */
  onPullDownRefresh: function () {
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.getUserInfo();
  },
  getUserInfo: function () {
    util.showBusy('正在登录');

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
            util.showSuccess('登陆成功')
            //获取门店
            that.getUserShop();
          },

          fail(error) {
            util.showModel('请求失败', error)
            console.log('request fail', error)
          }
        })
      },

      fail(error) {
        util.showModel('登录失败', error)
        console.log('登录失败', error)
      }
    })

  },
  //获取用户门店
  getUserShop: function () {
    var that = this


    //如果没有公司id或者公司未审核,不获取数据
    if (!this.data.userInfo.company_name || this.data.userInfo.company_reviewed != 1) {
      util.showSuccess('请完善公司信息')
      return;
    }


    util.showBusy('正在获取门店数据')
    var options = {
      url: config.service.shopList,
      login: true,
      data: {
        id: 1
      },
      success(result) {
        that.setData({
          waiting: false
        })
        util.showSuccess('获取成功')
        console.log('门店获取成功', result.data.data)
        that.setData({
          shopList: result.data.data
        })

        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      },
      fail(error) {
        util.showModel('获取', error);
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



  requstGetStore() {
    util.showBusy('获取仓库明细...')
    var that = this
    var options = {
      url: config.service.getStore,
      login: true,
      data: {
        id: 1
      },
      success(result) {
        util.showSuccess('请求成功完成')
        console.log('request success', result)
        that.setData({
          getStoreResult: JSON.stringify(result.data)
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    }
    qcloud.request(options)
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
  }

})
