const { query } = require('../mysql')
const userutil = require('./userutil.js')
const inventory = require('./inventory.js')

async function list(ctx, next) {
  var userinfo = await userutil.get(ctx, next);
  var companyId = userinfo.company_id;
  var shopId = ctx.query.shopId;
  var result = await query("select d.*,p.name AS productName,p.img AS productImg from tb_damage d left join tb_product p on p.id = d.product where  d.company=? and d.shop=?", [companyId,shopId]);
  ctx.state.data = result;
}
async function add(ctx, next) {
  var userinfo = await userutil.get(ctx, next);
  var companyId = userinfo.company_id;

  var shopId = ctx.query.shopId;
  var storeId = ctx.query.storeId;
  
  var positionId = ctx.query.positionId;
  var productId = ctx.query.productId;
  var amount = ctx.query.amount;
  var result = await query("insert into tb_damage (company,shop,product,amount,store,position,status) values (?,?,?,?,?,?,0)", [companyId, shopId, productId, amount, storeId, positionId]);

  //整理出库参数
  var inventoryParmas = {};
  inventoryParmas.shopId = shopId;
  inventoryParmas.storeId = storeId;
  inventoryParmas.positionId = positionId;
  inventoryParmas.productId = productId;
  inventoryParmas.optionCount = amount;
  inventoryParmas.optionType = "out";
  ctx.query = inventoryParmas;

  await inventory.optionInventory(ctx, next);

  ctx.state.data = result;
}
//取消damage
async function cancel(ctx, next) {
  var id = ctx.query.id;
  var damageResult = await query("select * from tb_damage where id = ?", [id]);
  
  var damage = damageResult[0]
  var shopId = damage.shop;
  var storeId = damage.store;
  var positionId = damage.position;
  var productId = damage.product;
  var amount = damage.amount;

  console.log(damage);

  //整理出库参数
  var inventoryParmas = {};
  inventoryParmas.shopId = shopId;
  inventoryParmas.storeId = storeId;
  inventoryParmas.positionId = positionId;
  inventoryParmas.productId = productId;
  inventoryParmas.optionCount = amount;
  inventoryParmas.optionType = "in";
  ctx.query = inventoryParmas;

  await inventory.optionInventory(ctx, next);

  var result = await query("update tb_damage set status = 2 where id =?", [id]);

  ctx.state.data = result;
}


async function updateStatus(ctx, next) {
  var id = ctx.query.id;
  var status = ctx.query.status;
  var result = await query("update tb_damage set status = ? where id =?", [status,id]);
  ctx.state.data = result;
}


module.exports = {
  list,add,
  updateStatus, cancel
}