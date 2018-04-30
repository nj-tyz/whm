var en = require("lan_en");
var zh = require("lan_zh");

var config = require("../config");
var lan = {};
var language = ""

var getCurrentLanguage = function (){
  try {
    var value = wx.getStorageSync('currentLanguage')
    if (value == "English") {
        return en
    } else if ((value == "中文")){
        return zh
    }else{
        return en
    }
  } catch (e) {
    return  en 
  }
}

module.exports = getCurrentLanguage;