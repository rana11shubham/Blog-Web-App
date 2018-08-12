var mongoose=require('mongoose');
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
   created:{
     type:Date,
     default:Date.now
   }
});
module.exports={blogApp};
