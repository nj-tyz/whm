
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var currentLanguage = require('../../lan/currentLanguage')
var deviceInfo;
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopID: 0,
    shopName: "",
    storeList: [],
    nomore: true,
    pageNo: 1,
    pageSize: 5,
    currentLanguage: {},
    height: 0,
    scrollY: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    wx.getSystemInfo({
      success: function (res) {
        deviceInfo = res;
      }
    })
    this.pixelRatio = deviceInfo.pixelRatio;
    

    this.setData({
      shopID: options.shopID,
      shopName: options.shopName,
      currentLanguage: currentLanguage(),
     
    });
    var that= this;
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle  || this.data.currentLanguage.position_navigation_bar_title
    })


    //获取门店下的所有仓库数据
    this.getAllStore();

    
      
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
    if (app.globalData.needRefresh) {
      var that = this;
      this.setData({
        pageNo: 1,
        nomore: true,
        storeList: []
      });
      that.getAllStore();
    }
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
    this.setData({
      pageNo: 1,
      nomore: true,
      storeList: []
    });
    that.getAllStore();
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

  //获取店铺下的所有仓库
  getAllStore: function () {
    util.showBusy(this.data.currentLanguage.loading)
    var that = this
    var options = {
      url: config.service.getStoreListByShop,
      login: true,
      data: {
        shopID: that.data.shopID,
        pageSize: that.data.pageSize,
        pageNo: that.data.pageNo
      },
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        console.log('仓库列表获取成功', result)
        that.setData({
          storeList: that.data.storeList.concat(result.data.data),
          nomore: result.data.data.length < that.data.pageSize ? true : false
        })

        var windowHeight = deviceInfo.windowHeight;
        var windowWidth = (deviceInfo.windowWidth/750);
        console.log(deviceInfo);
        var height = (deviceInfo.windowWidth / 750)*150 * that.data.storeList.length
        that.setData({
          height: height >= windowHeight * 0.8 ? windowHeight * 0.8 : height
        })

        console.log(height+"hhhhh"+that.data.height);
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.fail, error);
        console.log('request fail', error);


        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    }
    qcloud.request(options)
  },

  //查询所有SKU
  showAllProduct: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../product/products?navigationBarTitle=' + event.currentTarget.dataset.storename + 'SKU&storeID=' + event.currentTarget.dataset.storeid
    })
  },



  //增加仓库
  addStore: function () {
    var that = this;
    wx.navigateTo({
      url: '../store/addStore?navigationBarTitle=' + that.data.shopName + that.data.currentLanguage.warehouse_add+'&shopID=' + that.data.shopID
    })
  },
  //跳转到仓库明细
  showStoreInfo: function (event) {
    var that = this;
    console.log(that.data);
    wx.navigateTo({
      url: '../store/storeInfo?navigationBarTitle='+that.data.currentLanguage.warehouse_detail+'&objId=' + event.currentTarget.dataset.id + "&shopID=" + that.data.shopID + "&shopName=" + that.data.shopName + "&storeName=" + event.currentTarget.dataset.name
    })
  },
  loadmore: function () {
    var that = this;
    that.setData({
      pageNo: that.data.pageNo + 1
    })
    //重新查询后台
    that.getAllStore();
  },
  findStore: function () {
    var that = this;
    console.log("stores.findStore:" + that.data.shopID)
    //跳转到仓库界面
    wx.navigateTo({
      url: '../store/findStore?navigationBarTitle=' + that.data.currentLanguage.position_search + '&shopId=' + that.data.shopID
    })
  },
  //删除仓库
  deleteStore:function(e){
    console.log(e.currentTarget.dataset.storename + '&storeID=' + e.currentTarget.dataset.storeid);
    wx.navigateTo({
      url: '../msg/delWarn?cz=1&storeName=' + e.currentTarget.dataset.storename + '&storeID=' + e.currentTarget.dataset.storeid
    })
    //this.deleteMsgItem(e);
  },
  updateStoreInfo:function(e){
    var that = this;
    
    wx.navigateTo({
      url: '../store/addStore?cz=1&navigationBarTitle=' + that.data.currentLanguage.store_modify + '&storeID=' + e.currentTarget.dataset.storeid
    })  
  },
  swipeCheckX: 35, //激活检测滑动的阈值
  swipeCheckState: 0, //0未激活 1激活
  maxMoveLeft: 185, //消息列表项最大左滑距离
  correctMoveLeft: 175, //显示菜单时的左滑距离
  thresholdMoveLeft: 75,//左滑阈值，超过则显示菜单
  lastShowMsgId: '', //记录上次显示菜单的消息id
  moveX: 0,  //记录平移距离
  showState: 0, //0 未显示菜单 1显示菜单
  touchStartState: 0, // 开始触摸时的状态 0 未显示菜单 1 显示菜单
  swipeDirection: 0, //是否触发水平滑动 0:未触发 1:触发水平滑动 2:触发垂直滑动
  ontouchstart: function (e) {
    if (this.showState === 1) {
      this.touchStartState = 1;
      this.showState = 0;
      this.moveX = 0;
      this.translateXMsgItem(this.lastShowMsgId, 0, 200);
      this.lastShowMsgId = "";
      return;
    }
    this.firstTouchX = e.touches[0].clientX;
    this.firstTouchY = e.touches[0].clientY;
    if (this.firstTouchX > this.swipeCheckX) {
      this.swipeCheckState = 1;
    }
    this.lastMoveTime = e.timeStamp;
  },
  ontouchmove: function (e) {
    if (this.swipeCheckState === 0) {
      return;
    }
    //当开始触摸时有菜单显示时，不处理滑动操作
    if (this.touchStartState === 1) {
      return;
    }
    var moveX = e.touches[0].clientX - this.firstTouchX;
    var moveY = e.touches[0].clientY - this.firstTouchY;
    //已触发垂直滑动，由scroll-view处理滑动操作
    if (this.swipeDirection === 2) {
      return;
    }
    //未触发滑动方向
    if (this.swipeDirection === 0) {
      console.log(Math.abs(moveY));
      //触发垂直操作
      if (Math.abs(moveY) > 4) {
        this.swipeDirection = 2;

        return;
      }
      //触发水平操作
      if (Math.abs(moveX) > 4) {
        this.swipeDirection = 1;
        this.setData({ scrollY: false });
      }
      else {
        return;
      }

    }
    //禁用垂直滚动
    // if (this.data.scrollY) {
    //   this.setData({scrollY:false});
    // }

    this.lastMoveTime = e.timeStamp;
    //处理边界情况
    if (moveX > 0) {
      moveX = 0;
    }
    //检测最大左滑距离
    if (moveX < -this.maxMoveLeft) {
      moveX = -this.maxMoveLeft;
    }
    this.moveX = moveX;
    this.translateXMsgItem(e.currentTarget.id, moveX, 0);
  },
  ontouchend: function (e) {
    this.swipeCheckState = 0;
    var swipeDirection = this.swipeDirection;
    this.swipeDirection = 0;
    if (this.touchStartState === 1) {
      this.touchStartState = 0;
      this.setData({ scrollY: true });
      return;
    }
    //垂直滚动，忽略
    if (swipeDirection !== 1) {
      return;
    }
    if (this.moveX === 0) {
      this.showState = 0;
      //不显示菜单状态下,激活垂直滚动
      this.setData({ scrollY: true });
      return;
    }
    if (this.moveX === this.correctMoveLeft) {
      this.showState = 1;
      this.lastShowMsgId = e.currentTarget.id;
      return;
    }
    if (this.moveX < -this.thresholdMoveLeft) {
      this.moveX = -this.correctMoveLeft;
      this.showState = 1;
      this.lastShowMsgId = e.currentTarget.id;
    }
    else {
      this.moveX = 0;
      this.showState = 0;
      //不显示菜单,激活垂直滚动
      this.setData({ scrollY: true });
    }
    this.translateXMsgItem(e.currentTarget.id, this.moveX, 500);
    //this.translateXMsgItem(e.currentTarget.id, 0, 0);
  },
  
  getItemIndex: function (id) {
    var storeList = this.data.storeList;
    for (var i = 0; i < storeList.length; i++) {
      if (storeList[i].id == id) {
        return i;
      }
    }
    return -1;
  },
  deleteMsgItem: function (e) {
    var animation = wx.createAnimation({ duration: 200 });
    animation.height(0).opacity(0).step();
    this.animationMsgWrapItem(e.currentTarget.id, animation);
    var s = this;
    setTimeout(function () {
      var index = s.getItemIndex(e.currentTarget.id);
      s.data.storeList.splice(index, 1);
      s.setData({ storeList: s.data.storeList });
    }, 200);
    this.showState = 0;
    this.setData({ scrollY: true });
  },
  translateXMsgItem: function (id, x, duration) {
    var animation = wx.createAnimation({ duration: duration });
    animation.translateX(x).step();
    this.animationMsgItem(id, animation);
  },
  animationMsgItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'storeList[' + index + '].animation';
    param[indexString] = animation.export();
    this.setData(param);
  },
  animationMsgWrapItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'storeList[' + index + '].wrapAnimation';
    param[indexString] = animation.export();
    this.setData(param);
  },
  onScroll:function(){

  }
})