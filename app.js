require('dotenv').config();
const mongoose=require('mongoose');
const express=require('express');
const jwt=require('jsonwebtoken')
const app = express();
const multer=require('multer');
const path=require('path')
const cookieParser=require('cookie-parser')
const bcrypt=require('bcrypt')
const userModel=require('./models/user')
const fileModel=require('./models/file');
const fs = require('fs');



// mongoose.connect('mongodb://127.0.0.1:27017/auth-sys');
mongoose.connect(process.env.MONGODB_URI,);

// Set the view engine
app.set('view engine','ejs')

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')))
app.use(cookieParser())


// Set up storage engine (to store files in the 'uploads' directory)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files in 'uploads' folder
  },
  filename: function (req, file, cb) {
    // Use original filename + current timestamp to avoid collisions
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

// File filter to allow only specific types of files (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/; // Accepts image files and PDFs
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);  // Accept file
  } else {
    cb(new Error('Only .jpg, .jpeg, .png, .gif, and .pdf files are allowed'), false); // Reject file
  }
};

// Initialize multer with storage and fileFilter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Optional: limit file size to 10MB
});

app.get('/',(req,res)=>{
    res.render("index");
})

app.post('/create', async (req, res) => {
    const { username, email, password, age } = req.body;

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send("Email already exists. Please use a different email.");
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const createdUser = await userModel.create({
            username,
            email,
            password: hash,
            age
        });

        const token = jwt.sign({ email }, 'thishis');
        res.cookie("token", token, { httpOnly: true });
        // res.send(createdUser);
        res.redirect('/mainPage')
        console.log("Generated Token:", token);
    } catch (error) {
        res.status(500).send(`Error creating user: ${error.message}`);
    }
});

app.get('/logout', (req, res) => {
    console.log("Logout route hit");
    res.clearCookie("token",{httpOnly:true,secure:false});
    res.redirect('/')
});



app.get('/login',(req,res)=>{
    res.render('login');
})




app.post('/dash-loged', async (req, res) => {
    try {
        // Find the user by email
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send("User does not exist.");
        }

        // Compare the provided password with the stored hashed password
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (err) {
                return res.status(500).send("Error comparing passwords.");
            }
            if (result) {
                // Generate a JWT token
                const token = jwt.sign({ email: user.email }, 'thishis');
                res.cookie('token', token, { httpOnly: true });
                // res.send("Login successfully");
                res.redirect('/mainPage')
                console.log(`Login token: ${token}`);
            } else {
                res.status(401).send("Incorrect password.");
            }
        });
    } catch (error) {
        res.status(500).send(`Error during login: ${error.message}`);
    }
});

app.get('/mainPage',async(req,res)=>{
    
    try{
        res.render('upload');
    }
    catch(error){
         console.log(`error rendering mainPage: ${error.message}`)
         res.status(500).send("An error occur while loading the mainPage.")
    }
})

app.post('/uploadroute',upload.single('file'),async (req,res)=>{
    const {userId,expiryDate}=req.body;
    const {originalname,path}=req.file;
    const time=new Date();
    const access_token = Date.now().toString();
    try{
          
        console.log("Generated Access Token:", access_token);
       let fileData=await fileModel.create({
        fileName:originalname,
        filePath:path,
        userId,
        time,
        access_token,
        expiryDate
       })
          const accessLink = `http://localhost:3000/file/${access_token}`;
          res.json({
             message:'upload successful.',
             link:accessLink
          })
    }
    catch(err){
        console.log(err);
        res.status(500).send("Error in the file uploading.")
    }
})

app.get('/file/:token',async (req,res)=>{
    const token=req.params.token;  // token extract from url
    try{
         
        console.log('hit file access')
      const file=await fileModel.findOne({access_token:token});
      console.log("File retrieved from database:", file);
      if(!file){
        console.log(token);
        return res.status(400).send('File not found or access token is invalid');
      }
       if(!fs.existsSync(file.filePath)){
         console.log(`File not found on server: ${file.filePath}`)
         return res.status(400).send("File not found on the server");
       }
      res.download(file.filePath,file.fileName,(err)=>{ 
        if(err){
              console.log(`Error in serving the file ${err.message}`);
           res.status(500).send("Error whhile serving the file");
         }
      });
    //    res.send(userRead);
    }
    catch(error){
          console.error("Error retrieving file:", error);
           res.status(500).send(`An error occurred while retrieving the file.`)
    }
})
app.listen(3000,()=>{
    console.log(`server is running on the http://localhost:3000`);
});
