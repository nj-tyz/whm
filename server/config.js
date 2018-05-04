const CONF = {
  port: '5757',
  rootPathname: '',

  // 微信小程序 App ID
  appId: 'wx84e6213d09ab269a',

  // 微信小程序 App Secret
  appSecret: '99974bfecac4501a059e18b28ab6f622',

  // 是否使用腾讯云代理登录小程序
  useQcloudLogin: true,

  /**
   * MySQL 配置，用来存储 session 和用户信息
   * 若使用了腾讯云微信小程序解决方案
   * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
   */
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    db: 'cAuth', 
    pass: 'Ttyyzz123',
    char: 'utf8mb4'
  },

  cos: {
    /**
     * 地区简称
     * @查看 https://cloud.tencent.com/document/product/436/6224
     */ 

    //图片服务器-开发
     //region: 'ap-guangzhou',
     //fileBucket: 'test',


    //图片服务器-线上
    region: 'na-toronto',
    fileBucket: 'whm-1255998511',


    // 文件夹
    uploadFolder: ''
  },

  // 微信登录态有效期
  wxLoginExpires: 7200,
  wxMessageToken: 'abcdefgh',

  // 其他配置 ...
  serverHost: 'https://whm.wenshanshan.cn',
  tunnelServerUrl: 'https://tunnel.ws.qcloud.la',
  tunnelSignatureKey: '27fb7d1c161b7ca52d73cce0f1d833f9f5b5ec89',
  // 腾讯云相关配置可以查看云 API 秘钥控制台：https://console.qcloud.com/capi
  qcloudAppId: '1255998511',
  qcloudSecretId: 'AKIDnOjncAaUGuLYXIbFON9h2A4lFVZNLBCx',
  qcloudSecretKey: 'dz6wZv1rRlofIhspZ5NSJ4e1AC3h8QWP',
  wxMessageToken: 'weixinmsgtoken',
  networkTimeout: 30000
}

module.exports = CONF
