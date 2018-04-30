const { mysql } = require('../qcloud.js')
const { query } = require('../mysql')

async function list(ctx, next) {
  var pageSize = ctx.query.pageSize||5;
  var pageNo = ctx.query.pageNo||1;
  var e_i = pageSize*pageNo;
  var s_i = e_i-pageSize;

  var shopID = ctx.query.shopID;
  var storeID = ctx.query.storeID;

  var result ;
  console.log("list");
  if(storeID){
    result =  await query("SELECT product.*,sum(inventory.count) as count FROM  tb_inventory inventory LEFT JOIN tb_product product ON product.id = inventory.productId LEFT JOIN tb_store store ON inventory.storeId = store.id WHERE store.id = ? group by inventory.productId limit ?,?",[storeID,s_i,e_i]);
  }

  if(shopID){
    result =  await query("select product.*,ifnull(sum(inventory.count),0) as count from tb_product product   left join tb_shop shop  ON(   (     shop.company = product.scope_id     AND product.scope = 'company'   )   OR(     shop.id = product.scope_id    AND product.scope = 'shop'  ) ) left join tb_inventory inventory on inventory.productId = product.id where shop.id =? GROUP BY  product.id limit ?,?",[shopID,s_i,e_i]);
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
  //仓库库存分布
  var inventoryInPosition = ctx.query.inventoryInPosition;

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

  if(inventoryInPosition){
     //货架库存分布
     var inventoryInStoreResult =  await query("SELECT  product. NAME productName,  sposition. NO positionName,   store. NAME storeName,  shop. NAME shopName,  inventory.count inventoryCount FROM   tb_inventory inventory LEFT JOIN tb_product product ON inventory.productId = product.id LEFT JOIN tb_store_position sposition ON inventory.positionId = sposition.id LEFT JOIN tb_store store ON sposition.store = store.id LEFT JOIN tb_shop shop ON store.shop = shop.id WHERE  product.barcode=? order by shop.id,store.id,sposition.id,product.id",[barCode]);
    item.inventoryInPosition = inventoryInStoreResult;
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





module.exports = {
  add,
  list,
  getone,
  getByBarCode,
  search
}