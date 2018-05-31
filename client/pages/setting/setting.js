var currentLanguage = require('../../lan/currentLanguage')
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var sliderWidth = 64; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    c_user:{},
    tabs: ["个人", "公司", "店铺","岗位"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    c_openId:"",
    pageHeight: 0,
    inputShowed: false,
    inputVal: "",
    userList:[],
    checkboxItems: [

    ],
    positioncheckboxItems:[],
    positionBoxItems:[
      { name: "a", id: 1 },
      { name: "b", id: 2 },
      { name: "c", id: 3 },
    ],
    defaultPositionBoxItems: [
      { name: "a", id: 1 },
      { name: "b", id: 2 },
      { name: "c", id: 3 },
    ],
    companyName:"",
    companyId:"",
    currentLanguage:{},
    username:"",
    userimg:"",
    hiddenmodalput:true,
    addRoleName:"",
    roleList:[],
    roleList2: [],
    c_roleOpenId:'',
    c_menuRoleId:''
   
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.navigationBarTitle || that.data.currentLanguage.position_navigation_bar_title
    })
    var that = this;
    var cl = currentLanguage();
    this.setData({
      currentLanguage: cl,
      tabs: cl.setting_tabs,
      companyName:options.companyName||"",
      c_openId: options.openId,
      companyId: options.companyId,
      username: options.username,
      userimg: options.img
    })
    //console.log(options.companyName);  
    this.companyUsers();
    this.companyShopList();
    this.loadRoles();

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
          pageHeight: res.windowHeight - 50,
          pageWidth: res.windowWidth
        });
      }
    });
    



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
  
  companyUsers:function(){
    var that = this;
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.companyUsers,
      login: true,
      data: {},
      success(result) {
        
        var i = 0;
        var userList = result.data.data 
        for (; i < userList.length;i++){
          
          userList[i].user_info = JSON.parse(userList[i].user_info);
          userList[i].user_info.username = userList[i].username;
          userList[i].user_info.image = userList[i].image;
        }
        that.setData({
          userList: userList
        })

        util.showSuccess(that.data.currentLanguage.success)
        
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)
  },
  auditUser: function (event){
    var that = this;
    var openId = event.currentTarget.dataset.useropenid; 
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.auditUser,
      login: true,
      data: {
        openId:openId
      },
      success(result) {
        //重新加载数据
        that.companyUsers();

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)

  },
  removeUser: function (event){
    var that = this;
    var openId = event.currentTarget.dataset.useropenid;
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.removeUser,
      login: true,
      data: {
        openId: openId
      },
      success(result) {
        //重新加载数据
        that.companyUsers();

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)

  },
  companyShopList: function () {
    var that = this;
    
    util.showBusy(that.data.currentLanguage.loading);
    var options = {
      url: config.service.companyShopList,
      login: true,
      data: {
      
      },
      success(result) {
        //重新加载数据
        that.setData({
          shopList: result.data.data
        })
     //   console.log(that.data.shopList);
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)

  },
  openQr:function(){
    var that = this;
    wx.navigateTo({
      url: '../qrcode/show?companyId=' + that.data.companyId + "&qrcodeType=company&companyName=" + that.data.companyName 
    })
  },
  //修改用户名
  modifyUsername:function(){
    var that = this;
    console.log(1111);
    wx.navigateTo({
      url: './modifyUsername?username=' + that.data.username + "&openId=" + that.data.c_openId
    })
  },
  loadRoles:function(){
    var that = this;
    var options = {
      url: config.service.roleList,
      login: true,
      data: {
        
      },
      success(result) {
        console.log(result);
        
        that.setData({
          roleList : result.data.data,
          roleList2: result.data.data,
          checkboxItems: result.data.data
        })
        //   console.log(that.data.shopList);
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)
    
  },


  addRole:function(){
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput
    })  
  },
  cancelRole: function () {
    this.setData({
      hiddenmodalput: true
    });
  },
  //确认  
  confirmRole: function (e) {
    console.log(e);
    var that = this;
    var rolename = this.data.addRoleName;
    console.log(rolename);
    var options = {
      url: config.service.addRole,
      login: true,
      data: {
        rolename: rolename
      },
      success(result) {
        //重新加载数据
        
        that.loadRoles();
        var roleid = result.data.data.insertId;
     
        wx.showModal({
          title: that.data.currentLanguage.tip,
          content: that.data.currentLanguage.setting_success_info,
          confirmText: that.data.currentLanguage.confirm,
          cancelText: that.data.currentLanguage.cancel,
          success: function (res) {
            console.log(res);
            if (res.confirm) {
              wx.navigateTo({
                url: './settingRoleMenu?roleid=' + roleid+"&rolename="+rolename 
              })
            } else {
              wx.showModal({
                content: that.data.currentLanguage.setting_tip2,
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    
                  }
                }
              });
            }
          }
        });
        
        //util.showSuccess(that.data.currentLanguage.success)
        
        //   console.log(that.data.shopList);
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)
    
    
    this.setData({
      hiddenmodalput: true
    })


  } , 
  setRoleName:function(e){
    this.setData({
      addRoleName: e.detail.value
    })

  },
  fillCkeckBox:function(e){
    var that = this;
    //存储当前修改用户的id
    var openId = e.currentTarget.dataset.useropenid;
    that.setData({
      c_roleOpenId: openId
    })
    var options = {
      url: config.service.findRoleByOpenid,
      login: true,
      data: {
        openId: openId
      },
      success(result) {
        
        //that.loadRoles();
        var userRoleList = result.data.data;
        var roleList1 = that.data.roleList;
        
        //存储当前用户拥有的角色的id
        var userRoleIdList = [];
        for (var z = 0; z < userRoleList.length; z++) {
          userRoleIdList.push(userRoleList[z].role);
        }
        that.setData({
          userRoleIdList: userRoleIdList
        })

        var ckeckboxItems = [];
        if (userRoleList.length > 0){
          //循环角色数组 和 当前选择用户拥有角色数组  初始化 checkbox
          for (var i = 0; i < roleList1.length; i++) {
            for (var j = 0; j < userRoleList.length; j++) {
              var item = roleList1[i];
              if (roleList1[i].id == userRoleList[j].role) {
                roleList1[i].checked=true;
              } 
            }
          }
          ckeckboxItems = roleList1;
        }else{
          if (roleList1.length>0){
            ckeckboxItems = roleList1;
          }
        }
        that.setData({
          checkboxItems: ckeckboxItems,
          roleList: that.data.roleList2
        })
       
        console.log(that.data.roleList);
        console.log(that.data.roleList2);
        util.showSuccess(that.data.currentLanguage.success)
        //   console.log(that.data.shopList);
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)
    
  },
  changeRole:function(e){
    var that = this;
    //当前下标 获取当前操作的role对象
    var index = e.currentTarget.dataset.index;
    var thisCheckbox = this.data.checkboxItems;
    var c_role = thisCheckbox[index];
   //设置对应的删除或增加 falg 
    var flag = c_role.checked == true ? 2 : 1;
    var changedStatus = c_role.checked ==true ? false : true;
    console.log(flag + "__________" + changedStatus);
    thisCheckbox[index].checked = changedStatus;
    
    util.showBusy(that.data.currentLanguage.loading);
    console.log()
    var options = {
      url: config.service.updateUserRole,
      login: true,
      data: {
        flag: flag,
        openId: that.data.c_roleOpenId,
        roleId: c_role.id
      },
      success(result) {
        //修改页面
        that.setData({
          checkboxItems: thisCheckbox,
        });
        util.showSuccess(that.data.currentLanguage.success)

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)
    
  },
  fillPosition:function(e){
    var that = this;
//    console.log(that.data.positionBoxItems);
    var roleId = e.currentTarget.dataset.roleid;
    //存储当前操作的roleid
    this.setData({
      c_menuRoleId: roleId
    })
    
    var options = {
      url: config.service.findRoleMenuByRole,
      login: true,
      data: {
        roleId: roleId,
      },
      success(result) {
        var roleMenuList = result.data.data;
        var positionList = that.data.positionBoxItems;

        //存储当前用户拥有的menu的id
        var menuIdList = [];
        for (var z = 0; z < roleMenuList.length; z++) {
          menuIdList.push(roleMenuList[z].menu);
        }
        that.setData({
          menuIdList: menuIdList
        })

        var ckeckboxItems = [];
        if (roleMenuList.length > 0) {
          for (var i = 0; i < positionList.length; i++) {
            for (var j = 0; j < roleMenuList.length; j++) {
              var item = positionList[i];
              if (positionList[i].id == roleMenuList[j].menu) {
                positionList[i].checked = true;
              }
            }
          }
          ckeckboxItems = positionList;
        } else{
          ckeckboxItems = positionList;
        }
        that.setData({
          positioncheckboxItems: ckeckboxItems,
          positionBoxItems: that.data.defaultPositionBoxItems
        })
        util.showSuccess(that.data.currentLanguage.success)
       //不知道为什么 修改完ckeckboxItems之后 positionBoxItems也会跟着变 所以这边初始化一下
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)

  },
  changePosition:function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var changedCheckbox = this.data.positioncheckboxItems;
    
    var c_menu = changedCheckbox[index];
    var flag = c_menu.checked == true ? 2 : 1;
    c_menu.checked = c_menu.checked == true ? false : true;
     
    util.showBusy(that.data.currentLanguage.loading);
  
    var options = {
      url: config.service.updateRoleMenu,
      login: true,
      data: {
        flag: flag,
        menuId: c_menu.id,
        roleId: that.data.c_menuRoleId
      },
      success(result) {
        //修改页面
        that.setData({
          positioncheckboxItems: changedCheckbox,
        });
        util.showSuccess(that.data.currentLanguage.success)

      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)

  },
  doUpload: function () {
    var that = this

    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        util.showBusy(that.data.currentLanguage.loading)
        var filePath = res.tempFilePaths[0]

        // 上传图片
        wx.uploadFile({
          url: config.service.uploadUrl,
          filePath: filePath,
          name: 'file',

          success: function (res) {
           
            res = JSON.parse(res.data)
            console.log(that.data.c_openId);
            that.updateUserImage(that.data.c_openId, res.data.imgUrl);
            


            
          },

          fail: function (e) {
            util.showModel(that.data.currentLanguage.img_upload_fail)
          }
        })

      },
      fail: function (e) {
        console.error(e)
      }

    })
  },
  updateUserImage:function(openid,img){
    console.log(openid);
    var that = this;
    var options = {
      url: config.service.modifyUserImage,
      login: true,
      data: {
        openId: openid,
        image:img
      },
      success(result) {
        //修改页面
        that.setData({
          userimg: img
        })
        util.showSuccess(that.data.currentLanguage.img_upload_success)
      },
      fail(error) {
        util.showModel(that.data.currentLanguage.request_fail, error);
      }
    }
    qcloud.request(options)
  },
  deleteCompany:function(){
    var that = this;
    wx.showModal({
      title: that.data.currentLanguage.warning,
      content: that.data.currentLanguage.quit_company_warn,
      confirmText: that.data.currentLanguage.delete_confirm,
      cancelText: that.data.currentLanguage.delete_cancel,
      success: function (res) {
        if (res.confirm) {
          var options = {
            url: config.service.deleteUserCompany,
            login: true,
            data: {},
            success(result) {
              util.showSuccess(that.data.currentLanguage.success)
              //app.globalData.needRefresh = true;
              wx.navigateBack({

                delta: 2
              })
            },
            fail(error) {
              util.showModel(that.data.currentLanguage.request_fail, error);
              console.log('request fail', error);

            }
          }
          qcloud.request(options);
        } else {
          console.log('用户点击辅助操作')
        }
      }
    });
  },
  setRoleUser:function(e){
    var roleid = e.currentTarget.dataset.id;
    var rolename = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: './settingRoleUser?roleid=' + roleid +"&rolename="+rolename 
    })
  },
  modRoleMenu:function(e){
    var roleid = e.currentTarget.dataset.id;
    var rolename = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: './settingRoleMenu?roleid=' + roleid + "&rolename=" + rolename 
    })
  }

});