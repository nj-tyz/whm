var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    name: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      name: options.name
    });


    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || "条码库存管理"
    })


    //后台检查
    this.docheck();
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

  //检查
  docheck: function () {
    util.showBusy('检查中')
    var that = this
    var options = {
      url: config.service.getCompanyByName,
      login: true,
      data: {
        name: that.data.name
      },
      success(result) {
        util.showSuccess('检查完成')
        if (result.length > 0) {
          that.setData({
            id: result[0].id
          });
        } else {
          that.setData({
            id: -1
          });
        }
      },
      fail(error) {
        util.showModel('检查失败,请稍后重试', error);
        console.log('request fail', error);
      }
    }
    qcloud.request(options)
  },

  //处理结果
  submit: function () {
    util.showBusy('提交中')
    var that = this
    var options = {
      url: config.service.joinCompany,
      login: true,
      data: that.data,
      success(result) {
        util.showSuccess('设置成功');
        //通知上个页面刷新
        app.globalData.needRefresh = true;

        wx.navigateBack({
          delta: 2
        })
      },
      fail(error) {
        util.showModel('检查失败,请稍后重试', error);
        console.log('request fail', error);
      }
    }
    qcloud.request(options)
  }
})