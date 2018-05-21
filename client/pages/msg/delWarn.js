// pages/msg/success.js
//获取应用实例
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
    title: "Warning",
    content: "删除后以下库存将消失",
    btn: "点击返回",
    shopID:"",
    storeID:"",
    inventoryList: [],
    storeMap: {},
    positionId:"",
    cz:"",
    currentLanguage:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var cz = options.cz;
    var language = getCurrentLanguage();
    var parmas = {
      currentLanguage: language,
      content: options.content || language.delete_warn_1,
      btn: options.btn || language.sdelete,
    }
    
    if(cz == '1'){
      parmas.title=options.storeName,
      parmas.storeID = options.storeID
    } else if (cz == '2'){
      parmas.title =  options.no
      parmas.positionId = options.id
      parmas.cz = cz
    }else{
      parmas.shopName = options.shopName
      parmas.shopID = options.shopID
    }
    this.setData(parmas);
    this.getAllInventory();
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

  }
  ,
  closePage: function () {
    //通知上个页面刷新
    app.globalData.needRefresh = true;
    wx.navigateBack({
      delta: 2
    })
  },
  getAllInventory: function () {
    var that = this
    //组合参数
    var params = {};
    //此组合参数一定要注意
    //产品,仓库,店铺
    //如果有最小单位,则传最小单位,如果三个都传,返回的是店铺下的数据
    if (that.data.productID) {
      params.productID = that.data.productID;
    } else if (that.data.storeID) {
      console.log("storeID=" + that.data.storeID);
      params.storeID = that.data.storeID;
    } else if (that.data.shopID) {
      console.log("shop=" + that.data.shopID);
      params.shopID = that.data.shopID;
    }

    util.showBusy(that.data.currentLanguage.loading);

    var options = {
      url: config.service.listInventory,
      login: true,
      data: params,
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        //数据按照仓库-仓位分组
        var storeMap = that.data.storeMap;
        for (var i = 0; i < result.data.data.length; i++) {
          var inventory = result.data.data[i];
          var storeInventoryList = storeMap[inventory.storeName + "-" + inventory.positionName];

          if (!storeInventoryList) {
            storeInventoryList = new Array();
          }
          storeInventoryList.push(inventory);
          storeMap[inventory.storeName + "-" + inventory.positionName] = storeInventoryList;
        }
        //console.log(storeMap);
        that.setData({
          inventoryList: result.data.data,
          storeMap: storeMap
        })
        

        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
        console.log('request fail', error);


        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    }
    if(that.data.cz == '2'){
      that.getInventoryByPosition();
    }else{
      qcloud.request(options)
    }
  },
  openWarn: function () {
    var that = this;
    var params={};
    if (that.data.productID) {
      params.productID = that.data.productID;
    } else if (that.data.storeID) {
      console.log("storeID=" + that.data.storeID);
      params.storeID = that.data.storeID;
    } else if (that.data.shopID) {
      console.log("shop=" + that.data.shopID);
      params.shopID = that.data.shopID;
    } else if (that.data.positionId) {
      console.log("positionId=" + that.data.positionId);
      params.positionID = that.data.positionId;
    }
    wx.showModal({
      title: that.data.currentLanguage.warning,
      content: that.data.currentLanguage.delete_warn_2,
      confirmText: that.data.currentLanguage.delete_confirm,
      cancelText: that.data.currentLanguage.delete_cancel,
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          var options = {
            url: config.service.deleteInventory,
            login: true,
            data: params,
            success(result) {
              util.showSuccess(that.data.currentLanguage.success)
              var value = wx.getStorageSync('defaultShopId')
              console.log(that.data.shopID +"_______________"+ value);
              if (that.data.shopID == value){
                try {
                  wx.setStorageSync('defaultShopId', "")
                  
                } catch (e) {
                }

              }

              app.globalData.needRefresh = true;
              wx.navigateBack({

                delta: 2
              })
            },
            fail(error) {
              util.showModel(that.data.currentLanguage.request_fail, error);
              console.log('request fail', error);

            }
          }  
          qcloud.request(options); 
        } else {
          console.log('用户点击辅助操作')
        }
      }
    });
  },
  getInventoryByPosition:function(){
    var that = this;
    var options = {
      url: config.service.listInventoryByPosition,
      login: true,
      data: {
        positionId: that.data.positionId
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        //数据按照仓库-仓位分组
        
        //console.log(storeMap);
        that.setData({
          inventoryList: result.data.data,
          
        })
        console.log(that.data.inventoryList)

        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
        
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    }
    qcloud.request(options); 
  }
})