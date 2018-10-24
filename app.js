const {mongoose}=require('./server/mongoose.js');
const bodyParser=require('body-parser');
const express=require('express');
const path=require('path');
const flash=require('connect-flash');
const ejs=require('ejs');
const expressSanitizer = require('express-sanitizer');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const methodOverride=require('method-override');
var {blogApp}=require('./server/models/Blog.js');
var User=require('./server/models/user.js');
var app=express();
const port=process.env.PORT||3000;
//app.set('view engine','hbs');
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(expressSanitizer());
app.use(flash());
//passport Configuration
app.use(require('express-session')({
  secret:"This is my secret page",
  resave: false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//middleware
app.use((req,res,next)=>{
  res.locals.currentUser=req.user;
  res.locals.error=req.flash("error");
  res.locals.success=req.flash("success");
  next();
});
//Blog Routes
app.get('/',(req,res)=>{
res.redirect('/blogs');
});
app.get('/blogs',(req,res)=>{
blogApp.find().then((blog)=>{
res.render('index',{blog,currentUser:req.user});
},(err)=>{
console.log('error');
});
});
app.get('/blogs/new',isLoggedIn,(req,res)=>{
  User.find().then((user)=>{
res.render('new',{user:req.user});
},(err)=>{
  req.flash('error','User Not Found!');
  console.log('error');
});
});
app.post('/blogs',isLoggedIn,(req,res)=>{
  //req.body.body = req.sanitize(req.body.body);
//console.log(req.body.body);
var newBlog=new blogApp(req.body);
newBlog.save().then((doc)=>{
req.flash('success','Successfully added a new blog!');
res.redirect('/blogs');
// console.log(JSON.stringify(doc),undefined,2);
},(err)=>{
req.flash('error','Blog not created!');
res.render('new');
});
});
app.get('/blogs/:id',(req,res)=>{
blogApp.findById(req.params.id).populate('user').then((blog)=>{
res.render('show',{blog,userl:req.user});
},(err)=>{
res.redirect('/blogs');
});
});
app.get('/blogs/:id/edit',isLoggedIn,(req,res)=>{
blogApp.findById(req.params.id).then((blog)=>{
res.render('edit',{blog});
},(err)=>{
res.redirect('/blogs');
});
});
app.put('/blogs/:id',isLoggedIn,(req,res)=>{
blogApp.findByIdAndUpdate(req.params.id,req.body).then((blog)=>{
req.flash('success','Successfully updated!');
res.redirect('/blogs/'+req.params.id);
},(err)=>{
req.flash('error','Something went wrong!');
res.redirect('/blogs');
});
});
app.delete('/blogs/:id',isLoggedIn,(req,res)=>{
blogApp.findByIdAndRemove(req.params.id).then((blog)=>{
req.flash('success','Successfully deleted!');
res.redirect('/blogs');
},err=>{
req.flash('error','Something went wrong!');
res.redirect('/blogs');
});
});
app.delete('/blogs',isLoggedIn,(req,res)=>{

})

//Auth Routes
app.get('/register',(req,res)=>{
  res.render('register');
});
// Signup Routes
app.post('/register',(req,res)=>{
  var newUser= new User({username:req.body.username});
  User.register(newUser,req.body.password,(err,User)=>{
    if(err){
     req.flash('error',err.message);
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req,res,()=>{
    res.redirect("/blogs");
     req.flash('success','Welcome to Blogger '+ user.username);
  });
})
});
// Login Routes
app.get('/login',(req,res)=>{
  res.render('login');
});

app.post('/login',passport.authenticate("local",{
  successRedirect:'/blogs',
  failureRedirect:'/login'
}),(req,res)=>{
});
//Logout Routes
app.get('/logout',isLoggedIn,(req,res)=>{
  req.logout();
  req.flash("success","Logged you out!");
  res.redirect('/blogs');
});
app.get("/deluser",isLoggedIn,function(req,res){
  blogApp.deleteMany({user:req.user.id},function(err){
    if(err) return handleError(err);
  });
  User.deleteOne({ username: req.user.username }, function (err) {
  if (err) return handleError(err);
  req.logout();
  res.redirect('/blogs');
});
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash('error','You need to be logged in to do that!');
  res.redirect('/login');
}

app.listen(port,()=>{
console.log(`Starting the server on port ${port}`);
});
