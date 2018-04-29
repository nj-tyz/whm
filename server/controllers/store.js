
const { query } = require('../mysql')

async function getListByShop(ctx, next) {
  var shopID = ctx.query.shopID;

  var result =  await query("SELECT   store.*, IFNULL(sum(inventory.count), 0)AS inventoryCount,  IFNULL(count(sposition.id), 0)AS positionCount,   count(DISTINCT inventory.productId)AS productCount FROM   tb_store store LEFT JOIN tb_store_position sposition ON sposition.store = store.id LEFT JOIN tb_inventory inventory ON inventory.storeId = store.id and inventory.positionId = sposition.id WHERE   store.shop = ? GROUP BY   store.id",[shopID]);
  console.log(result);
  ctx.state.data=result;
}

async function getone(ctx, next) {
  var id = ctx.query.id;
  var result =  await query("select store.*,sposition.no as positionNo,sposition.id as positionId from tb_store store left join tb_store_position sposition on sposition.store = store.id where sposition.id =?",[id]);
  console.log(result);
  var item = result.length > 0 ? result[0] : {};
  ctx.state.data = item;
}

async function getById(ctx, next) {
  var id = ctx.query.id;
  var result =  await query("select *,(select count(0) from tb_store_position where store = store.id) positionCount ,(select ifnull(sum(count),0) from tb_inventory where storeid = store.id) inventoryCount from tb_store store where store.id= ?",[id]);
  var item = result.length > 0 ? result[0] : {};
  ctx.state.data = item;
}

async function add(ctx, next) {
  var no = ctx.query.no;
  var name = ctx.query.name;
  var address = ctx.query.address;
  var img = ctx.query.img;
  var shop = ctx.query.shop;
  var openId = "";
  console.log(ctx.query);
  var result =  await query("insert into tb_store(no,name,address,img,openId,shop) values(?,?,?,?,?,?)",[no,name,address,img,openId,shop]);
 
  ctx.state.data = result;
}







module.exports = {
  add,
  getById,
  getListByShop,
  getone
}