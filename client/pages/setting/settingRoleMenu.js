const app = getApp();
var getcurrentLanguage = require('../../lan/currentLanguage')
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menuList:[],
    roleid:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var roleid = options.roleid;
    
    var menuList = app.globalData.menu;
    this.setData({
      roleid : roleid,
      menuList: menuList,
      currentLanguage: getcurrentLanguage() 
    })

    wx.setNavigationBarTitle({
      title: options.rolename|| that.data.currentLanguage.position_navigation_bar_title
    })
    this.loadRoleMenu();
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
  loadRoleMenu: function () {
    var that = this;
    //存储当前操作的roleid
    // this.setData({
    //   c_menuRoleId: that.data.roleId
    // })
    util.showBusy(that.data.currentLanguage.loading);
    console.log("loadRoleMenubegin");
    var options = {
      url: config.service.findRoleMenuByRole,
      login: true,
      data: {
        roleId: that.data.roleid,
      },
      success(result) {
        var roleMenuList = result.data.data;
        var menuList = that.data.menuList;
        if (roleMenuList.length > 0){
          for (var i = 0, mLen = menuList.length; i < mLen; i++) {
            for (var j = 0, rmLen = roleMenuList.length; j < rmLen; j++) {
              console.log(menuList[i].id + "___" + roleMenuList[j].menu);
              if (menuList[i].id == roleMenuList[j].menu) {
                menuList[i].checked = true;
              }
            }
          }
          console.log(menuList);
        }
        


        that.setData({
          menuList: menuList,
        })
        util.showSuccess(that.data.currentLanguage.success)
        
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)

  },
  changePosition: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var menuList = this.data.menuList;

    var c_menu = menuList[index];
    var flag = c_menu.checked == true ? 2 : 1;
    c_menu.checked = c_menu.checked == true ? false : true;

    util.showBusy(that.data.currentLanguage.loading);

    var options = {
      url: config.service.updateRoleMenu,
      login: true,
      data: {
        flag: flag,
        menuId: c_menu.id,
        roleId: that.data.roleid
      },
      success(result) {
        //修改页面
        that.setData({
          menuList: menuList,
        });
        util.showSuccess(that.data.currentLanguage.success)

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)

  },
})