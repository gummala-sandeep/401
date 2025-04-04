const admin=require('firebase-admin');
const express=require('express');
const path = require('path');
const {initializeApp,cert}=require('firebase-admin/app');
const{firestore,getFirestore}=require('firebase-admin/firestore');
const serviecesapp=require('./key.json');
const bcrypt=require('bcrypt'); 

initializeApp({
    credential:admin.credential.cert(serviecesapp),
});


const db=getFirestore();
const app=express();
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname,'start.html'));
})
app.get('/login',function(req,res){
    res.sendFile(path.join(__dirname,'login.html'));
})
app.get('/signup',function(req,res){
    res.sendFile(path.join(__dirname,'signup.html'));
})

app.get('/home',function(req,res){
    res.sendFile(path.join(__dirname,"main.html"));
})

app.get('/dashboard/about',function(req,res){
    res.sendFile(path.join(__dirname,"about.html"));
})
app.get('/dashboard/contact',function(req,res){
    res.sendFile(path.join(__dirname,"contact.html"));
})
app.get('/dashboard/help',function(req,res){
    res.sendFile(path.join(__dirname,"help.html"));
})

app.get('/checkemail', async function(req,res){
    const{UserName,Email}=req.query;
    try {
        const emailSnapshot = await db.collection("signup").where("Email", "==", Email).get();
        const existmail = !emailSnapshot.empty;

        
        const userSnapshot = await db.collection("signup").where("Username", "==", UserName).get();
        const existuser = !userSnapshot.empty;

        
        
        res.json({ existmail, existuser });
    } catch (error) {
        console.error("Error checking email or username:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.get('/signupdata',async function(req,res){
    const{UserName,Email,Password}=req.query;
    try{
        const hashpassword=await bcrypt.hash(Password,10);

        db.collection("signup").add({
            Username:req.query.UserName,
            Password:hashpassword,
            Email:req.query.Email,
        })
        return res.send(`
            <script>
                alert("Signed up successfully!");
                window.location.href = "/login";
            </script>
        `);
    }
    catch(e){
        console.log("error occured");
        res.status(500).send("Internal servel issue");
    }
    console.log({UserName,Email,Password});
})

app.get('/logindata',async function(req,res){
    const{Username,Password}=req.query;
    try{
        const snapshot=await db.collection("signup").where('Username','==',Username).get();
        let userdata;
        snapshot.forEach(doc=>userdata=doc.data());
        const ismatch=await bcrypt.compare(Password,userdata.Password);
    if(snapshot.empty||!ismatch){
        return res.send(`
            <script>
                alert("Invalid email or password");
                window.location.href = "/login";
            </script>
            `); 
    }
    else{
        return res.redirect("/home");
    }
    }
    catch(e){
        console.log('authentication failed',e);
        return res.status(500).send("Internal Server Error");
    }
})

app.listen(2520,function(){
    console.log("this app is running in 2520");
})