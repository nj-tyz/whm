const { mysql } = require('../qcloud.js')
const { query } = require('../mysql')

//获取所有库存
async function list(ctx, next) {
   var shopID = ctx.query.shopID||0;
  var storeID = ctx.query.storeID||0;
  var productID = ctx.query.productID||0;

 
  var sql = "SELECT   store. NAME AS storeName,   sposition.no as positionName,   product. NAME AS productName,   product.img AS img, product.barcode AS barcode,  sum(inventory.count)AS count FROM   tb_inventory inventory left join tb_store_position sposition on sposition.id = inventory.positionId LEFT JOIN tb_product product ON product.id = inventory.productId LEFT JOIN tb_store store ON store.id = inventory.storeId LEFT JOIN tb_shop shop ON store.shop = shop.id WHERE  (?= 0 OR shop.id = ?) AND(?= 0 OR store.id = ?) AND(?= 0 OR product.id =?) GROUP BY   inventory.productId,  inventory.storeId,  inventory.positionId ORDER BY   store.id";
  var params = [shopID,shopID,storeID,storeID,productID,productID];

  var result =  await query(sql,params);
  
  console.log(result);
  ctx.state.data=result;
}

//获取仓库下指定商品的库存
async function getBySidAndPid(ctx, next) {
  var positionId = ctx.query.positionId;
  var productId = ctx.query.productId;
   var result =  await query("select * from tb_inventory where productId = ? and positionId=?",[productId,positionId]);
   var item = result.length>0?result[0]:[];
    ctx.state.data = item;
}


/**
 * 操作库存
 * storeId:仓库id
 * productId:产品id
 * optionType:操作类型
 * optionCount:操作数量
 */
async function optionInventory(ctx, next) {
  var shopId = ctx.query.shopId;
  var storeId = ctx.query.storeId;
  var positionId = ctx.query.positionId;
  var productId = ctx.query.productId;
  var optionType = ctx.query.optionType;
  var optionCount = ctx.query.optionCount * 1;

  var dbCount_result =await query("select * from tb_inventory where productId = ? and positionId=?",[productId,positionId]);

  console.log(dbCount_result)

  var insertSql = "insert into tb_inventory(shopId,storeId,positionId,productId,count) values (?,?,?,?,?)";
  var updateSql = "update tb_inventory set count = ? where positionId=? and productId=?";

  var dbCount = dbCount_result.length>0?dbCount_result[0].count:0;
  var result;

  var newCount = 0;
  if (optionType == "out") {
     newCount = dbCount - optionCount
  } else if (optionType == "in") {
      newCount = dbCount + optionCount
  }


  var params=[];

  if(dbCount_result.length==0){
     console.log("insert")
    params=[shopId,storeId,positionId,productId,newCount]
     console.log(params)
    result =  await query(insertSql,params);
  }else{
    console.log("updata")
    params=[newCount,positionId,productId]
    result =  await query(updateSql,params);
  }




  ctx.state.data = result;
}


//库存报表(店铺维度)
async function inventoryInShop(ctx, next) {
  var productId = ctx.query.productId;
   var result =  await query("select shop.name as shopName,ifnull(sum(inventory.count),0) as inventoryCount  from tb_inventory inventory  left join tb_shop shop on inventory.shopId = shop.id where inventory.productId = ? group by shop.id  having inventoryCount>0",[productId]);
   ctx.state.data = result;
}

//库存报表(店铺维度)
async function inventoryInStore(ctx, next) {
  var productId = ctx.query.productId;
   var result =  await query("select store.name as storeName,ifnull(sum(inventory.count),0) as inventoryCount  from tb_inventory inventory  left join tb_store store on inventory.storeId = store.id where inventory.productId = ? group by store.id ",[productId]);
   ctx.state.data = result;
}



//库存报表(仓位维度)
async function inventoryInStore(ctx, next) {
  var positionId = ctx.query.positionId;
   var result =  await query("select product.name as productName,ifnull(sum(inventory.count),0) as inventoryCount from tb_inventory inventory left join tb_product product on inventory.productId = product.id where  inventory.positionId = ? group by product.id",[positionId]);
   ctx.state.data = result;
}

//库存报表(仓库维度,传入仓位id)
async function inventoryInStore(ctx, next) {
  var positionId = ctx.query.positionId;
   var result =  await query("select product.name as productName,ifnull(sum(inventory.count),0) as inventoryCount from tb_inventory inventory left join tb_product product on inventory.productId = product.id where  inventory.storeId in (select store from tb_store_position where id =?) group by product.id ",[positionId]);
   ctx.state.data = result;
}





module.exports = {
  list,
  getBySidAndPid,
  optionInventory,
  inventoryInShop,
  inventoryInStore
}