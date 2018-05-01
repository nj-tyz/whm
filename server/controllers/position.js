const { query } = require('../mysql')
const userutil = require('./userutil.js')

async function list(ctx, next) {
  var storeID = ctx.query.storeID;
  var result =  await query("select * from tb_store_position where store =?",[storeID]);
  console.log(result);
  ctx.state.data=result;
}


async function add(ctx, next) {
  var userinfo =await userutil.get(ctx, next);
  var company = userinfo.company_id;
  var openId = userinfo.openId;

  var no = ctx.query.no;
  var storeID = ctx.query.storeID;
  var shopId = ctx.query.shopID;
 
  var result =  await query("insert into tb_store_position(no,store,company,shop) values(?,?,?,?)",[no,storeID,company,shopId]);
 
  ctx.state.data = result;
}


//搜索
async function find(ctx, next) {

  var userinfo =await userutil.get(ctx, next);
  var company = userinfo.company_id;
  var open_id = userinfo.openId;


  var positionId = ctx.query.positionId;
  var storeId = ctx.query.storeId;
  var shopId = ctx.query.shopId;
  var inputVal = ctx.query.inputVal;

  
  console.log(ctx.query)
 
  var result =  await query("select sposition.*,shop.id shopId,store.name storeName ,shop.name shopName from tb_store_position sposition left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where sposition.company=? and (sposition.id = ? or store.id=? or shop.id=? OR sposition.no like(?) OR store.name like(?) OR shop.name like(?) ) order by sposition.id , store.id ,shop.id limit 10",[company,positionId,storeId,shopId,"%"+inputVal+"%","%"+inputVal+"%","%"+inputVal+"%"]);

  ctx.state.data = result;
}

//获取仓位对象,
//传入
//shopId:查商铺下的
//storeId:查仓库下的
//positionId:查仓位下的
//如果传入多个,以最小单位为准

async function get(ctx, next) {
  var positionId = ctx.query.positionId;
  var storeId = ctx.query.storeId;
  var shopId = ctx.query.shopId;
  var inputVal = ctx.query.inputVal;

  
  console.log(ctx.query)
 
  var result =  await query("select sposition.*,shop.id shopId,store.name storeName ,shop.name shopName from tb_store_position sposition left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where sposition.id = ? or store.id=? or shop.id=? OR sposition.no like(?) OR store.name like(?) OR shop.name like(?)  order by sposition.id , store.id ,shop.id",[positionId,storeId,shopId,"%"+inputVal+"%","%"+inputVal+"%","%"+inputVal+"%"]);


  if(result.length>0){
    //查商品分布
    var products= [];


    //仓位内的产品分布
    var productsInPosition =  await query("select  product.img productImage, product.name productName,sposition.no positionName, store.name storeName,shop.name shopName,ifnull(sum(inventory.count),0) inventoryCount from tb_inventory inventory left join tb_product product on inventory.product = product.id left join tb_store_position sposition on inventory.position=sposition.id left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where sposition.id = ? group by inventory.product,store.id",[positionId]);


    //仓库内的产品分布(有可能没有传仓库参数,通过第一步的查询结果获取)
    storeId=storeId?storeId:result[0].store;
    var productsInStore =  await query("select  product.img productImage ,product.name productName,sposition.no positionName,store.name storeName,shop.name shopName,ifnull(sum(inventory.count),0) inventoryCount from tb_inventory inventory left join tb_product product on inventory.product = product.id left join tb_store_position sposition on inventory.position=sposition.id left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where store.id =? group by inventory.product,inventory.position",[storeId]);


    //店铺内的产品分布(有可能没有传店铺参数,通过第一步的查询结果获取)
    shopId=shopId?shopId:result[0].shopId;
    var productsInShop =  await query("select   product.img productImage, product.name productName, shop.name shopName,ifnull(sum(inventory.count),0) inventoryCount from tb_inventory inventory left join tb_product product on inventory.product = product.id left join tb_store_position sposition on inventory.position=sposition.id left join tb_store store on sposition.store = store.id left join tb_shop shop on store.shop = shop.id where shop.id = ? group by inventory.product,shop.id",[shopId]);


    result[0].productsInPosition= productsInPosition
    result[0].productsInStore= productsInStore
    result[0].productsInShop= productsInShop
  }


  ctx.state.data = result;
}




module.exports = {
  add,
  list,
  find,
  get
}