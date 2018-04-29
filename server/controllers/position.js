const { query } = require('../mysql')

async function list(ctx, next) {
  var storeID = ctx.query.storeID;
  var result =  await query("select * from tb_store_position where store =?",[storeID]);
  console.log(result);
  ctx.state.data=result;
}


async function add(ctx, next) {
  var no = ctx.query.no;
  var storeID = ctx.query.storeID;
 
  var result =  await query("insert into tb_store_position(no,store) values(?,?)",[no,storeID]);
 
  ctx.state.data = result;
}


//搜索仓位对象,
//传入
//shopId:查商铺下的
//storeId:查仓库下的
//positionId:查仓位下的
//如果传入多个,以最小单位为准

async function find(ctx, next) {
  var positionId = ctx.query.positionId;
  var storeId = ctx.query.storeId;
  var shopId = ctx.query.shopId;
  var inputVal = ctx.query.inputVal;

  
  console.log("position.get")
 
  var result =  await query("select sposition.*,store.name storeName ,shop.name shopName from tb_store_position sposition left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where sposition.id = ? or store.id=? or shop.id=? OR sposition.no like(?) OR store.name like(?) OR shop.name like(?)  order by sposition.id , store.id ,shop.id",[positionId,storeId,shopId,"%"+inputVal+"%","%"+inputVal+"%","%"+inputVal+"%"]);


  if(result.length>0){
    //查商品分布
    var products= [];
    var productsInPosition =  await query("select product.name productName, store.name storeName,shop.name shopName,ifnull(sum(inventory.count),0) inventoryCount from tb_inventory inventory left join tb_product product on inventory.productId = product.id left join tb_store_position sposition on inventory.positionId=sposition.id left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where sposition.id = ? group by inventory.productId,store.id",[positionId]);
    var productsInStore =  await query("select product.name productName,sposition.no positionName,store.name storeName,shop.name shopName,ifnull(sum(inventory.count),0) inventoryCount from tb_inventory inventory left join tb_product product on inventory.productId = product.id left join tb_store_position sposition on inventory.positionId=sposition.id left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where store.id =? group by inventory.productId,inventory.positionId",[storeId]);
    var productsInShop =  await query("select product.name productName, shop.name shopName,ifnull(sum(inventory.count),0) inventoryCount from tb_inventory inventory left join tb_product product on inventory.productId = product.id left join tb_store_position sposition on inventory.positionId=sposition.id left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where shop.id = 1 group by inventory.productId,shop.id",[shopId]);


    result[0].productsInPosition= productsInPosition
    result[0].productsInStore= productsInStore
    result[0].productsInShop= productsInShop
  }


  ctx.state.data = result;
}




module.exports = {
  add,
  list,
  find
}