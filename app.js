const express=require('express');
const jwt=require('jsonwebtoken')
const app = express();
const path=require('path')
const cookieParser=require('cookie-parser')
const bcrypt=require('bcrypt')
const userModel=require('./models/user')


// Set the view engine
app.set('view engine','ejs')

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')))
app.use(cookieParser())

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
        res.send(createdUser);
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
                res.send("Login successfully");
                console.log(`Login token: ${token}`);
            } else {
                res.status(401).send("Incorrect password.");
            }
        });
    } catch (error) {
        res.status(500).send(`Error during login: ${error.message}`);
    }
});

app.listen(3000,()=>{
    console.log(`server is running on the http://localhost:3000`);
});