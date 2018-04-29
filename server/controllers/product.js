const { mysql } = require('../qcloud.js')
const { query } = require('../mysql')

async function list(ctx, next) {
  var shopID = ctx.query.shopID;
  var storeID = ctx.query.storeID;

  var result ;
console.log("list");
  if(storeID){
    result =  await query("SELECT product.*,sum(inventory.count) as count FROM  tb_inventory inventory LEFT JOIN tb_product product ON product.id = inventory.productId LEFT JOIN tb_store store ON inventory.storeId = store.id WHERE store.id = ? group by inventory.productId",[storeID]);
  }

  if(shopID){
    result =  await query("select product.*,ifnull(sum(inventory.count),0) as count from tb_product product   left join tb_shop shop  ON(   (     shop.company = product.scope_id     AND product.scope = 'company'   )   OR(     shop.id = product.scope_id    AND product.scope = 'shop'  ) ) left join tb_inventory inventory on inventory.productId = product.id where shop.id =? GROUP BY  product.id",[shopID]);
  }
  console.log(result);
  ctx.state.data=result;
}

async function getone(ctx, next) {
  var id = ctx.query.id;
  var result = await mysql('tb_product').select('*').where({ id: id});

  var item = result.length > 0 ? result[0] : {};
  ctx.state.data = item;
}

async function getByBarCode(ctx, next) {
  var barCode = ctx.query.barCode;

  //店内库存分布
  var inventoryInShop = ctx.query.inventoryInShop;
  //仓库库存分布
  var inventoryInStore = ctx.query.inventoryInStore;

  var result = await mysql('tb_product').select('*').where({ barCode: barCode });
  var item = result.length > 0 ? result[0] : {};

  if(inventoryInShop){
     //店内库存分布
    var inventoryInShopResult =  await query("SELECT  shop. NAME AS shopName,   ifnull(sum(inventory.count), 0)AS inventoryCount FROM   tb_inventory inventory LEFT JOIN tb_shop shop ON inventory.shopId = shop.id left join tb_product product on inventory.productId = product.id WHERE  product.barcode = ? GROUP BY  shop.id HAVING  inventoryCount > 0",[barCode]);
    item.inventoryInShopResult = inventoryInShopResult;
  }


  if(inventoryInStore){
    //仓库库存分布
     var inventoryInStoreResult =  await query("SELECT   store. NAME AS storeName,   ifnull(sum(inventory.count), 0)AS inventoryCount FROM   tb_inventory inventory LEFT JOIN tb_store store ON inventory.storeId = store.id left join tb_product product on inventory.productId= product.id WHERE   product.barcode = ? GROUP BY  store.id",[barCode]);
    item.inventoryInStoreResult = inventoryInStoreResult;
  }

  ctx.state.data = item;
}

async function add(ctx, next) {
  var barcode = ctx.query.barcode;
  var name = ctx.query.name;
  var img = ctx.query.img;
  var price = ctx.query.price;
  console.log(ctx.query);
  var result =  await query("insert into tb_product(name,barcode,img,price) values(?,?,?,?)",[name,barcode,img,price]);
 
  ctx.state.data = result;
}


async function search(ctx, next) {
  var inputVal = "%"+ctx.query.inputVal+"%";
  var result =  await query("select * from tb_product where barcode like ? or name like ? limit 5",[inputVal,inputVal]);
 
  ctx.state.data = result;
}


//查询xx下的产品库存
//传入
//shopId:查商铺下的
//storeId:查仓库下的
//positionId:查仓位下的
//如果传入多个,以最小单位为准
async function search(ctx, next) {
  var positionId = ctx.query.positionId;
  var storeId = ctx.query.storeId;
  var shopId = ctx.query.shopId;

  var result;
  if(positionId){
    result =  await query("   select product.name productName, store.name storeName,shop.name shopName,ifnull(sum(inventory.count),0) inventoryCount from tb_inventory inventory left join tb_product product on inventory.productId = product.id left join tb_store_position sposition on inventory.positionId=sposition.id left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where sposition.id = ? group by inventory.productId,store.id",[positionId]);
  }else  if(storeId){
    result =  await query("select product.name productName,sposition.no positionName,store.name storeName,shop.name shopName,ifnull(sum(inventory.count),0) inventoryCount from tb_inventory inventory left join tb_product product on inventory.productId = product.id left join tb_store_position sposition on inventory.positionId=sposition.id left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where store.id =? group by inventory.productId,inventory.positionId",[storeId]);
  }else  if(shopId){
    result =  await query("select product.name productName, shop.name shopName,ifnull(sum(inventory.count),0) inventoryCount from tb_inventory inventory left join tb_product product on inventory.productId = product.id left join tb_store_position sposition on inventory.positionId=sposition.id left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where shop.id = 1 group by inventory.productId,shop.id",[shopId]);
  }
 
  ctx.state.data = result;
}


module.exports = {
  add,
  list,
  getone,
  getByBarCode,
  search
}