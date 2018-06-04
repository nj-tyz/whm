/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
  prefix: '/weapp'
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
router.get('/user/userInfo', validationMiddleware, controllers.user.userInfo)
router.get('/user/modifyUsername',  controllers.user.modifyUsername)
router.get('/user/modifyUserImage', controllers.user.modifyUserImage)
router.get('/user/deleteUserCompany', validationMiddleware,controllers.user.deleteUserCompany)


// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中
router.post('/upload', controllers.upload)

// --- 信道服务接口 Demo --- //
// GET  用来响应请求信道地址的
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)


// --- 门店接口 --- //
router.get('/shop/list', validationMiddleware,controllers.shop.list)
router.get('/shop/getone', controllers.shop.getone)
router.get('/shop/add', validationMiddleware,controllers.shop.add)
router.get('/shop/findListByCurrentCompany', validationMiddleware, controllers.shop.findListByCurrentCompany)
router.get('/shop/shopUsers',  controllers.shop.shopUsers)
router.get('/shop/updateShopUser', validationMiddleware, controllers.shop.updateShopUser)
router.get('/shop/outShopUser', validationMiddleware, controllers.shop.outShopUser)
router.get('/shop/getShopInfo', controllers.shop.getShopInfo)
router.get('/shop/updateShopInfo', validationMiddleware, controllers.shop.updateShopInfo)
router.get('/shop/deleteShop', validationMiddleware, controllers.shop.deleteShop)

// --- 产品接口 --- //
router.get('/product/list', controllers.product.list)
router.get('/product/getByBarCode', validationMiddleware,controllers.product.getByBarCode)
router.get('/product/add', validationMiddleware,controllers.product.add)
router.get('/product/search', controllers.product.search)
router.get('/product/updateProduct', controllers.product.updateProduct)
router.get('/product/getById', controllers.product.getone)
router.get('/product/updateProductInfo', controllers.product.updateProductInfo)

// --- 仓库接口 --- //
router.get('/store/getListByShop', controllers.store.getListByShop)
router.get('/store/getone', controllers.store.getone)
router.get('/store/add', validationMiddleware,controllers.store.add)
router.get('/store/getById', controllers.store.getById)
router.get('/store/updateStoreInfo', validationMiddleware,controllers.store.updateStoreInfo)

// --- 仓位接口 --- //
router.get('/position/list', controllers.position.list)
router.get('/position/add', validationMiddleware,controllers.position.add)
router.get('/position/find',validationMiddleware, controllers.position.find)
router.get('/position/get',validationMiddleware, controllers.position.get)
router.get('/position/update', controllers.position.update)
router.get('/position/findAllByShop', validationMiddleware, controllers.position.findAllByShop)

// --- 库存接口 --- //
router.get('/inventory/getBySidAndPid', controllers.inventory.getBySidAndPid)
router.get('/inventory/list', controllers.inventory.list)
router.get('/inventory/optionInventory', validationMiddleware,controllers.inventory.optionInventory)
router.get('/inventory/deleteInventory', validationMiddleware, controllers.inventory.deleteInventory)
router.get('/inventory/listInventoryByPosition', controllers.inventory.listInventoryByPosition)

// --- 公司接口 --- //
router.get('/company/getByName', controllers.company.getByName)
router.get('/company/join', validationMiddleware, controllers.company.join)
router.get('/company/companyUsers', validationMiddleware, controllers.company.companyUsers)
router.get('/company/auditUser', validationMiddleware, controllers.company.auditUser)
router.get('/company/removeUser',validationMiddleware, controllers.company.removeUser)


// --- 角色接口 --- //
router.get('/role/addRole', validationMiddleware, controllers.role.add)
router.get('/role/roleList', validationMiddleware, controllers.role.list)
router.get('/role/findRoleByOpenid', validationMiddleware, controllers.role.findRoleByOpenid)
router.get('/role/updateUserRole', controllers.role.updateUserRole)
router.get('/role/findRoleMenuByRole', controllers.role.findRoleMenuByRole)
router.get('/role/updateRoleMenu', controllers.role.updateRoleMenu)

router.get('/role/findRoleUser', controllers.role.findRoleUser)
router.get('/role/outRoleUsers', validationMiddleware,controllers.role.outRoleUsers)

//--- 菜单接口 ---//
router.get('/menu/allMenus', validationMiddleware, controllers.menu.allMenus)

//--- overstock接口 ---//
router.get('/overstock/add', validationMiddleware, controllers.overstock.add)
router.get('/overstock/list', validationMiddleware, controllers.overstock.list)
router.get('/overstock/getById', controllers.overstock.getById)  
router.get('/overstock/addDetail', controllers.overstock.addDetail)  
router.get('/overstock/updateUseableAmt', controllers.overstock.updateUseableAmt)  
router.get('/overstock/updateDetailStatus', controllers.overstock.updateDetailStatus)  

//--- damage接口 ---//
router.get('/damage/add', validationMiddleware, controllers.damage.add) 
router.get('/damage/list', validationMiddleware, controllers.damage.list)  
router.get('/damage/updateStatus', controllers.damage.updateStatus)  
router.get('/damage/cancel', validationMiddleware,controllers.damage.cancel)  


module.exports = router
