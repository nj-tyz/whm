var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var Charts = require('../../lib/wxcharts.js');
var currentLanguage = require('../../lan/currentLanguage')
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var inventorySum = 0;
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    correlationData: [],
    currentProduct: {},
    //图标类型
    chartType: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    currentLanguage: {}
  },

  changeChartType: function (event) {
    var new_charttype = event.currentTarget.dataset.charttype;
    if (new_charttype != this.data.chartType) {
      this.setData({
        "chartType": new_charttype
      });

      this.setData({
        sliderOffset: event.currentTarget.offsetLeft,
        activeIndex: event.currentTarget.id
      });

      //重新渲染报表
      this.renderChart();
    }
  },
  

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imageWidth: wx.getSystemInfoSync().windowWidth * 0.9,
      imageHeight: wx.getSystemInfoSync().windowWidth * 1.2,
      currentLanguage: currentLanguage()
    })
    var that = this;
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || "条码库存管理"
    })

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / 3 - sliderWidth) / 2,
          sliderOffset: res.windowWidth / 3 * that.data.activeIndex
        });
      }
    });

    //传入查询参数,直接查询
    if (options.barcode) {
      var event = {
        currentTarget: {
          dataset: {
            barcode: options.barcode
          }
        }
      }
      //调用显示
      that.show(event);
    }
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

    //调用查询
    this.search();
  },
  scanCode: function () {
    var that = this;
    wx.scanCode({
      success: (res) => {
        var barCode = res.result;

        if (!barCode || barCode == "") {
          util.showModel(that.data.currentLanguage.hint, that.data.currentLanguage.qrcode_error);
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
        that.show(event);
      }
    })
  },

  //查询产品
  search: function () {
    var that = this;
    var options = {
      url: config.service.searchProduct,
      login: true,
      data: that.data,
      success(result) {
        console.log('搜索产品成功', result)
        that.setData({
          correlationData: result.data.data
        })

        console.log(that.data.correlationData.length);
        console.log(that.data.inputVal.length);
        console.log(that.data.inputVal.length > 0 && that.data.correlationData.lenght > 0);
      },
      fail(error) {
        console.log('request fail', error);
      }
    }
    qcloud.request(options)
  },

  //显示具体产品
  show: function (event) {

    var that = this
    that.setData({
      correlationData: [],
      currentProduct: {}
    })

    that.hideInput();

    var barcode = event.currentTarget.dataset.barcode;
    //通过barcode获取商品
    util.showBusy(that.data.currentLanguage.loading)
    var options = {
      url: config.service.getProductByBarCode,
      login: true,
      data: {
        barCode: barcode,
        inventoryInShop: true,
        inventoryInStore: true,
        inventoryInPosition: true,
      },
      success(result) {
        if (result && result.data && result.data.data && result.data.data.id) {
          util.showSuccess(that.data.currentLanguage.success)
          console.log('产品获取成功', result.data.data)
          that.setData({
            currentProduct: result.data.data
          })

          //渲染图标
          that.renderChart();
        } else {
          util.showModel(that.data.currentLanguage.hint, that.data.currentLanguage.failed_query);
        }
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.fail, error);
        console.log('产品获取失败', error);
      }
    }
    qcloud.request(options)
  },
  //渲染图标
  renderChart: function () {
    var that = this;


  
    //店铺库存分布
    var currentProductInventoryInShop = that.data.currentProduct.inventoryInShopResult;
    //仓库库存分布
    var currentProductInventoryInStore = that.data.currentProduct.inventoryInStoreResult;
    //仓位库存分布
    var currentProductInventoryInPosition = that.data.currentProduct.inventoryInPosition;

    var series = [];
    inventorySum = 0;
    if (that.data.chartType == "0") {
      //如果当前选中渲染货架库存
      //不需要渲染
      return;
    } else if (that.data.chartType == "1") {
      //如果当前选中渲染仓库库存
      for (var i = 0; i < currentProductInventoryInStore.length; i++) {
        series.push({
          name: currentProductInventoryInStore[i].storeName,
          data: currentProductInventoryInStore[i].inventoryCount,
          format: function (val, name) {
            return parseInt(val * inventorySum) ;
          }
        })
        inventorySum += currentProductInventoryInStore[i].inventoryCount;
      }
    } else if (that.data.chartType == "2") {
      //如果当前选中渲染货架库存
      for (var i = 0; i < currentProductInventoryInShop.length; i++) {
        series.push({
          name: currentProductInventoryInShop[i].shopName,
          data: currentProductInventoryInShop[i].inventoryCount,
          format: function (val, name) {
            return parseInt(val * inventorySum) ;
          }
        })
        inventorySum += currentProductInventoryInShop[i].inventoryCount;
      }
    }

    that.setData({
      series: series
    })


    if (series.length > 0) {
      new Charts({
        canvasId: 'mycanvas',
        type: 'pie',
        series: series,
        width: this.data.imageWidth,
        height: this.data.imageHeight,
        animation: true,
        dataLabel: true
      });
    }
  }
});