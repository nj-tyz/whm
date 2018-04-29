const { query } = require('../mysql')
// 登录授权接口
module.exports = async (ctx, next) => {
	console.log("login");
    // 通过 Koa 中间件进行登录之后
    // 登录信息会被存储到 ctx.state.$wxInfo
    // 具体查看：
    if (ctx.state.$wxInfo.loginState) {
        ctx.state.data = ctx.state.$wxInfo.userinfo
        ctx.state.data['time'] = Math.floor(Date.now() / 1000)

  //       //放入用户公司,权限等信息
  //       var result =  await query("select * from cSessionInfo where open_id=?",[ctx.state.$wxInfo.userinfo.open_id]);
		// result = result.length>0?result[0]:[];
		// ctx.state.data['comp'] = Math.floor(Date.now() / 1000)

    }
}
