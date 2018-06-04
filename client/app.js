//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config');

App({
    onLaunch: function () {
        qcloud.setLoginUrl(config.service.loginUrl);
    },
    globalData: {
      userInfo: null,
      refreshIndex:false,
      needRefresh: false,
      menu:[{
        name:"店铺管理",id:1
      }, {
        name: "仓库管理", id: 2
      },{
        name: "仓位管理", id: 3
      }, {
        name: "商品管理", id: 4
      },{
        name: "人员管理", id: 5
      }, {
        name: "岗位管理", id: 6
      },{
        name: "出入库", id: 7
      }, {
        name: "overstock", id: 8
      }, {
        name: "damage", id: 9
      }]
      
    }
})