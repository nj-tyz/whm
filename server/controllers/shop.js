const { query } = require('../mysql')
const userutil = require('./userutil.js')

async function list(ctx, next) {
  var userinfo =await userutil.get(ctx, next);
  var open_id = userinfo.openId;
  var pageSize = (ctx.query.pageSize || 5) * 1;
  var pageNo = (ctx.query.pageNo || 1) * 1;
  var s_i = pageSize * pageNo - pageSize;
  
  //只查询当前用户有权限的店铺
  var result = await query("select * from tb_shop where id in(select shop from tb_user_shop where open_id = ? ) limit ?,?", [open_id, s_i, pageSize]);
  ctx.state.data=result;
}

async function findListByCurrentCompany(ctx, next) {
  var userinfo = await userutil.get(ctx, next);
  var companyId = userinfo.company_id;
  //只查询当前用户公司的所有的店铺
  var result = await query("select * from tb_shop where company = ?", [companyId]);
  ctx.state.data = result;
}

async function add(ctx, next) {
   var userinfo =await userutil.get(ctx, next);
  var company = userinfo.company_id;
  var open_id = userinfo.openId;

  var no = ctx.query.no;
  var name = ctx.query.name;
  var address = ctx.query.address;
  var img = ctx.query.img;
  //console.log(ctx.query);
  //添加商铺
  var new_shop =  await query("insert into tb_shop(no,name,address,img,company) values(?,?,?,?,?);",[no,name,address,img,company]);
  //添加商铺-人员
  await query("insert into tb_user_shop(company,open_id,shop) values(?,?,?);",[company,open_id,new_shop.insertId]);
 
  ctx.state.data = new_shop;
}


async function getone(ctx, next) {
  var id = ctx.query.id;
  var result = await query(" select *, (select count(0) from tb_store store where store.shop = shop.id) storeCount, (select IFNULL(sum(inventory.count), 0) from tb_inventory inventory where inventory.shop = shop.id) inventoryCount, (select count(0) from tb_product product  where product.company = shop.company) productCount   FROM  tb_shop shop where shop.id =?",[id]);
  var item = result.length > 0 ? result[0] : {};
  //console.log(item);
  ctx.state.data = item;
}

async function getShopInfo(ctx, next){
  var id = ctx.query.id;
  var result = await query("SELECT * FROM tb_shop WHERE id = ?;", [id]);
  ctx.state.data = result; 
}

async function updateShopInfo(ctx, next) {
  var userinfo = await userutil.get(ctx, next);
  var company = userinfo.company_id;
  
  var id = ctx.query.id;
  var no = ctx.query.no;
  var name = ctx.query.name;
  var address = ctx.query.address;
  var img = ctx.query.img;


  var result = await query("UPDATE tb_shop set no=?,name=?,address=?,img=?,company=? WHERE id = ?", [no, name, address, img,company,id]);
  ctx.state.data = result;
}

async function deleteShop(ctx, next) {
  var shopID = ctx.query.shopID || 0;
  var  result = await query("DELETE FROM tb_inventory WHERE shop = ?;DELETE FROM tb_store_position  where shop = ?;DELETE FROM tb_store WHERE shop = ?;DELETE FROM tb_user_shop WHERE shop = ?;DELETE FROM tb_shop WHERE id = ?;", [shopID, shopID, shopID, shopID, shopID], true);
  
  ctx.state.data = result;
}

async function shopUsers(ctx, next) {
  var shopId = ctx.query.shopId;
  var result = await query("SELECT us.*,cs.user_info AS userInfo from tb_user_shop us LEFT JOIN csessioninfo  cs on  us.open_id = cs.open_id  where us.shop = ?", [shopId]);
  ctx.state.data = result;
}


async function updateShopUser(ctx, next) {
  var status = ctx.query.status;
  var openid = ctx.query.openId;
  var shopid = ctx.query.shopId;
  var userinfo = await userutil.get(ctx, next);
  var companyid = userinfo.company_id;
  var id = ctx.query.usershopId;
  var result;
  if (status == 1){
    result = await query("INSERT INTO tb_user_shop (company,open_id,shop)values(?,?,?)", [companyid, openid, shopid]);
  }else{
    result = await query("DELETE FROM tb_user_shop WHERE id = ?", [id]);
  }
  ctx.state.data = result;
}

async function outShopUser(ctx, next) {
  var shopid = ctx.query.shopId;
  var userinfo = await userutil.get(ctx, next);
  var company = userinfo.company_id;
  var username = "%" + ctx.query.username + "%";
  var result = await query("SELECT cs.* FROM csessioninfo cs WHERE cs.company_id =? AND cs.company_reviewed=1 AND cs.user_info like ? and cs.open_id NOT IN (SELECT us.open_id FROM tb_user_shop us WHERE us.shop = ?) ", [company, username,shopid]);;
  
  ctx.state.data = result;
}

module.exports = {
  list,
  getone,
  add,
  findListByCurrentCompany,
  shopUsers,
  updateShopUser,
  outShopUser,
  getShopInfo,
  updateShopInfo,
  deleteShop
}