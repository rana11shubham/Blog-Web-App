const {mongoose}=require('./server/mongoose.js');
const bodyParser=require('body-parser');
const express=require('express');
const path=require('path');
//const hbs=require('hbs');
const ejs=require('ejs');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const methodOverride=require('method-override');
var {blogApp}=require('./server/models/Blog.js');
var User=require('./server/models/user.js');
var app=express();
//app.set('view engine','hbs');
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
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
res.render('new');
});
app.post('/blogs',(req,res)=>{
var newBlog=new blogApp(req.body)
newBlog.save().then((doc)=>{
res.redirect('/blogs');
console.log(JSON.stringify(doc),undefined,2);
},(err)=>{
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
blogApp.findById(req.params.id).populate('user').then((blog)=>{
res.render('edit',{blog});
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
app.delete('/blogs/:id',isLoggedIn,(req,res)=>{
blogApp.findByIdAndRemove(req.params.id).then((blog)=>{
res.redirect('/blogs');
},err=>{
res.redirect('/blogs');
});
});

//Auth Routes
app.get('/register',(req,res)=>{
  res.render('register');
});
// Signup Routes
app.post('/register',(req,res)=>{
  var newUser= new User({username:req.body.username});
  User.register(newUser,req.body.password,(err,User)=>{
    if(err){
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req,res,()=>{
    res.redirect("/blogs");
  });
});
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
app.get('/logout',(req,res)=>{
  req.logout();
  res.redirect('/blogs');
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

app.listen(3000,()=>{
console.log('Starting the server on port 3000');
})
