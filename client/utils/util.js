const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 显示繁忙提示
var showBusy = text => wx.showLoading({
  title: text,
  mask: true
})
// 显示繁忙提示
var hideBusy = text => wx.hideLoading();

// 显示成功提示
var showSuccess = text => {
  wx.hideToast();
  wx.hideLoading()
  wx.showToast({
    title: text,
    icon: 'success'
  })
}

// 显示失败提示
var showModel = (title, content, success) => {
  wx.hideToast();
  wx.hideLoading()
  wx.showModal({
    title,
    content: JSON.stringify(content),
    showCancel: false,
    success: success
  })
}

var showLoadding = (refresh) => {
  wx.showNavigationBarLoading() //在标题栏中显示加载
  //先在页面实现refresh方法
  refresh();
}

var hideLoadding = (title, content) => {
  wx.hideNavigationBarLoading() //完成停止加载
  wx.stopPullDownRefresh() //停止下拉刷新
}

var trim = (str) => {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

module.exports = { formatTime, showBusy, hideBusy, showSuccess, showModel, showLoadding, hideLoadding, trim }

