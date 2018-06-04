const { query } = require('../mysql')
const userutil = require('./userutil.js')
const inventory = require('./inventory.js')


async function list(ctx, next) {
  var userinfo = await userutil.get(ctx, next);
  var companyId = userinfo.company_id;
  var result = await query("select os.*, p.name AS productName ,p.img AS img from tb_overstock os left join tb_product p on p.id = os.product where os.company = ? ", [companyId]);
  ctx.state.data = result;
}

async function add(ctx, next) {
  var userinfo = await userutil.get(ctx, next);
  var companyId = userinfo.company_id;
  var shopId = ctx.query.shopId;
  var storeId = ctx.query.storeId;
  var positionId = ctx.query.positionId;
  var productId = ctx.query.productId;
  var total = ctx.query.total;

  var result = await query("insert into tb_overstock (company,shop,store,position,product,total,useable,status)values(?,?,?,?,?,?,?,?)", [companyId, shopId, storeId,positionId,productId,total,total,0]);
  
  //整理出库参数
  var inventoryParmas = {};
  inventoryParmas.shopId = shopId;
  inventoryParmas.storeId = storeId;
  inventoryParmas.positionId = positionId;
  inventoryParmas.productId = productId;
  inventoryParmas.optionCount = total;
  inventoryParmas.optionType = "out";
  ctx.query = inventoryParmas;
  
  await inventory.optionInventory(ctx, next);
  
  ctx.state.data = result;
}

async function getById(ctx, next) {
  var id = ctx.query.id;
  //准备接受overstock的店铺
  var inShopId = ctx.query.shopId;
  var result = await query("select * from tb_overstock where id = ?", [id]);
  //发布overstock的店铺
  var outShopId = result[0].shop;
  var result2;
  //若果是发布人进入分发页面 能看到所有店铺的订单
  if (inShopId == outShopId){
    result2 = await query("select osd.*,s.name AS shopName,s.img AS shopImg from tb_overstock_detail osd left join tb_shop s on osd.shop = s.id where  osid = ?", [id]);
  } else{
    result2 = await query("select osd.*,s.name AS shopName,s.img AS shopImg from tb_overstock_detail osd left join tb_shop s on osd.shop = s.id where osd.shop = ? and osd.osid = ?", [inShopId,id]);
  }
  var finalResult = result[0];
  finalResult.detail = result2
  ctx.state.data = finalResult;
}

async function addDetail(ctx, next) {

  var amount = ctx.query.amount;
  var shopId = ctx.query.shopId;
  var company = ctx.query.company;
  var osId = ctx.query.osId;
  
  var result = await query("insert into tb_overstock_detail (company,shop, status,amount,osid,create_date) values(?,?,0,?,?,CURRENT_DATE)", [company, shopId, amount, osId]);

  ctx.state.data = result;
}

async function updateUseableAmt(ctx, next) {

  var amount = ctx.query.amount;
  
  var osId = ctx.query.osId;
  var result;
  if (amount == 0){
    result = await query("update tb_overstock set useable=?,status = 1 where id = ?", [amount, osId]);
  }else{
    result = await query("update tb_overstock set useable=?where id = ?", [amount, osId]);
  }
  
  ctx.state.data = result;
}

async function updateDetailStatus(ctx, next) {
  var status = ctx.query.status;
  var id = ctx.query.id;
  var result = await query("update tb_overstock_detail set status=? where id = ?", [status, id]);;
  ctx.state.data = result;
}


module.exports = {
  list,
  add,
  getById,
  addDetail,
  updateUseableAmt,
  updateDetailStatus
}