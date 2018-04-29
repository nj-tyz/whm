const { query } = require('../mysql')

async function getByName(ctx, next) {
  var name = ctx.query.name;
  var result =  await query("select * from tb_company where name =?",[name]);
  ctx.state.data=result;
}


async function join(ctx, next) {
  var openId = ctx.state.$wxInfo.userinfo.openId;
  var id = ctx.query.id;
    var name = ctx.query.name;
    if(id<0){
      //创建新公司
      var new_company =  await query("insert into tb_company(name,pid) values(?,0)",[name]);
       //加入并审核
       await query("update cSessionInfo set company_id = ? ,company_reviewed=1 where open_id = ?",[new_company.insertId,openId]);
    }else{
      //加入公司
      await query("update cSessionInfo set company_id = ? ,company_reviewed=0 where open_id = ?",[id,openId]);
    }

 
  ctx.state.data="ok";
}

module.exports = {
  join,getByName
}