var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopID: 0,
    currentShop: {},
    optionType: 'out',
    currentStore: {},
    currentProduct: {},
    currentInventory: {},
    optionCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || "条码库存管理"
    })
    console.log(options.shopID);
    this.setData({
      shopID: options.shopID
    });
  
  },

  radioChange: function (e) {
    this.setData({
      "optionType": e.detail.value
    })
    //console.log(e.detail.value)
  },

  


  init: function () {
    this.setData({
      //currentStore: {},
      currentProduct: {},
      currentInventory: {},
      optionCount: 0
    });
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


  scanStore: function () {
    wx.scanCode({
      success: (res) => {
        var id = 0;
        var codeType = "";
        try {
          codeType = res.result.split(":")[0];
          id = res.result.split(":")[1];
        } catch (e) {
          console.error(e);
          id = 0;
        }

        if (!codeType || codeType != 'positionID' || !id || id == 0) {
          util.showModel('提示', '二维码错误!');
          return;
        }

        console.log('仓库扫码得到id', id)


        //通过id获取仓库
        util.showBusy('正在获取仓库数据')
        var that = this
        var options = {
          url: config.service.getStore,
          login: true,
          data: {
            id: id
          },
          success(result) {
            util.showSuccess('获取成功')
            console.log('仓库获取成功', result.data.data)
            if (result.data.data.shop != that.data.shopID) {
              util.showModel('提示', '该仓库不在本店铺,请切换店铺!');
              return;
            } else {
              that.setData({
                currentStore: result.data.data
              })
              //查询本仓本品库存
              that.getInventory();
            }
          },
          fail(error) {
            util.showModel('获取失败', error);
            console.log('仓库获取失败', error);
          }
        }
        qcloud.request(options)
      }
    })
  },

  //扫描产品条码
  scanProduct: function () {
    wx.scanCode({
      success: (res) => {
        var barCode = res.result;

        if (!barCode || barCode == "") {
          util.showModel('提示', '条码错误!');
          return;
        }

        console.log('商品扫码结果', res)


        //通过id获取商品
        util.showBusy('正在获取商品数据')
        var that = this
        var options = {
          url: config.service.getProductByBarCode,
          login: true,
          data: {
            barCode: barCode
          },
          success(result) {
            if (result && result.data && result.data.data && result.data.data.id) {
              util.showSuccess('获取成功')
              console.log('产品获取成功', result.data.data)
              that.setData({
                currentProduct: result.data.data
              })

              //查询本仓本品库存
              that.getInventory();
            } else {
              util.showModel('提示', "扫描商品失败");
            }
          },
          fail(error) {
            util.showModel('获取失败', error);
            console.log('产品获取失败', error);
          }
        }
        qcloud.request(options)
      }
    })
  },

  //查询本仓本品库存
  getInventory: function () {
    var that = this
    //有仓库,有产品且均有id再去查询
    if (!that.data.currentStore || !that.data.currentStore.id || !that.data.currentProduct || !that.data.currentProduct.id) {
      return;
    }

    util.showBusy('正在获取商品库存')

    var options = {
      url: config.service.getInventoryBySidAndPid,
      login: true,
      data: {
        positionId: that.data.currentStore.positionId,
        productId: that.data.currentProduct.id
      },
      success(result) {
        util.showSuccess('获取成功')
        console.log('产品库存获取成功', result.data.data)
        that.setData({
          currentInventory: result.data.data
        })
      },
      fail(error) {
        util.showModel('获取失败', error);
        console.log('产品库存获取失败', error);
      }
    }
    qcloud.request(options)
  },
  bingOptionCount: function (e) {
    this.setData({
      "optionCount": e.detail.value
    })
  },
  //提交表单
  submitForm: function () {
    var that = this;
    console.log(this.data)
    //校验数据完整
    if (this.data.optionCount == 0 || !this.data.currentStore.id || !this.data.currentProduct.id) {
      util.showModel('提示', '数据不完整!');
      return;
    }

    //校验出库数量是否大于库存数量
    if (this.data.optionType == "out") {
      //出库判断库存
      var maxCount = this.data.currentInventory.count;
      if (this.data.optionCount > maxCount) {
        util.showModel('提示', '出库数量不能大于库存数量!');
        return;
      }
    }


    //提交
    util.showBusy('正在提交')

    var options = {
      url: config.service.optionInventory,
      login: true,
      data: {
        shopId: that.data.shopID,
        storeId: that.data.currentStore.id,
        positionId: that.data.currentStore.positionId,
        productId: that.data.currentProduct.id,
        optionType: that.data.optionType,
        optionCount: that.data.optionCount
      },
      success(result) {
        util.showSuccess('提交成功');
        console.log('更新库存提交成功', result);
        //提交成功后初始化数据
        that.init()
      },
      fail(error) {
        util.showModel('提交失败', error);
        console.log('更新库存提交失败', error);
      }
    }
    qcloud.request(options)

  },
 
})