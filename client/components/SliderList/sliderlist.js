// components/Dialog/dialog.js
Component({
  
  
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    // 弹窗标题
    datalist: {            // 属性名
      type: Array,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
    },
    height:{
      type: Number,
    },
    buttons:{
      type:Array
    }
  },
  
  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    // 弹窗显示控制
    //msgList:[],
    //height:60000,
    scrollY:true,
    swipeCheckX: 35,
    swipeCheckState: 0,
    maxMoveLeft: 185,
    correctMoveLeft: 175,
    thresholdMoveLeft: 75,
    lastShowMsgId: '',
    lastShowMsgIndex: '',
    moveX: 0,
    showState: 0,
    touchStartState: 0,
    swipeDirection: 0, 
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    /*
     * 公有方法
     */
    
    ontouchstart: function (e) {
      console.log(this);
      var that = this;
      if (that.data.showState === 1) {
        that.setData({
          touchStartState:1,
          showState : 0,
          moveX:0,
          
        })
        that.translateXMsgItem(that.data.lastShowMsgId, 0, 200);
        that.setData({
          lastShowMsgId: "",
          lastShowMsgIndex:"",
        })
        // this.data.lastShowMsgId = "";
        return;
      }
      var index = this.getItemIndex(e.currentTarget.id);
      that.setData({
        firstTouchX: e.touches[0].clientX,
        firstTouchY: e.touches[0].clientY,
        lastShowMsgId:e.currentTarget.id,
        lastShowMsgIndex: index
      })
      //this.data.firstTouchX = e.touches[0].clientX;
      //this.data.firstTouchY = e.touches[0].clientY;
      if (that.data.firstTouchX > that.data.swipeCheckX) {
        that.setData({
          swipeCheckState: 1
        })
      }
      that.setData({
        lastMoveTime : e.timeStamp
      })
      //this.data.lastMoveTime = e.timeStamp;
    },

    ontouchmove: function (e) {
      
      if (this.data.swipeCheckState === 0) {
        return;
      }
      //当开始触摸时有菜单显示时，不处理滑动操作
      if (this.data.touchStartState === 1) {
        return;
      }
      var moveX = e.touches[0].clientX - this.data.firstTouchX;
      var moveY = e.touches[0].clientY - this.data.firstTouchY;
      //已触发垂直滑动，由scroll-view处理滑动操作
      if (this.data.swipeDirection === 2) {
        return;
      }
      //未触发滑动方向
      if (this.data.swipeDirection === 0) {
        console.log(Math.abs(moveY));
        //触发垂直操作
        if (Math.abs(moveY) > 4) {
          this.data.swipeDirection = 2;

          return;
        }
        //触发水平操作
        if (Math.abs(moveX) > 4) {
         // this.swipeDirection = 1;
          this.setData({ 
            swipeDirection:1,
            scrollY: false
          });
        }
        else {
          return;
        }

      }
      //禁用垂直滚动
      // if (this.data.scrollY) {
      //   this.setData({scrollY:false});
      // }

      this.setData({
        lastMoveTime: e.timeStamp,
        
      });
      
      //处理边界情况
      if (moveX > 0) {
        moveX = 0;
      }
      //检测最大左滑距离
      if (moveX < -this.data.maxMoveLeft) {
        moveX = -this.data.maxMoveLeft;
      }
      this.setData({
        moveX: moveX,

      });
      this.translateXMsgItem2(e.currentTarget.id, moveX, 0);
    },
    ontouchend: function (e) {
      console.log("ontouchend");
      var that = this;
      this.setData({
        swipeCheckState: 0,

      });
      
      var swipeDirection = this.data.swipeDirection;
      this.setData({
        swipeDirection: 0,
      });
      
      if (this.data.touchStartState === 1) {
       
        this.setData({ scrollY: true, touchStartState:0 });
        return;
      }
      //垂直滚动，忽略
      if (swipeDirection !== 1) {
        return;
      }
      if (this.data.moveX === 0) {
        this.showState = 0;
        this.setData({ showState: 0});
        //不显示菜单状态下,激活垂直滚动
        this.setData({ scrollY: true });
        return;
      }
      if (this.data.moveX === this.data.correctMoveLeft) {
        var index = this.getItemIndex(e.currentTarget.id);
        this.setData({ showState: 1, lastShowMsgId: e.currentTarget.id, lastShowMsgIndex:index});
        
        return;
      }
      if (this.data.moveX < -this.data.thresholdMoveLeft) {
        var index = this.getItemIndex(e.currentTarget.id);
        this.setData({ moveX: -that.data.correctMoveLeft, showState: 1, lastShowMsgId: e.currentTarget.id, lastShowMsgIndex: index});
        
      }
      else {
        this.setData({ 
          moveX:0,
          showState:0
        })
        
        //不显示菜单,激活垂直滚动
        this.setData({ scrollY: true });
      }
      this.translateXMsgItem(e.currentTarget.id, this.data.moveX, 500);
      //this.translateXMsgItem(e.currentTarget.id, 0, 0);
    },
    onDeleteMsgTap: function (e) {
      this.deleteMsgItem(e);
    },
    onDeleteMsgLongtap: function (e) {
      console.log(e);
    },
    onMarkMsgTap: function (e) {
      console.log(e);
    },
    onMarkMsgLongtap: function (e) {
      console.log(e);
    },
    getItemIndex: function (id) {
      console.log(id);
      var datalist = this.data.datalist;
      for (var i = 0; i < datalist.length; i++) {
        if (datalist[i].id === id) {
          return i;
        }
      }
      return -1;
    },
    deleteMsgItem: function (e) {
     
    },
    translateXMsgItem: function (id, x, duration) {
      var animation = wx.createAnimation({ duration: duration });
      animation.translateX(x).step();
      this.animationMsgItem(id, animation);
    },
    translateXMsgItem2: function (id, x, duration) {
      var animation = wx.createAnimation({ duration: duration });
      animation.translateX(x).step();
      var param = {};
      var index = this.data.lastShowMsgIndex
      var indexString = 'datalist[' + index + '].animation';
      param[indexString] = animation.export();
      this.setData(param);
    },
    animationMsgItem: function (id, animation) {
      var index = this.getItemIndex(id);
      var param = {};
      var indexString = 'datalist[' + index + '].animation';
      param[indexString] = animation.export();
      this.setData(param);
    },
    animationMsgWrapItem: function (id, animation) {
      var index = this.getItemIndex(id);
      var param = {};
      var indexString = 'datalist[' + index + '].wrapAnimation';
      param[indexString] = animation.export();
      this.setData(param);
    },
    onScroll:function(){

    },
    testf:function(){
      console.log(this.data.buttons);
      console.log(this.data.dataList);
      
    },
    _clicklEvent:function(e){
      console.log(e);
      var index = e.currentTarget.dataset.index;
      var myEventDetail = { index: index} // 
      this.triggerEvent('clicklEvent', myEventDetail)
    }
  }
})
