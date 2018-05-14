//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var getCurrentLanguage = require('../../lan/currentLanguage')
var deviceInfo;
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
    currentLanguage: {},
    height: 0,
    scrollY: true,
    defaultShopId:""
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
  
  onLoad: function () {
    var that = this;
    //获取设备的信息
    wx.getSystemInfo({
      success: function (res) {
        deviceInfo = res;
      }
    })
    this.pixelRatio = deviceInfo.pixelRatio;
    var windowHeight = deviceInfo.windowHeight;
    var height = windowHeight *0.5 ;
    
    var defaultShopId = wx.getStorageSync('defaultShopId');
    //获取选择的语言
    var c_language = getCurrentLanguage();
    this.setData({
      currentLanguage: c_language,
      defaultShopId: defaultShopId ||"",
      height: height
    })

    

    wx.setNavigationBarTitle({
      title: c_language.position_navigation_bar_title
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
    //this.swipeDirection = 2;
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
    //console.log(this.data.currentLanguage);
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
            console.log("result1"+result1);
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
              
              var defaultShopId = wx.getStorageSync('defaultShopId');
              console.log("defaultShopId____" + defaultShopId)
              if ( defaultShopId != "") {
                wx.hideNavigationBarLoading() //完成停止加载
                wx.stopPullDownRefresh() //停止下拉刷新
                wx.navigateTo({
                  url: '../shop/shop?navigationBarTitle= &shopID=' + defaultShopId
                })
              }
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
    var that = this;
    wx.navigateTo({
      url: '../shop/addShop?navigationBarTitle=' + that.data.currentLanguage.shop_add
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
  //修改app语言
  changeLanguage:function(e){
   // console.log(JSON.stringify(this));
   var _that = this;
   // console.log('picker发送选择改变，携带值为', e.detail.value)
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
    wx.setNavigationBarTitle({
      title: _that.data.currentLanguage.position_navigation_bar_title
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
  //打开右上角 setting页面
  openPermissionSetting(event) {
    var that = this;
    var openId = that.data.userInfo.openId;
    var username = that.data.userInfo.username || that.data.userInfo.nickName;
    var img = that.data.userInfo.avatarUrl
    var companyName = that.data.userInfo.company_name;
    var companyId = that.data.userInfo.company_id;
    console.log(that.data.userInfo);
    wx.navigateTo({
      url: '../setting/setting?&openId=' + openId + '&img=' + img +'&username='+username+'&companyName=' + companyName + '&companyId=' + companyId + "&navigationBarTitle=" + that.data.currentLanguage.settings
    })

  },
  //修改店铺
  updateShop:function(e){
    var that = this;   
    wx.navigateTo({
      url: '../shop/addShop?navigationBarTitle=' + that.data.currentLanguage.shop_modify + "&shopId=" + e.currentTarget.dataset.shopid+"&cz=1"
    })
  },
  //设置默认店铺
  setDefaultShop:function(e){
    
    var id = e.currentTarget.dataset.shopid;
    console.log(id);
    try {
      wx.setStorageSync('defaultShopId', id)
      this.setData({
        defaultShopId: id
      })
    } catch (e) {
    }
    
  },
  // 以下为左移删除模块js
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
  onDeleteMsgTap: function (e) {
    console.log(e.currentTarget.dataset.shopname + '&shopID=' + e.currentTarget.dataset.shopid);
    wx.navigateTo({
      url: '../msg/delWarn?shopName=' + e.currentTarget.dataset.shopname + '&shopID=' + e.currentTarget.dataset.shopid
    })
    //this.deleteMsgItem(e);
  }, 
  onDeleteMsgLongtap: function (e) {
    console.log(e);
  },
  onMarkMsgTap: function (e) {
    console.log(e);
  },
  onMarkMsgLongtap: function (e) {
    console.log(e);
  },
  getItemIndex: function (id) {
    var shopList = this.data.shopList;
    for (var i = 0; i < shopList.length; i++) {
      if (shopList[i].id == id) {
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
      s.data.shopList.splice(index, 1);
      s.setData({ shopList: s.data.shopList });
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
    var indexString = 'shopList[' + index + '].animation';
    param[indexString] = animation.export();
    this.setData(param);
  },
  animationMsgWrapItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'shopList[' + index + '].wrapAnimation';
    param[indexString] = animation.export();
    this.setData(param);
  },
  onScroll:function(){

  }

})
