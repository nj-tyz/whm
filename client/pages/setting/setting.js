var currentLanguage = require('../../lan/currentLanguage')
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var sliderWidth = 64; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    c_user:{},
    tabs: ["个人", "公司", "店铺","岗位"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    c_openId:"",
    pageHeight: 0,
    inputShowed: false,
    inputVal: "",
    userList:[],
    checkboxItems: [
      { name: '岗位a', value: '0', checked: true },
      { name: '岗位b', value: '1' },
      { name: '岗位c', value: '2' },
      { name: '岗位d', value: '3' }
    ],
    companyName:"",
    companyId:"",
    currentLanguage:{},
    username:"",
    userimg:""
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || that.data.currentLanguage.position_navigation_bar_title
    })
    var that = this;
    var cl = currentLanguage();
    this.setData({
      currentLanguage: cl,
      tabs: cl.setting_tabs,
      companyName:options.companyName||"",
      c_openId: options.openId,
      companyId: options.companyId,
      username: options.username,
      userimg: options.img
    })
    //console.log(options.companyName);  
    this.companyUsers();
    this.companyShopList();


    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
          pageHeight: res.windowHeight - 50
        });
      }
    });
    



  },
  
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
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
  },
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);

    var checkboxItems = this.data.checkboxItems, values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }

    this.setData({
      checkboxItems: checkboxItems
    });
  },
  companyUsers:function(){
    var that = this;
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.companyUsers,
      login: true,
      data: {},
      success(result) {
        
        var i = 0;
        var userList = result.data.data 
        for (; i < userList.length;i++){
          
          userList[i].user_info = JSON.parse(userList[i].user_info);
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
  auditUser: function (event){
    var that = this;
    var openId = event.currentTarget.dataset.useropenid; 
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.auditUser,
      login: true,
      data: {
        openId:openId
      },
      success(result) {
        //重新加载数据
        that.companyUsers();

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)

  },
  removeUser: function (event){
    var that = this;
    var openId = event.currentTarget.dataset.useropenid;
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.removeUser,
      login: true,
      data: {
        openId: openId
      },
      success(result) {
        //重新加载数据
        that.companyUsers();

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)

  },
  companyShopList: function () {
    var that = this;
    
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.companyShopList,
      login: true,
      data: {
      
      },
      success(result) {
        //重新加载数据
        that.setData({
          shopList: result.data.data
        })
     //   console.log(that.data.shopList);
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)

  },
  openQr:function(){
    var that = this;
    wx.navigateTo({
      url: '../qrcode/show?companyId=' + that.data.companyId + "&qrcodeType=company&companyName=" + that.data.companyName 
    })
  },
  //修改用户名
  modifyUsername:function(){
    var that = this;
    console.log(1111);
    wx.navigateTo({
      url: './modifyUsername?username=' + that.data.username + "&openId=" + that.data.c_openId
    })
  }

});