const { query } = require('../mysql')

async function list(ctx, next) {
  var storeID = ctx.query.storeID;
  var result =  await query("select * from tb_store_position where store =?",[storeID]);
  console.log(result);
  ctx.state.data=result;
}


async function add(ctx, next) {
  var no = ctx.query.no;
  var storeID = ctx.query.storeID;
 
  var result =  await query("insert into tb_store_position(no,store) values(?,?)",[no,storeID]);
 
  ctx.state.data = result;
}


module.exports = {
  add,
  list
}