const { mysql } = require('../qcloud.js')
const { query } = require('../mysql')
const userutil = require('./userutil.js')

async function list(ctx, next) {
  var pageSize = (ctx.query.pageSize||5)*1;
  var pageNo = (ctx.query.pageNo||1)*1;
  var s_i = pageSize*pageNo-pageSize;

  var shopID = ctx.query.shopID;
  var storeID = ctx.query.storeID;
  var inputVal = ctx.query.inputVal;

  var result ;
  console.log("list");
  if(storeID){
    result =  await query("select product.*, (select ifnull(sum(count),0) from tb_inventory  where store = ? and product = product.id)count  from tb_product product  where product.shop = (select shop from tb_store where id = ?)order by product.id limit ?,?",[storeID,storeID,s_i,pageSize]);
  }

  if(shopID){
    var sql = "select product.*, (select ifnull(sum(count),0) from tb_inventory  where shop = product.shop and product = product.id)count  from tb_product product  where product.shop = ? order by product.id";
    var parames= [shopID];
    if(inputVal&&inputVal!=""){
      inputVal = "%"+ctx.query.inputVal+"%";
      sql +=" and (barcode like ? or name like ? )";
      parames.push(inputVal);
      parames.push(inputVal);
    }



    sql +=" limit ?,?";
    parames.push(s_i);
    console.log(pageSize);
    parames.push(pageSize);


    result =  await query(sql,parames);
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
    var inventoryInShopResult =  await query("SELECT  shop.NAME AS shopName,   ifnull(sum(inventory.count), 0)AS inventoryCount FROM   tb_inventory inventory LEFT JOIN tb_shop shop ON inventory.shop = shop.id left join tb_product product on inventory.product = product.id WHERE  product.barcode = ? GROUP BY  shop.id HAVING  inventoryCount > 0",[barCode]);
    item.inventoryInShopResult = inventoryInShopResult;
  }


  if(inventoryInStore){
    //仓库库存分布
     var inventoryInStoreResult =  await query("SELECT   store.NAME AS storeName,   ifnull(sum(inventory.count), 0)AS inventoryCount FROM   tb_inventory inventory LEFT JOIN tb_store store ON inventory.store = store.id left join tb_product product on inventory.product= product.id WHERE   product.barcode = ? GROUP BY  store.id",[barCode]);
    item.inventoryInStoreResult = inventoryInStoreResult;
  }

  if(inventoryInPosition){
     //货架库存分布
     var inventoryInStoreResult =  await query("SELECT  product.NAME productName,  sposition. NO positionName,   store. NAME storeName,  shop. NAME shopName,  inventory.count inventoryCount FROM   tb_inventory inventory LEFT JOIN tb_product product ON inventory.product = product.id LEFT JOIN tb_store_position sposition ON inventory.position = sposition.id LEFT JOIN tb_store store ON sposition.store = store.id LEFT JOIN tb_shop shop ON store.shop = shop.id WHERE  product.barcode=? order by shop.id,store.id,sposition.id,product.id",[barCode]);
    item.inventoryInPosition = inventoryInStoreResult;
  }

  ctx.state.data = item;
}

async function add(ctx, next) {
   var userinfo =await userutil.get(ctx, next);
  var company = userinfo.company_id;
  var open_id = userinfo.openId;
  
  var barcode = ctx.query.barcode;
  var shop = ctx.query.shopID;
  var name = ctx.query.name;
  var img = ctx.query.img;
  var price = ctx.query.price;
  console.log(ctx.query);
  var result =  await query("insert into tb_product(name,barcode,img,price,company,shop) values(?,?,?,?,?,?)",[name,barcode,img,price,company,shop]);
 
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