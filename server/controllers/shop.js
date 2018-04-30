const { query } = require('../mysql')

async function list(ctx, next) {

  //只查询当前用户有权限的店铺
  var result =  await query("select * from tb_shop ");
  //console.log(result);
  ctx.state.data=result;
}

async function getone(ctx, next) {
  var id = ctx.query.id;
  var result =  await query(" SELECT  shop.*, count(DISTINCT store.id)AS storeCount,  IFNULL(sum(inventory.count), 0)AS inventoryCount,   count(DISTINCT product.id)AS productCount FROM  tb_shop shop LEFT JOIN tb_store store ON shop.id = store.shop LEFT JOIN tb_product product ON(  (     shop.company = product.scope_id     AND product.scope = 'company'   )   OR(     shop.id = product.scope_id    AND product.scope = 'shop'  ) ) LEFT JOIN tb_inventory inventory ON inventory.storeId = store.id and inventory.productId = product.id WHERE   shop.id =?",[id]);
  var item = result.length > 0 ? result[0] : {};
  //console.log(item);
  ctx.state.data = item;
}

async function add(ctx, next) {
  var no = ctx.query.no;
  var name = ctx.query.name;
  var address = ctx.query.address;
  var img = ctx.query.img;
  var openId = "";
  //console.log(ctx.query);
  var result =  await query("insert into tb_shop(no,name,address,img,openId) values(?,?,?,?,?)",[no,name,address,img,openId]);
 
  ctx.state.data = result;
}


module.exports = {
  list,
  getone,
  add
}