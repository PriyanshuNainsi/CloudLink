const express= require("express");
const bcrypt=require("bcrypt");
const app=express();


app.get('/',(req,res)=>{
    bcrypt.compare("priyanshu","$2b$10$H9HTe3r7b5wmOBR/dhDU.erJ44tjgWZJrArwDxv8K08EuBvwA1/iu", function(err, result) {
       console.log(result);
    });
    res.send("hi this is priyasnuh and ewahr is tytj")
})

app.listen(3000,()=>{
    console.log(`app is listening on the http://localhost:3000`);
})