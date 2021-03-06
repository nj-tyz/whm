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
    //查询本店的对应公司的产品,以及这些产品在本店的库存数
    var sql = "select product.*, (select ifnull(sum(count),0) from tb_inventory  where shop = ? and product = product.id)count  from tb_product product  where product.company = (select company from tb_shop where tb_shop.id = ? ) ";
    var parames= [shopID,shopID];
    if(inputVal&&inputVal!=""){
      inputVal = "%"+ctx.query.inputVal+"%";
      sql +=" and (barcode like ? or name like ? )";
      parames.push(inputVal);
      parames.push(inputVal);
    }



    sql +=" order by count desc limit ?,?";
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
  var shopID = ctx.query.shopID||0;

  //当前登录用户
  var userinfo =await userutil.get(ctx, next);
  var company = userinfo.company_id;
  var open_id = userinfo.openId;

  //是否查询店内库存分布
  var inventoryInShop = ctx.query.inventoryInShop;
  //是否查询仓库库存分布
  var inventoryInStore = ctx.query.inventoryInStore;
  //是否查询仓位库存分布
  var inventoryInPosition = ctx.query.inventoryInPosition;

  //查询产品对象.通过条码,以及公司
  var result =await query("select * from tb_product where barcode = ? and company = ?",[barCode,company]);
  var item = result.length > 0 ? result[0] : {};

  //如果产品不存在
  if(!item.id){
    ctx.state.data = {
        errocode:"productnotfount"
    }
    return;
  }



  if(inventoryInShop){
     //店内库存分布
     //公司下哪个店有货
    var inventoryInShopResult =  await query("SELECT  shop.NAME AS shopName,   ifnull(sum(inventory.count), 0)AS inventoryCount FROM   tb_inventory inventory LEFT JOIN tb_shop shop ON inventory.shop = shop.id left join tb_product product on inventory.product = product.id WHERE  product.barcode = ? and inventory.shop in (select shop from tb_user_shop where open_id=?) GROUP BY  shop.id HAVING  inventoryCount > 0 order by inventoryCount desc",[barCode,open_id]);
    item.inventoryInShopResult = inventoryInShopResult;
  }


  if(inventoryInStore){
    //仓库库存分布
    //当前店铺的哪个仓库有货
    //仓库:数量
     var inventoryInStoreResult =  await query("SELECT   store.NAME AS storeName,   ifnull(sum(inventory.count), 0)AS inventoryCount FROM   tb_inventory inventory LEFT JOIN tb_store store ON inventory.store = store.id left join tb_product product on inventory.product= product.id WHERE  product.barcode = ? and inventory.shop = ? GROUP BY store.id HAVING  inventoryCount > 0 order by inventoryCount desc",[barCode,shopID]);
    item.inventoryInStoreResult = inventoryInStoreResult;
  }

  if(inventoryInPosition){
     //货架库存分布
     //当前店铺的哪个货架上有货   
     //数据  仓库-货架:数量
     var inventoryInStoreResult =  await query("SELECT  product.NAME productName,  sposition. NO positionName,   store. NAME storeName,  shop. NAME shopName,  inventory.count inventoryCount FROM   tb_inventory inventory LEFT JOIN tb_product product ON inventory.product = product.id LEFT JOIN tb_store_position sposition ON inventory.position = sposition.id LEFT JOIN tb_store store ON sposition.store = store.id LEFT JOIN tb_shop shop ON store.shop = shop.id WHERE  inventory.count>0 and product.barcode=? and inventory.shop = ? order by inventoryCount desc",[barCode,shopID]);
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
  var currencyType = ctx.query.currencyType;
  console.log(ctx.query);


  //校验barcode是否重复
  var check = await query("select count(*) count  from tb_product where barCode = ? and company = ?", [barcode, company]);
  console.log(check);
  if (check[0].count>0) {
    ctx.state.data = {
      errocode: 1,
      msg: "Product has already existed(商品已存在)!"
    }
    return;
  }




  var result = await query("insert into tb_product(name,barcode,img,price,company,shop,currencyType) values(?,?,?,?,?,?,?)", [name, barcode, img, price, company, shop, currencyType]);
 
  ctx.state.data = result;
}


async function search(ctx, next) {
  var inputVal = "%"+ctx.query.inputVal+"%";
  var result =  await query("select * from tb_product where barcode like ? or name like ? limit 5",[inputVal,inputVal]);
 
  ctx.state.data = result;
}

async function updateProduct(ctx, next) {
  console.log(ctx);
  var id = ctx.query.id;
  var imgurl = ctx.query.img;
  var result = await query("update tb_product set img = ? where id = ?", [imgurl,id]);

  ctx.state.data = result;
}
async function updateProductInfo(ctx, next) {
  console.log(ctx);
  var id = ctx.query.id;
  var imgurl = ctx.query.img;
  var barcode = ctx.query.barcode;
  var name = ctx.query.name;
  var price = ctx.query.price;
  var currencyType = ctx.query.currencyType;

  var result = await query("update tb_product set img = ?,barcode =?,name =? ,price=?,currencyType=?where id = ?", [imgurl, barcode, name, price,currencyType,id]);

  ctx.state.data = result;
}


module.exports = {
  add,
  list,
  getone,
  getByBarCode,
  search,
  updateProduct,
  updateProductInfo
}