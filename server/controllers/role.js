const { mysql } = require('../qcloud.js')
const { query } = require('../mysql')
const userutil = require('./userutil.js')


async function add(ctx, next) {
  
  var userinfo = await userutil.get(ctx, next);
  var rolename = ctx.query.rolename;
  var companyid = userinfo.company_id;
  
  var check = await query("select count(*) count  from tb_role where name = ? and company = ?", [rolename, companyid]);
  if (check[0].count > 0) {
    ctx.state.data = {
      errocode: 1,
      msg: "Role has already existed(角色已存在)!"
    }
    return;
}
  var result = await query("INSERT INTO tb_role  (name,company)  value (?,?);", [rolename, companyid]);
  
  ctx.state.data = result;
}

async function list(ctx, next) {
  var userinfo = await userutil.get(ctx, next);
  var companyid = userinfo.company_id;
  var result = await query("select * from tb_role where company = ?", [companyid]);

  ctx.state.data = result;
}

async function findRoleByOpenid(ctx, next) {
  var openId = ctx.query.openId;;

  var result = await query("select role from tb_user_role where open_id =?", [openId]);
  ctx.state.data = result;
}

async function updateUserRole(ctx, next) {
  var flag = ctx.query.flag;
  var openId = ctx.query.openId;
  var roleId = ctx.query.roleId;
  var result;
  if (flag == 1){
    result = await query("insert into tb_user_role (open_id,role)values(?,?)", [openId, roleId]);
  } else if (flag == 2){
    result = await query("delete from tb_user_role where open_id =? and role=?", [openId, roleId]);
  } else {

  }
  
  ctx.state.data = result;
}

async function findRoleMenuByRole(ctx, next) {
  var roleId = ctx.query.roleId;
  var result = await query("select menu from tb_role_menu where role =?", [roleId]);
  ctx.state.data = result;
}

async function updateRoleMenu(ctx, next) {
  var flag = ctx.query.flag;
  var roleId = ctx.query.roleId;
  var menuId = ctx.query.menuId;
  var result;
  if (flag == 1) {
    result = await query("insert into tb_role_menu (role,menu)values(?,?)", [roleId, menuId]);
  } else if (flag == 2) {
    result = await query("delete from tb_role_menu where role =? and menu=?", [roleId, menuId]);
  } else {

  }

  ctx.state.data = result;
}

async function findRoleUser(ctx, next) {
  var roleid = ctx.query.roleid;
  var result = await query("select cs.* from cSessionInfo cs left join tb_user_role ur on ur.open_id = cs.open_id where ur.role = ?", [roleid]);
  ctx.state.data = result;
}
async function outRoleUsers(ctx, next) {
  var roleid = ctx.query.roleid;
  var userinfo = await userutil.get(ctx, next);
  var company = userinfo.company_id;
  var username = "%" + ctx.query.username + "%";
  var result = await query("SELECT cs.* FROM csessioninfo cs WHERE cs.company_id =? AND cs.company_reviewed=1 AND (cs.user_info like ? or cs.username like ?)and cs.open_id NOT IN (SELECT ur.open_id FROM tb_user_role ur WHERE ur.role = ?) ", [company, username, username, roleid]);
  ctx.state.data = result;
}





module.exports = {
  add,
  list,
  findRoleByOpenid,
  updateUserRole,
  findRoleMenuByRole,
  updateRoleMenu,
  findRoleUser,
  outRoleUsers
}