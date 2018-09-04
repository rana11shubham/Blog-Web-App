var mongoose=require('mongoose');

mongoose.Promise= global.Promise;
mongoose.connect('mongodb://shubham:rana11shubham@ds145072.mlab.com:45072/blogapp'||'mongodb://localhost:27017/blogapp');

module.exports={ mongoose};
