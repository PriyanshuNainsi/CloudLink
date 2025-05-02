const express= require("express");
const cookieParser=require("cookie-parser")
const app=express();

app.use(cookieParser());

app.get('/',(req,res)=>{
    res.cookie("name","cookie");
    res.send("hi this is coockie");
    console.log(req.cookies);
})
app.get("/read",(req,res)=>{
    res.send("hi cookie forward>>");
    console.log(req.cookies);
})

app.listen(3000,()=>{
    console.log(`app is listening on the http://localhost:3000`);
})