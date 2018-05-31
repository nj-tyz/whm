const { mysql } = require('../qcloud.js')
const { query } = require('../mysql')
const userutil = require('./userutil.js')


async function allMenus(ctx, next) {
  var userinfo = await userutil.get(ctx, next);
  var openid = userinfo.openId;
  var result = await query("SELECT DISTINCT rm.menu FROM tb_user_role ur   LEFT JOIN tb_role_menu rm ON rm.role = ur.role WHERE ur.open_id = ?", [openid]);

  ctx.state.data = result;
}

module.exports = {
  allMenus
}