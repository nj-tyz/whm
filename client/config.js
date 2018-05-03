/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名


//测试环境
//var host = 'https://t0qyjxur.qcloud.la';

//tyzong正式服务
//var host ="https://whm.wenshanshan.cn";

//刀豆电脑
var host = 'https://a1c89d65.ngrok.io';



var config = {

  // 下面的地址配合云端 Demo 工作
  service: {
    host,

    // 登录地址，用于建立会话
    loginUrl: `${host}/weapp/login`,

    // 获取当前用户信息，用于测试会话
    getLoginUserUrl: `${host}/weapp/user`,


    // 上传图片接口
    uploadUrl: `${host}/weapp/upload`,

    // 门店接口
    shopList: `${host}/weapp/shop/list`,
    getShop: `${host}/weapp/shop/getone`,
    addShop: `${host}/weapp/shop/add`,
    companyShopList: `${host}/weapp/shop/findListByCurrentCompany`,
    shopUsers: `${host}/weapp/shop/shopUsers`,
    updateShopUser: `${host}/weapp/shop/updateShopUser`,
    outShopUser: `${host}/weapp/shop/outShopUser`,


    // 产品接口
    productList: `${host}/weapp/product/list`,
    getProductByBarCode: `${host}/weapp/product/getByBarCode`,
    addProduct: `${host}/weapp/product/add`,
    searchProduct: `${host}/weapp/product/search`,
    updateProduct: `${host}/weapp/product/updateProduct`,

    // 仓库接口
    getStoreById: `${host}/weapp/store/getById`,
    getStore: `${host}/weapp/store/getone`,
    getStoreListByShop: `${host}/weapp/store/getListByShop`,
    addStore: `${host}/weapp/store/add`,
    findStore: `${host}/weapp/store/find`,

    //仓位接口
    positionList: `${host}/weapp/position/list`,
    addPosition: `${host}/weapp/position/add`,
    findPosition: `${host}/weapp/position/find`,
    getPosition: `${host}/weapp/position/get`,

    // 库存接口
    getInventoryBySidAndPid: `${host}/weapp/inventory/getBySidAndPid`,
    listInventory: `${host}/weapp/inventory/list`,
    optionInventory: `${host}/weapp/inventory/optionInventory`,


    //公司接口
    getCompanyByName: `${host}/weapp/company/getByName`,
    joinCompany: `${host}/weapp/company/join`,
    test: `${host}/weapp/company`,
    companyUsers: `${host}/weapp/company/companyUsers`, 
    auditUser: `${host}/weapp/company/auditUser`,

  }
};

module.exports = config;
