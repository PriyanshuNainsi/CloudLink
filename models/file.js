const mongoose=require('mongoose');

let fileDbConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/file_type');

let fileSchema=new mongoose.Schema({
      fileName: String,
      filePath:String,
      userId:String,
      time:String,
      access_token:String,
      expiryDate:String
})
 
module.exports=fileDbConnection.model('File',fileSchema);
