
const { query } = require('../mysql')
const userutil = require('./userutil.js')

async function getListByShop(ctx, next) {
  var shopID = ctx.query.shopID;

  var result =  await query("SELECT   *,  ( select IFNULL(sum(inventory.count), 0) from tb_inventory inventory where inventory.store = store.id) inventoryCount,  (select count(0) from tb_store_position sposition where sposition.store = store.id) positionCount FROM  tb_store store WHERE store.shop =?",[shopID]);
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
  var result =  await query("SELECT   *,(     SELECT      IFNULL(sum(inventory.count), 0)     FROM      tb_inventory inventory    WHERE       inventory.store = store.id  )inventoryCount,  (     SELECT      count(0)    FROM      tb_store_position sposition     WHERE       sposition.store = store.id  )positionCount FROM   tb_store store WHERE  store.id =?",[id]);
  var item = result.length > 0 ? result[0] : {};
  ctx.state.data = item;
}

async function add(ctx, next) {
  var userinfo =await userutil.get(ctx, next);
  var company = userinfo.company_id;
  var openId = userinfo.openId;

  var no = ctx.query.no;
  var name = ctx.query.name;
  var address = ctx.query.address;
  var img = ctx.query.img;
  var shop = ctx.query.shop;
  console.log(ctx.query);
  var result =  await query("insert into tb_store(no,name,address,img,openId,shop,company) values(?,?,?,?,?,?,?)",[no,name,address,img,openId,shop,company]);
 
  ctx.state.data = result;
}







module.exports = {
  add,
  getById,
  getListByShop,
  getone
}