const { response } = require('express');


const express = require('express');
const mysqlConnection = require('../config/database');
const router = express.Router();
const multer = require('multer')
const path = require('path')
var upload = multer({ dest: 'upload/'});
var fs = require('fs');
const n = require('./check');
var nodemailer = require('nodemailer');
router.get("/",(req,res) =>{
    res.send("hello")
})

router.post("/register",(req,res) =>{
    console.log(req.body)
    const username = req.body.username;
    const password  = req.body.password;
    const phone = req.body.phonenumber;
    const type = req.body.type;
    mysqlConnection.query("SELECT * FROM users WHERE Email = ? ", [username],(err, result) =>{
      
        if (err) {
            res.send({err: err})
            
        }
        if (result. length > 0) {
           res.send({message:"Already exist"})
            
            
        }else{
            mysqlConnection.query("INSERT INTO users (Email,password,phone,usertype) VALUES (?,?,?,?)", [username,password,phone,type],(err, result) =>{
                console.log(err);
                res.send("success");
                
                    
                
            })
        }
    })
   
});
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
router.post("/product",upload.single('image'),(req,res) =>{
    // console.log(req )
    console.log(req.file)
    // console.log(req.body.image)
    const productname = req.body.productname;
    const price  = req.body.price;
    const type = req.body.type;
    const model = req.body.model;
    const description = req.body.description;
    // const image = req.body;
    if(req.file != null && req.file != undefined){
        var image = '/images/' + req.file.filename

    }
    else{
        var image = null;
    }
            mysqlConnection.query("INSERT INTO products (productname,price,type,model,description,image) VALUES (?,?,?,?,?,?)", [productname,price,type,model,description,image],(err, result) =>{
                console.log(err);
                console.log(result)
                const sqlselect = "SELECT * FROM products WHERE ID = ?";
                mysqlConnection.query(sqlselect,[result.insertId],(err,result) => {
                    res.send({"success" : "success",data:result[0]});
                })
   
                
                    
                
            })
        });
  
router.post("/menu",(req,res) =>{
            // console.log(req )
            console.log(req.body)
            // console.log(req.body.image)
            const menuname = req.body.menuname;
            const menutype  = req.body.menutype;
            mysqlConnection.query("INSERT INTO menu (menuname,menutype) VALUES (?,?)", [menuname,menutype],(err, result) =>{
                        console.log(err);
                        console.log(result)
                        const sqlselect = "SELECT * FROM menu WHERE ID = ?";
                        mysqlConnection.query(sqlselect,[result.insertId],(err,result) => {
                            res.send({"success" : "success",data:result[0]});
                        })
           
                        
                            
                        
                    })
});
router.post("/login",(req,res) =>{
    const username = req.body.username;
    const password  = req.body.password;
    mysqlConnection.query("SELECT * FROM users WHERE Email = ? AND password = ? ", [username,password],(err, result) =>{
        if (err) {
          return  res.send({err: err})
            
        }
        if (result. length > 0) {
            // req.session.loggedin = true;
            // return res.send(result);
            return res.send({result:result,isloogedin:true})
            
            
        }else{
          return  res.send({message : "wrong username/password combination!"});
        }
        
    })
    
})


router.post("/forgotpassword",(req,res) =>{
 
    var email=req.body.username;
 
 mysqlConnection.query( "SELECT * FROM users WHERE Email = ? ",[email],(err,result) => {
        if (err) {
            console.log("err",err);
        }
        else{
            console.log(result);
            if (result.length > 0) {
                var name=result[0].Name;
                console.log("name",name) 
                console.log("password",n)
                var transporter = nodemailer.createTransport({ 
                    service: 'gmail',
                   
                    auth: {
                      user: 'muhammedshesina@gmail.com',
                      pass: n
                    }
                 
                  }); 
                //   console.log(' <div>Hello '  +name+ '<p>You recently requested to reset your password. Click the link below to reset it. </p>' +  '<p><a class="btn btn-info" href="https://localhost:3000" > Reset password</a></p></div>')
                 var body = '<div><p>Hello' + name + '\n You recently requested to reset your password. Click the link below to reset it.\n<a class="btn btn-info" href="http://localhost:3000/resetpassword"> Reset password</a></p></div>'
                var mailOptions = {
                    from: 'muhammedshesina@gmail.com',
                    to: email,
                    subject: 'Password Reset Link',
                    // html : '<a href="http://localhost:3000">click here</a>'
                    html: body
                  
                }; 
                
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                      res.status(200).send({message:"Reset-Password link sent to your mail"})
                    }
                  });
            }
            else
                  {
                    res.send({message:"Unauthorized Login"})
                  }
        }
 }) 


})


router.post("/resetpassword",(req,res) =>{
    console.log(req.body)
    const username = req.body.username;
    const password  = req.body.password;
    mysqlConnection.query("SELECT * FROM users WHERE Email = ?  ", [username],(err, result) =>{
        if (err) {
            res.send({err: err})
            
        }
        if (result. length > 0) {
            console.log("update")
            mysqlConnection.query("UPDATE users SET  password = ?  WHERE Email = ? ", [password,username],(err, result) =>{
                console.log(err);
                res.send({message:"success"});
                
           


 
               
            })
            
            
        }else{
          console.log("error")
        }
    })
   
});



const { OAuth2Client, IdentityPoolClient } = require('google-auth-library')
const client = new OAuth2Client("142827027325-km29pbnk5learb8sh3cqc5q04eb2c99d.apps.googleusercontent.com")
router.post("/googleauth", async (req, res) => {
    const { token }  = req.body
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "142827027325-km29pbnk5learb8sh3cqc5q04eb2c99d.apps.googleusercontent.com"
    });
    const { name, email } = ticket.getPayload();    
   
    mysqlConnection.query("SELECT * FROM users WHERE Email = ? ", [email],(err, result) =>{
        if (err) {
            res.send({err: err})
            
        }
        if (result. length > 0) {
           
        }else{
            mysqlConnection.query("INSERT INTO users (Email) VALUES (?)", [email],(err, result) =>{
                console.log(err);
                res.send({message:"success"});
                
                    
                
            })
        }
        // req.session.loggedin = true;
        res.send({message:"success"});
    })
    

})

// const fetch = require ('node-fetch');
const  Axios  = require('axios');
router.post("/facebookauth", async (req, res) => {
   
    console.log("i dont know")
    const { userID, accessToken }  = req.body;

    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`
    
    Axios.get(urlGraphFacebook)
    .then(data => {
        console.log(data.data)
           const {email, name} = data.data;
           mysqlConnection.query("SELECT * FROM users WHERE Email = ? ", [email],(err, result) =>{
               console.log("yes")
            if (err) {
               return res.send({err: err})
                
            }
            if (result.length < 1) {
                mysqlConnection.query("INSERT INTO users (Email) VALUES (?)", [email],(err, result) =>{
                    console.log(err);
                    return res.send({message:"success"});
                    
                        
                    
                })
                
                
            }
            // req.session.loggedin = true;
            return res.send({message:"success"});
        })
    })
    

    // res.status(201)
    // res.json(user)
})

router.post("/logout",(req,res) =>{
    
    return res.send({isloogedin:false})
   
   
});

router.get("/get/:id",(req,res) =>{
    const {id} = req.params;
    console.log(id)
    const sqlselect = "SELECT * FROM users WHERE ID = ?";
    mysqlConnection.query(sqlselect,[id],(err,result) => {
        res.send(result);
    })
   
})

router.get("/1/get/:id",(req,res) =>{
  console.log("success")
    const {id} = req.params;
    console.log(id)
    const sqlselect = "SELECT * FROM products WHERE ID = ?";
    mysqlConnection.query(sqlselect,[id],(err,result) => {
        res.send(result);
    })
   
})

router.get("/gettestimonial",(req,res) =>{
    console.log("testimonial api")
   
      const sqlselect = "SELECT * FROM login.rating r join login.users u on u.ID = r.customerid ORDER BY ratingvalue DESC LIMIT 3";
      mysqlConnection.query(sqlselect,(err,result) => {
          res.send(result);
      })
     
  })

  router.get("/1/getcomment/:id",(req,res) =>{
    console.log("i am in")
      const {id} = req.params;
      console.log(id)
      const sqlselect = "SELECT * FROM rating WHERE productid = ? ORDER BY ratingvalue DESC LIMIT 3";
      mysqlConnection.query(sqlselect,[id],(err,result) => {
          res.send(result);
      })
     
  })

router.post("/comment/:id",(req,res) =>{
    console.log("ok")
    console.log(req.body)
    const {id} = req.params;
    console.log(id)
    const comment = req.body.comment;
    const ratingvalue = req.body.rating;
    const customerid = req.body.customerid;
    mysqlConnection.query("INSERT INTO rating (comment,ratingvalue,productid,customerid) VALUES (?,?,?,?)", [comment,ratingvalue,id,customerid],(err, result) =>{
        console.log(err);
        console.log(result)
        const sqlselect = "SELECT * FROM rating WHERE ID = ?";
        mysqlConnection.query(sqlselect,[result.insertId],(err,result) => {
            res.send({"success" : "success",data:result[0]});
        })

        
            
        
    })
  })
router.get("/gettablecomment",(req,res) =>{

    const sqlselect = "SELECT * FROM rating";
    
    mysqlConnection.query(sqlselect,(err,result) => {
        console.log(result)
        res.send(result);
    })
   
})
   

router.get("/getproduct",(req,res) =>{

    const sqlselect = "SELECT * FROM products";
    
    mysqlConnection.query(sqlselect,(err,result) => {
        console.log(result)
        res.send(result);
    })
   
})

router.get("/getmenus",(req,res) =>{
  
    const sqlselect = "SELECT * FROM menu WHERE menutype='sidemenu'";
    
    mysqlConnection.query(sqlselect,(err,result) => {
        console.log(result)
        res.send(result);
    })
   
})

router.get("/getmenu",(req,res) =>{
  
    const sqlselect = "SELECT * FROM menu";
    
    mysqlConnection.query(sqlselect,(err,result) => {
        console.log(result)
        res.send(result);
    })
   
})


router.get("/getproduct/:text",(req,res) =>{
    const {text} = req.params;
    console.log("hii")
    console.log(text)

    const sqlselect =`SELECT * FROM products WHERE productname like '%${text}%'`;
  
   
    console.log("myconnection")
    mysqlConnection.query(sqlselect,(err,result) => {
        if (err) {
            console.log(err)
        }
        console.log("hi")
        console.log(result)
        res.send(result);
    })
   
})

router.put("/update",(req,res) =>{
    const Name=req.body.Name;
    const Email=req.body.Email;
    const phone  = req.body.phone;
    const sqlupdate = "UPDATE users SET Email = ?, phone = ? WHERE Name = ?";
    mysqlConnection.query(sqlupdate,[Email,phone,Name],(err,result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
    })
   
})


router.put("/updateproduct",(req,res) =>{
    console.log(req)
    const ID = req.body.id;
    const productname = req.body.productname;
    const price  = req.body.price;
    const type = req.body.type;
    const model = req.body.model;
    const description = req.body.description;
    const sqlupdate = "UPDATE products SET productname = ?, price = ?, type = ?, model = ?, description = ? WHERE ID = ?";
    mysqlConnection.query(sqlupdate,[productname,price,type,model,description,ID],(err,result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
    })
   
})


router.put("/updatemenu",(req,res) =>{
    console.log(req)
    const ID = req.body.id;
    const menuname = req.body.menuname;
    const menutype  = req.body.menutype;
    
    const sqlupdate = "UPDATE menu SET menuname = ?, menutype = ? WHERE ID = ?";
    mysqlConnection.query(sqlupdate,[menuname,menutype,ID],(err,result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
    })
   
})

router.put("/updatecomment",(req,res) =>{
    console.log(req)
    const ID = req.body.id;
    const comment = req.body.comment;
   
    
    const sqlupdate = "UPDATE rating SET comment = ? WHERE ID = ?";
    mysqlConnection.query(sqlupdate,[comment,ID],(err,result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
    })
   
})

var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
 
//@type   POST
//route for post data
var type = upload.single('file');
router.post("/upload/:id", type, (req, res) => {
    const {id} = req.params;
    console.log(id)
    // console.log(req)
    if (!req.file) {
        console.log("No file upload");
    } else {
        console.log(req.file.filename)
        // var imgsrc = 'http://127.0.0.1:3000/images/' + req.file.filename
        var imgsrc = '/images/' + req.file.filename
        var insertData = "UPDATE users SET image = ? WHERE ID = ?"
        mysqlConnection.query(insertData, [imgsrc,id], (err, result) => {
            if (err) {
                console.log(err)
            }
            console.log("file uploaded")
        })
        res.send(imgsrc)
    }
    
});

// router.get("/home",(req,res) => {
//     if (!req.session.loggedin) {
//         res.redirect()
//     }
// })
//home page onload api call cheythu !req.session kanikanm

router.delete("/delete/:id",(req,res) =>{
    console.log(req)
    const id=req.params.id;
  console.log(id)
    const sqlupdate = "DELETE FROM products WHERE ID= ?";
    mysqlConnection.query(sqlupdate,id,(err,result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
    })
   
})

router.delete("/deletemenu/:id",(req,res) =>{
    console.log(req)
    const id=req.params.id;
  console.log(id)
    const sqlupdate = "DELETE FROM menu WHERE ID= ?";
    mysqlConnection.query(sqlupdate,id,(err,result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
    })
   
})

router.delete("/deletecomment/:id",(req,res) =>{
    console.log(req)
    const id=req.params.id;
  console.log(id)
    const sqlupdate = "DELETE FROM rating WHERE ID= ?";
    mysqlConnection.query(sqlupdate,id,(err,result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
    })
   
})
module.exports = router

