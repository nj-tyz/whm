
const { query } = require('../mysql')
const userutil = require('./userutil.js')

async function getListByShop(ctx, next) {
  var shopID = ctx.query.shopID;
  var pageSize = (ctx.query.pageSize||5)*1;
  var pageNo = (ctx.query.pageNo||1)*1;
  var s_i = pageSize*pageNo-pageSize;


  var result =  await query("SELECT   *,  ( select IFNULL(sum(inventory.count), 0) from tb_inventory inventory where inventory.store = store.id) inventoryCount,  (select count(0) from tb_store_position sposition where sposition.store = store.id) positionCount FROM  tb_store store WHERE store.shop =?  limit ?,?",[shopID,s_i,pageSize]);
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

  //查询仓库下的库存数据
  var productsInStore =  await query("select  product.img productImage ,product.name productName,sposition.no positionName,store.name storeName,shop.name shopName,ifnull(sum(inventory.count),0) inventoryCount from tb_inventory inventory left join tb_product product on inventory.product = product.id left join tb_store_position sposition on inventory.position=sposition.id left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where store.id =? group by inventory.product,inventory.position",[id]);


  var item = result.length > 0 ? result[0] : {};
  item.productsInStore=productsInStore;
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