var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var currentLanguage = require('../../lan/currentLanguage')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    no: "",
    img: "",
    id:"",
    address: "",
    cAddressLength: 0,
    shop: 0,
    currentLanguage: {},
    cz:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var cz = options.cz;

    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || "条码库存管理"
    })
    if(cz == '1'){
      this.setData({
        id: options.storeID,
        cz:cz
      });
      this.loadData();
    }

    this.setData({
      shop: options.shopID || 0,
      currentLanguage: currentLanguage()
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
        util.showBusy(that.data.currentLanguage.uploading)
        var filePath = res.tempFilePaths[0]

        // 上传图片
        wx.uploadFile({
          url: config.service.uploadUrl,
          filePath: filePath,
          name: 'file',

          success: function (res) {
            util.showSuccess(that.data.currentLanguage.success)
            console.log(res)
            res = JSON.parse(res.data)

            console.log(res)
            that.setData({
              img: res.data.imgUrl
            })
          },

          fail: function (e) {
            util.showModel(that.data.currentLanguage.fail)
          }
        })

      },
      fail: function (e) {
        console.error(e)
      }

    })
  },
  bindChangeNo: function (e) {
    this.setData({
      "no": e.detail.value
    })
  },
  bindChangeName: function (e) {
    this.setData({
      "name": e.detail.value
    })
  },
  bindChangeAddress: function (e) {
    this.setData({
      cAddressLength: e.detail.value.length,
      "address": e.detail.value
    })
  },
  //提交表单
  submitForm: function () {
    var that = this;
    var url ;
    var content;
    var params = { 
      name: that.data.name,
      no: that.data.no,
      img: that.data.img,
      address: that.data.address,
      shop: that.data.shop
    }
    //校验数据完整
    if (!this.data.no || !this.data.name || !this.data.address || !this.data.img) {
      util.showModel(that.data.currentLanguage.hint, that.data.currentLanguage.missing_data);
      return;
    }

    if(that.data.cz == '1'){
      url = config.service.updateStoreInfo
      content = that.data.currentLanguage.store_modify_success
      params.id = that.data.id
    }else{
      content = that.data.currentLanguage.store_add_success
      url = config.service.addStore
    }

    //提交
    util.showBusy(that.data.currentLanguage.submiting)

    var options = {
      url: url,
      login: true,
      data: params,
      success(result) {

        console.log('添加仓库成功', result);
        wx.navigateTo({
          url: '../msg/success?title=' + that.data.currentLanguage.system_prompt + '&content=' + content + '&btn=' + that.data.currentLanguage.click_return
        })



      },
      fail(error) {
        util.showModel(that.data.currentLanguage.submit_fail, error);
        console.log('添加仓库失败', error);
      }
    }
    qcloud.request(options)

  },
  loadData:function(){
    var that = this;
    var options = {
      url: config.service.getStoreById,
      login: true,
      data: {
        id:that.data.id
      },
      success(result) {
        console.log(result.data);
        that.setData({
          name: result.data.data.name,
          no: result.data.data.no,
          img: result.data.data.img,
          address: result.data.data.address,
          shop: result.data.data.shop,
        })
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.submit_fail, error);
        console.log('添加仓库失败', error);
      }
    }
    qcloud.request(options)    

  }
})