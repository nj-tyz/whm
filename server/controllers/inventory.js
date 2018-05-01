const { mysql } = require('../qcloud.js')
const { query } = require('../mysql')
const userutil = require('./userutil.js')

//获取所有库存
//可以是商店,仓库,产品
async function list(ctx, next) {
   var shopID = ctx.query.shopID||0;
  var storeID = ctx.query.storeID||0;
  var productID = ctx.query.productID||0;

 
  var sql = "SELECT   store. NAME AS storeName,   sposition. NO AS positionName,  product. NAME AS productName,   product.img AS img,   product.barcode AS barcode,   sum(inventory.count)AS count FROM   tb_inventory inventory LEFT JOIN tb_store_position sposition ON sposition.id = inventory.position LEFT JOIN tb_product product ON product.id = inventory.product LEFT JOIN tb_store store ON store.id = inventory.store LEFT JOIN tb_shop shop ON store.shop = shop.id WHERE  (?= 0 OR shop.id = ?) AND(?= 0 OR store.id = ?) AND(?= 0 OR product.id =?) GROUP BY   inventory.product,  inventory.store,  inventory.position ORDER BY   store.id";
  var params = [shopID,shopID,storeID,storeID,productID,productID];

  var result =  await query(sql,params);
  
  console.log(result);
  ctx.state.data=result;
}

//获取仓库下指定商品的库存
async function getBySidAndPid(ctx, next) {
  var positionId = ctx.query.positionId;
  var productId = ctx.query.productId;
   var result =  await query("select * from tb_inventory where product = ? and position=?",[productId,positionId]);
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
  var userinfo =await userutil.get(ctx, next);
  var company = userinfo.company_id;
  var open_id = userinfo.openId;


  var shopId = ctx.query.shopId;
  var storeId = ctx.query.storeId;
  var positionId = ctx.query.positionId;
  var productId = ctx.query.productId;
  var optionType = ctx.query.optionType;
  var optionCount = ctx.query.optionCount * 1;

  var dbCount_result =await query("select * from tb_inventory where product = ? and position=?",[productId,positionId]);

  console.log(dbCount_result)

  var insertSql = "insert into tb_inventory(company,shop,store,position,product,count) values (?,?,?,?,?,?)";
  var updateSql = "update tb_inventory set count = ? where position=? and product=?";

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
    params=[company,shopId,storeId,positionId,productId,newCount]
     console.log(params)
    result =  await query(insertSql,params);
  }else{
    console.log("updata")
    params=[newCount,positionId,productId]
    result =  await query(updateSql,params);
  }




  ctx.state.data = result;
}






module.exports = {
  list,
  getBySidAndPid,
  optionInventory
}