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
    roleid: "",
    userList: [],
    searchList: [],
    currentLanguage: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentLanguage: getcurrentLanguage(),

    })
    this.setData({
      roleid: options.roleid
    })

    wx.setNavigationBarTitle({
      title: options.rolename || that.data.currentLanguage.position_navigation_bar_title
    })
    this.roleUsers();

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
    this.shopUsers();
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

    this.getOutRoleUsers();


  },
  roleUsers: function () {
    var that = this;

    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.findRoleUser,
      login: true,
      data: {
        roleid: that.data.roleid
      },
      success(result) {

        var i = 0;
        var userList = result.data.data
        for (; i < userList.length; i++) {

          userList[i].userInfo = JSON.parse(userList[i].user_info);
          userList[i].userInfo.username = userList[i].username;
          userList[i].userInfo.image = userList[i].image;
        }
        console.log(userList)
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
  removeUser: function (event) {
    var that = this;
    var userroleid = event.currentTarget.dataset.id;
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.updateShopUser,
      login: true,
      data: {

        userroleid: userroleid,
        status: 0,
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
  addUser: function (event) {
    var that = this;
    var openId = event.currentTarget.dataset.openid;
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.updateUserRole,
      login: true,
      data: {
        flag: 1,
        openId: openId,
        roleId: that.data.roleid
      },
      success(result) {
        //修改页面
        that.roleUsers();
        that.hideInput();
        util.showSuccess(that.data.currentLanguage.success)
        that.setData({
          searchList: []
        })
        util.showSuccess(that.data.currentLanguage.success)

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)

  },
  getOutRoleUsers: function () {
    var that = this;

    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.outRoleUsers,
      login: true,
      data: {
        roleid: that.data.roleid,
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