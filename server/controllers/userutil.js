
const { query } = require('../mysql')


let get = async function( ctx, next ) {
  var userinfo = ctx.state.$wxInfo.userinfo;
	var company =await query("select u.*,c.name as company_name from cSessionInfo u left join tb_company c on u.company_id = c.id where open_id = ?",[userinfo.openId]);
   
   	//查询用户的公司信息
   	//通过open_id重新从数据库获取用户
    //修改ctx中存储的用户信息
    
	userinfo.company_name=company[0].company_name;
	userinfo.company_reviewed=company[0].company_reviewed;
	userinfo.company_id=company[0].company_id;

    return userinfo;
}

module.exports = { get }









