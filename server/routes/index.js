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
router.get('/user', validationMiddleware, controllers.user)

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

// --- 产品接口 --- //
router.get('/product/list', controllers.product.list)
router.get('/product/getByBarCode', validationMiddleware,controllers.product.getByBarCode)
router.get('/product/add', validationMiddleware,controllers.product.add)
router.get('/product/search', controllers.product.search)

// --- 仓库接口 --- //
router.get('/store/getListByShop', controllers.store.getListByShop)
router.get('/store/getone', controllers.store.getone)
router.get('/store/add', validationMiddleware,controllers.store.add)
router.get('/store/getById', controllers.store.getById)

// --- 仓位接口 --- //
router.get('/position/list', controllers.position.list)
router.get('/position/add', validationMiddleware,controllers.position.add)
router.get('/position/find', controllers.position.find)

// --- 库存接口 --- //
router.get('/inventory/getBySidAndPid', controllers.inventory.getBySidAndPid)
router.get('/inventory/list', controllers.inventory.list)
router.get('/inventory/optionInventory', validationMiddleware,controllers.inventory.optionInventory)

// --- 公司接口 --- //
router.get('/company/getByName', controllers.company.getByName)
router.get('/company/join', validationMiddleware, controllers.company.join)



module.exports = router
