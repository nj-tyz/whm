var currentLanguage = require('../../lan/currentLanguage')

var sliderWidth = 128; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["个人", "公司", "店铺","岗位"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    pageHeight: 0,
    inputShowed: false,
    inputVal: "",
    checkboxItems: [
      { name: '岗位a', value: '0', checked: true },
      { name: '岗位b', value: '1' },
      { name: '岗位c', value: '2' },
      { name: '岗位d', value: '3' }
    ]
  },
  onLoad: function () {
    var that = this;
    var cl = currentLanguage();
    this.setData({
      currentLanguage: cl,
      tabs: cl.setting_tabs
    })

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
          pageHeight: res.windowHeight - 50
        });
      }
    });
    console.log(this.data.pageHeight);
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
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
  },
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);

    var checkboxItems = this.data.checkboxItems, values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }

    this.setData({
      checkboxItems: checkboxItems
    });
  },
});