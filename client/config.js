/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名

//tyzong正式服务
//var host ="https://whm.wenshanshan.cn";

//测试环境
//var host ="https://t0qyjxur.qcloud.la";

//刀豆电脑

//var host = 'https://a1c89d65.ngrok.io';
var host = 'https://25bf04e6.ngrok.io';


var config = {

  // 下面的地址配合云端 Demo 工作
  service: {
    host,

    // 登录地址，用于建立会话
    loginUrl: `${host}/weapp/login`,

    // 获取当前用户信息，用于测试会话
    getLoginUserUrl: `${host}/weapp/user/userInfo`,
    modifyUsername: `${host}/weapp/user/modifyUsername`,
    modifyUserImage: `${host}/weapp/user/modifyUserImage`,
    deleteUserCompany: `${host}/weapp/user/deleteUserCompany`,
    
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
    getShopInfo: `${host}/weapp/shop/getShopInfo`,
    updateShopInfo: `${host}/weapp/shop/updateShopInfo`,
    deleteShop: `${host}/weapp/shop/deleteShop`,

    // 产品接口
    productList: `${host}/weapp/product/list`,
    getProductByBarCode: `${host}/weapp/product/getByBarCode`,
    addProduct: `${host}/weapp/product/add`,
    searchProduct: `${host}/weapp/product/search`,
    updateProduct: `${host}/weapp/product/updateProduct`,
    getById: `${host}/weapp/product/getById`,
    updateProductInfo: `${host}/weapp/product/updateProductInfo`,
    

    // 仓库接口
    getStoreById: `${host}/weapp/store/getById`,
    getStore: `${host}/weapp/store/getone`,
    getStoreListByShop: `${host}/weapp/store/getListByShop`,
    addStore: `${host}/weapp/store/add`,
    findStore: `${host}/weapp/store/find`,
    updateStoreInfo: `${host}/weapp/store/updateStoreInfo`,

    //仓位接口
    positionList: `${host}/weapp/position/list`,
    addPosition: `${host}/weapp/position/add`,
    findPosition: `${host}/weapp/position/find`,
    getPosition: `${host}/weapp/position/get`,
    updatePositionNo: `${host}/weapp/position/update`,
    // 库存接口
    getInventoryBySidAndPid: `${host}/weapp/inventory/getBySidAndPid`,
    listInventory: `${host}/weapp/inventory/list`,
    optionInventory: `${host}/weapp/inventory/optionInventory`,
    deleteInventory: `${host}/weapp/inventory/deleteInventory`,
    listInventoryByPosition: `${host}/weapp/inventory/listInventoryByPosition`,
    //公司接口
    getCompanyByName: `${host}/weapp/company/getByName`,
    joinCompany: `${host}/weapp/company/join`,
    test: `${host}/weapp/company`,
    companyUsers: `${host}/weapp/company/companyUsers`, 
    auditUser: `${host}/weapp/company/auditUser`,
    removeUser: `${host}/weapp/company/removeUser`,

    //角色接口
    addRole: `${host}/weapp/role/addRole`,
    roleList: `${host}/weapp/role/roleList`,
    findRoleByOpenid: `${host}/weapp/role/findRoleByOpenid`,
    updateUserRole: `${host}/weapp/role/updateUserRole`,
    findRoleMenuByRole: `${host}/weapp/role/findRoleMenuByRole`,
    updateRoleMenu: `${host}/weapp/role/updateRoleMenu`,

    findRoleUser: `${host}/weapp/role/findRoleUser`,
    outRoleUsers: `${host}/weapp/role/outRoleUsers`,

    //菜单接口
    allMenus: `${host}/weapp/menu/allMenus`
  }
};

module.exports = config;
