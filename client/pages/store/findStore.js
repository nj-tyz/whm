var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var Charts = require('../../lib/wxcharts.js');
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var inventorySum = 0;
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    correlationData: [],
    currentPosition: {},
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
    }
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
          sliderLeft: (res.windowWidth / 2 - sliderWidth) / 2,
          sliderOffset: res.windowWidth / 2 * that.data.activeIndex
        });
      }
    });

    console.log(options);

    //传入有商铺id,按照商铺查
    if (options.shopId) {
      var event = {
        currentTarget: {
          dataset: {
            shopId: options.shopId,
            chartType: 0
          }
        }
      }
      //调用显示
      that.show(event);
    }
    //传入有仓库id,按照仓库查
    if (options.storeId) {
      var event = {
        currentTarget: {
          dataset: {
            storeId: options.storeId,
            chartType:1
          }
        }
      }
      //调用显示
      that.show(event);
    }
    //传入有仓库id,按照仓库查
    if (options.positionId) {
      var event = {
        currentTarget: {
          dataset: {
            positionid: options.positionId,
            chartType: 2
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
        var positionId = 0;
        var codeType = "";
        try {
          codeType = res.result.split(":")[0];
          positionId = res.result.split(":")[1];
        } catch (e) {
          console.error(e);
          positionId = 0;
        }

        if (!codeType || codeType != 'positionID' || !positionId || positionId == 0) {
          util.showModel(this.data.currentLanguage.hint, this.data.currentLanguage.qrcode_error);
          return;
        }


        var event = {
          currentTarget: {
            dataset: {
              positionid: positionId
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
      url: config.service.findPosition,
      login: true,
      data: that.data,
      success(result) {
        console.log('搜索仓位成功', result)
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

  //显示具体仓位
  show: function (event) {
    var that = this

    var positionId = event.currentTarget.dataset.positionid;
    var storeId = event.currentTarget.dataset.storeId;
    var shopId = event.currentTarget.dataset.shopId;

    that.setData({
      correlationData: [],
      currentPosition: {},
    })

    that.hideInput();

    
    
    util.showBusy(this.data.currentLanguage.loading)
    var options = {
      url: config.service.findPosition,
      login: true,
      data: {
        positionId: positionId
      },
      success(result) {
        console.log('获取成功', result.data)
        if (result && result.data && result.data.data) {
          util.showSuccess(that.data.currentLanguage.success)

          console.log("获取数据", result.data.data[0]);
          that.setData({
            currentPosition: result.data.data[0]
          })
        } else {
          util.showModel(this.data.currentLanguage.hint, this.data.currentLanguage.failed_query);
        }
      },
      fail(error) {
        util.showModel(this.data.currentLanguage.fail, error);
        console.log('获取失败', error);
      }
    }
    qcloud.request(options)
  }
});