var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var blogApp=mongoose.model('blogApp',{
   title:{
     type:String
   },
   image:{
     type:String
   },
   body:{
     type:String
   },
   user:{type:Schema.Types.ObjectId,ref:"User"},
   created:{
     type:Date,
     default:Date.now
   }
});
module.exports={blogApp};
