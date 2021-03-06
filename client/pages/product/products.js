var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var currentLanguage = require('../../lan/currentLanguage')
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageSize: 5,
    pageNo: 1,
    nomore: false,

    inputShowed: false,
    inputVal: "",
    c_index:-1,
    showMod:false,
    //当前页面是否是一个选择器
    isselect: false,

    shopID: 0,
    storeID: 0,
    shopName: "",
    shoreName: "",
    productList: [],
    currentLanguage: {},
    currencyType: '$'
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

    //重新查询数据
    this.setData({
      inputVal: "",
      pageNo: 1,
      nomore: false,
      productList: []
    });
    this.getAllProduct();
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    var that = this;
    this.setData({
      inputVal: e.detail.value
    });

    //调用查询
    this.setData({
      pageNo: 1,
      nomore: false,
      productList: []
    });
    that.getAllProduct();
  },

  //扫码
  scanCode: function () {
    var that = this;
    wx.scanCode({
      success: (res) => {
        var barCode = res.result;

        if (!barCode || barCode == "") {
          util.showModel(that.data.currentLanguage.hint, that.data.currentLanguage.bar_code_error);
          return;
        }

        console.log('商品扫码结果', res)

        var event = {
          currentTarget: {
            dataset: {
              barcode: barCode
            }
          }
        }
        //调用显示
        that.showProductInfo(event);
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || "条码库存管理"
    })
    this.setData({
      shopID: options.shopID || 0,
      shopName: options.shopName || "",
      storeID: options.storeID || 0,
      shoreName: options.shoreName || "",
      isselect: options.isselect || false,
      currentLanguage: currentLanguage()
    });
    //获取门店下的所有仓库数据
    this.getAllProduct();
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
        nomore: false,
        productList: [],
        showMod:false
      });
      that.getAllProduct();
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
      nomore: false,
      productList: [],
      showMod: false
    });
    that.getAllProduct();
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
  //产品库存
  showProductInfo: function (event) {
    var that = this;
    if (that.data.showMod){
      this.setData({
        c_index: event.currentTarget.dataset.cindex
      })
    }else{
    //如果当前页面是为了选择商品打开的,则跳回上个页面,并把当前选中的barcode放入全局变量中
    if (this.data.isselect) {
      //通知上个页面刷新
      app.globalData.selectedBarcode = event.currentTarget.dataset.barcode;
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.navigateTo({
        url: '../product/productInfo?navigationBarTitle=' + that.data.currentLanguage.product_inventory +'&shopID=' + that.data.shopID + '&barcode=' + event.currentTarget.dataset.barcode
      })
    }
    }
  },


  //增加商品
  addProduct: function () {
    var that = this;
    //4为全局变量中menulist 的id
    var hasPm = util.hasMenu("4");
    if (hasPm) {
      wx.navigateTo({
        url: '../product/addProduct?navigationBarTitle=' + that.data.currentLanguage.product_add + "&shopID=" + this.data.shopID
      })
    } else {
      wx.showModal({
        content: that.data.currentLanguage.no_permission,
        showCancel: false,
        success: function (res) {
          if (res.confirm) {

          }
        }
      });

    }
    
  },
  //获取所有产品
  getAllProduct: function () {

    var that = this;
    //组合参数
    var params = {
      pageSize: that.data.pageSize,
      pageNo: that.data.pageNo,
      inputVal: that.data.inputVal
    };
    if (that.data.shopID) {
      params.shopID = that.data.shopID;
    }
    if (that.data.storeID) {
      params.storeID = that.data.storeID;
    }

    console.log(params);


    util.showBusy(that.data.currentLanguage.loading)
    var options = {
      url: config.service.productList,
      login: true,
      data: params,
      success(result) {
        util.showSuccess(that.data.currentLanguage.success)
        console.log('商品列表获取成功', result)
        //有翻页,所以使用合并
        console.log(JSON.stringify(result.data.data));
        that.setData({
          productList: that.data.productList.concat(result.data.data),
          //标识是不是没有更多数据了
          //如果本次拿到的数量小于pagesize,则认为后面不能再翻页了
          nomore: result.data.data.length < that.data.pageSize ? true : false
        })

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
  //翻页
  loadmore: function () {
    var that = this;
    that.setData({
      pageNo: that.data.pageNo + 1
    })
    //重新查询后台
    that.getAllProduct();
  },
  modifyP:function(){
    var that = this;
    //4为全局变量中menulist 的id
    var hasPm = util.hasMenu("4");
    if (hasPm) {
      var status = this.data.showMod ==true? false:true;
      this.setData({
        showMod: status
      })
    } else {
      wx.showModal({
        content: that.data.currentLanguage.no_permission,
        showCancel: false,
        success: function (res) {
          if (res.confirm) {

          }
        }
      });

    }
  },
  cancelBtn:function(){
    this.setData({
      showMod: false
    })
  },
  modifyProduct:function(){
    var that = this;
    
    if (this.data.c_index < 0){
      wx.showModal({
        content: that.data.currentLanguage.no_select,
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
          }
        }
      });
    } else {

      var productid = this.data.productList[this.data.c_index].id;
      var that = this;
      wx.navigateTo({
        url: '../product/addProduct?cz=1&navigationBarTitle=' + that.data.currentLanguage.product_add + "&shopID=" + this.data.shopID + "&productId= " + productid 
      })
    }

  }
})