const express= require("express");
const userModel=require('./models/users');
const app=express();


app.get('/',(req,res)=>{
   res.send("done");
})

app.get('/create',async (req,res)=>{
   let createuser=await userModel.create({
        name:"Nainsi",
        email:"nainsi@gmail.com",
        username:"nainsi"
    })
    res.send(createuser);
})

app.get('/update',async (req,res)=>{
    let userUpdated=await userModel.findOneAndUpdate(
        {username:"nainsi"},
        {name:"tannu"},
        {new:true});

    res.send(userUpdated);
})

app.get('/read',async (req,res)=>{
    let userUpdated=await userModel.find();
    res.send(userUpdated);
})

app.get('/delete',async (req,res)=>{
    let userUpdated=await userModel.findOneAndDelete({username:"nainsi"});

    res.send(userUpdated);
})



app.listen(3000,()=>{
    console.log(`app is listening on the http://localhost:3000`);
})