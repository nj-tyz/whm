var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    img: "",
    barcode: "",
    price:0,
    shopID:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || "条码库存管理"
    })
    this.setData({
      shopID: options.shopID || 0
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
  // 上传图片接口
  doUpload: function () {
    var that = this

    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        util.showBusy('正在上传')
        var filePath = res.tempFilePaths[0]

        // 上传图片
        wx.uploadFile({
          url: config.service.uploadUrl,
          filePath: filePath,
          name: 'file',

          success: function (res) {
            util.showSuccess('上传图片成功')
            //console.log(res)
            res = JSON.parse(res.data)

            console.log(res)
            that.setData({
              img: res.data.imgUrl
            })
          },

          fail: function (e) {
            util.showModel('上传图片失败')
          }
        })

      },
      fail: function (e) {
        console.error(e)
      }

    })
  },
 
  bindChangeName: function (e) {
    this.setData({
      "name": e.detail.value
    })
  },

  bindChangePrice: function (e) {
    this.setData({
      "price": e.detail.value
    })
  },
 
  //提交表单
  submitForm: function () {
    var that = this;

    //校验数据完整
    if (!this.data.name || !this.data.barcode || !this.data.img) {
      //util.showModel('提示', '数据不完整!');
      //return;
    }



    //提交
    util.showBusy('正在提交')

    var options = {
      url: config.service.addProduct,
      login: true,
      data: {
        name: that.data.name,
        barcode: that.data.barcode,
        img: that.data.img,
        price:that.data.price,
        shopID: that.data.shopID
      },
      success(result) {

        console.log('添加商品成功', result);
        wx.navigateTo({
          url: '../msg/success?title=系统提示&content=添加商品成功&bt点击返回'
        })



      },
      fail(error) {
        util.showModel('提交失败', error);
        console.log('添加商品失败', error);
      }
    }
    qcloud.request(options)

  },
 
  //扫描产品条码
  scanProduct: function () {
    var that = this;
    wx.scanCode({
      success: (res) => {
        var barCode = res.result;

        if (!barCode || barCode == "") {
          util.showModel('提示', '条码错误!');
          return;
        }

        console.log('商品扫码结果', barCode)
        that.setData({
          barcode: barCode
        })
      }
    })
  },
})