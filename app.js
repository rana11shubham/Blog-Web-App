const {mongoose}=require('./server/mongoose.js');
const bodyParser=require('body-parser');
const express=require('express');
const hbs=require('hbs');
const methodOverride=require('method-override');
var {blogApp}=require('./server/models/Blog.js');
var app=express();
app.set('view engine','hbs');
app.use(bodyParser.urlencoded({extended:true}));
hbs.registerPartials(__dirname+'/views/partials');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
// hbs.registerHelper("date",(created)=>{
//   return  "created.toDateString()";
// });
app.get('/',(req,res)=>{
res.redirect('/blogs');
});
app.get('/blogs',(req,res)=>{
blogApp.find().then((blog)=>{
res.render('index.hbs',{blog});
},(err)=>{
console.log('error');
});
});
app.get('/blogs/new',(req,res)=>{
res.render('new.hbs');
});
app.post('/blogs',(req,res)=>{
var newBlog=new blogApp(req.body)
newBlog.save().then((doc)=>{
res.redirect('/blogs');
console.log(JSON.stringify(docs),undefined,2);
},(err)=>{
res.render('new.hbs');
});
});
app.get('/blogs/:id',(req,res)=>{
blogApp.findById(req.params.id).then((blog)=>{
res.render('show.hbs',{blog});
},(err)=>{
res.redirect('/blogs');
});
});
app.get('/blogs/:id/edit',(req,res)=>{
blogApp.findById(req.params.id).then((blog)=>{
res.render('edit.hbs',{blog});
},(err)=>{
res.redirect('/blogs');
});
});
app.put('/blogs/:id',(req,res)=>{
blogApp.findByIdAndUpdate(req.params.id,req.body).then((blog)=>{
res.redirect('/blogs/'+req.params.id);
},(err)=>{
res.redirect('/blogs');
});
});
app.delete('/blogs/:id',(req,res)=>{
blogApp.findByIdAndRemove(req.params.id).then((blog)=>{
res.redirect('/blogs');
},err=>{
res.redirect('/blogs');
});
});
app.listen(3000,()=>{
console.log('Starting the server on port 3000');
})
