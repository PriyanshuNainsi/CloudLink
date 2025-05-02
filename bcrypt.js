const express= require("express");
const bcrypt=require("bcrypt");
const app=express();


app.get('/',(req,res)=>{
    const password="priyanshu";
    bcrypt.genSalt(10, function(err, salt) {

        bcrypt.hash(password, salt, function(err, hash) {
            // Store hash in your password DB.
            console.log(`this is salt ${hash}`);
            console.log(password);
        });
        res.send("doi")
    });
})

app.listen(3000,()=>{
    console.log(`app is listening on the http://localhost:3000`);
})