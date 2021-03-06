var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var getCurrentLanguage = require('../../lan/currentLanguage')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    no: "",
    storeID: 0,
    shopID: 0,
    currentLanguage: {},
    id:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var cz = options.cz
    var params = {
      storeID: options.storeID || 0,
      shopID: options.shopID || 0,
      currentLanguage: getCurrentLanguage()
    }
    if (cz == 1){
      params.id = options.id; 
      params.no = options.no;
    }
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || "条码库存管理"
    })
    
    this.setData(params);
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

  bindChangeNo: function (e) {
    this.setData({
      "no": e.detail.value
    })
  },


  //提交表单
  submitForm: function () {
    var that = this;
    //校验数据完整
    if (!this.data.no || !this.data.storeID) {
      util.showModel(that.data.currentLanguage.hint, that.data.currentLanguage.missing_data);
      return;
    }
    var parmas;
    var url;
    var content;
    if(that.data.id !=""){
      parmas={
        id: that.data.id,
        no: that.data.no,
      }
      url = config.service.updatePositionNo
      content = that.data.currentLanguage.position_modify_success
    }else{
      parmas = {
        no: that.data.no,
        storeID: that.data.storeID,
        shopID: that.data.shopID
      };
      url = config.service.addPosition
      content = that.data.currentLanguage.position_add_success
    }




    util.showBusy(that.data.currentLanguage.submiting)
    
    var options = {
      url: url,
      login: true,
      data: parmas, 
      
      success(result) {

        console.log('添加仓位成功', result);
        wx.navigateTo({
          url: '../msg/success?title=' + that.data.currentLanguage.system_prompt + '&content=' + content + '&btn=' + that.data.currentLanguage.click_return
        })



      },
      fail(error) {
        util.showModel(that.data.currentLanguage.submit_fail, error);
        console.log('添加仓位失败', error);
      }
    }
    qcloud.request(options)

  },

})