const { query } = require('../mysql')
const userutil = require('./userutil.js')

async function getByName(ctx, next) {
  var name = ctx.query.name;
  var result =  await query("select * from tb_company where name =?",[name]);
  ctx.state.data=result;
}


async function join(ctx, next) {
  var openId = ctx.state.$wxInfo.userinfo.openId;
  var id = ctx.query.id;
  var name = ctx.query.name;
  console.log("join :"+id+",name:"+name)
  if(id<0){
   //创建新公司
    var new_company =  await query("insert into tb_company(name,pid) values(?,0)",[name]);
   //加入并审核
   await query("update cSessionInfo set company_id = ? ,company_reviewed=1 where open_id = ?",[new_company.insertId,openId]);
   //新角色
   var new_role = await query("insert into tb_role (name,company) values('admin',?)  ", [new_company.insertId]);
   //角色人员对应关系
   var new_role = await query("insert into tb_user_role (open_id,role) values(?,?)  ", [openId, new_role.insertId]);
   await query("insert into tb_role_menu (role,menu) values(?,1)  ", [new_role.insertId]);
   await query("insert into tb_role_menu (role,menu) values(?,2)  ", [new_role.insertId]);
   await query("insert into tb_role_menu (role,menu) values(?,3)  ", [new_role.insertId]);
   await query("insert into tb_role_menu (role,menu) values(?,4)  ", [new_role.insertId]);
   await query("insert into tb_role_menu (role,menu) values(?,5)  ", [new_role.insertId]);
   await query("insert into tb_role_menu (role,menu) values(?,6)  ", [new_role.insertId]);
   await query("insert into tb_role_menu (role,menu) values(?,7)  ", [new_role.insertId]);
   
  }else{
    //加入公司
    await query("update cSessionInfo set company_id = ? ,company_reviewed=0 where open_id = ?",[id,openId]);
  }

 
  ctx.state.data="ok";
}

async function companyUsers(ctx, next) {
  var userinfo = await userutil.get(ctx, next);
  var companyId = userinfo.company_id;
  var result = await query("select * from cSessionInfo  where company_id = ? order by company_reviewed",[companyId])
  ctx.state.data = result;
}

async function auditUser(ctx, next){
  var openId = ctx.query.openId;
  var userinfo = await userutil.get(ctx, next);
  var companyId = userinfo.company_id;
  var result = await query("update cSessionInfo set company_reviewed = 1  where open_id = ? and company_id = ? ", [openId,companyId])
  ctx.state.data = "ok";
}

async function removeUser(ctx, next) {
  var openId = ctx.query.openId;
  var userinfo = await userutil.get(ctx, next);
  var companyId = userinfo.company_id;
  var result = await query("delete from cSessionInfo  where open_id = ? and company_id = ? ", [openId, companyId])
  ctx.state.data = "ok";
}

module.exports = {
  join, getByName, companyUsers, auditUser, removeUser
}