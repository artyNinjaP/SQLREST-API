//ติดตั้ง ืnode init ก่อนโดยใช้คำสั่ง npm init 
//และติดตั้ง npm install express mysql body-parser

//Open Call Express 
const express = require('express')
const bodyParser = require('body-parser')
 
const mysql = require('mysql');
const { error } = require('console');
const { copyFileSync } = require('fs');
 
const app = express()
const port = process.env.PORT || 5000;
 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false})) 

var obj = {}//globel varable


////สร้าง Get สำหรับรองรับ สำหรับของhost
app.get('/additem',(req,res) =>{
    res.render('additem')
})


///สร้าง GET เพื่อรองรับ  DELETE copy get(''),มาใส่ เปลี่ยนชื่อ ejs
app.get('/delete',(req,res) =>{
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log("connected ID : =", connection.threadId)
        connection.query('SELECT *FROM beers', (err,rows) => {
            connection.release();
            if(!err){
                obj = {beers : rows , Error : err}
                res.render('deleteitem',obj)
            }else{
                console.log('err')
            
            }
        })
    })




  
})




//veiws 
app.set('view engine','ejs')
 
//MySQL Connect phpMyAdmin
const pool = mysql.createPool({
    connectionLimit : 10,
    connectionTimeout : 20,
    host : 'localhost', //www.google.com/sql or Server IP Address
    user : 'root',
    password : '',
    database : 'nodejs_beers' //Connect Database from beers.sql (Import to phpMyAdmin)
})
 
//GET (เรียกข้อมูลขึ้นมาดู) | POST (ส่งข้อมูลหน้า Website กลับเข้ามา)
//GET All Beers (beers.sql)
app.get('',(req, res) => {
 
    pool.getConnection((err, connection) => {  //err คือ connect ไม่ได้ or connection คือ connect ได้ บรรทัดที่ 13-20
        if(err) throw err
        console.log("connected id : ?" ,connection.threadId) //ให้ print บอกว่า Connect ได้ไหม
        //console.log(`connected id : ${connection.threadId}`) //ต้องใช้ ` อยู่ตรงที่เปลี่ยนภาษา ใช้ได้ทั้ง 2 แบบ
         
        connection.query('SELECT * FROM beers', (err, rows) => { 
            connection.release();
            if(!err){ //ถ้าไม่ error จะใส่ในตัวแปร rows
                //console.log(rows)
                //res.json(rows)
                //res.send(rows)
                //back-end :postman ==> res.send(rows)
                //font end :
                //ทำการ packege

                obj = { beers : rows, Error : err}



                // ----controller -----///
                res.render('index',obj)
            } else {
                console.log(err)
            }
         }) 
    })
})
 
//Copy บรรทัดที่ 24 - 42 มาปรับแก้ Code ใหม่
//สร้างหน้าย่อย ดึงข้อมูลเฉพาะ id ที่ต้องการ คือ 123, 124, 125
app.get('/:id',(req, res) => {
 
    pool.getConnection((err, connection) => {  //err คือ connect ไม่ได้ or connection คือ connect ได้ บรรทัดที่ 13-20
        if(err) throw err
        console.log("connected id : ?" ,connection.threadId) //ให้ print บอกว่า Connect ได้ไหม
        //console.log(`connected id : ${connection.threadId}`) //ต้องใช้ ` อยู่ตรงที่เปลี่ยนภาษา ใช้ได้ทั้ง 2 แบบ
 
        connection.query('SELECT * FROM beers WHERE `id` = ?', req.params.id, (err, rows) => { 
            connection.release();
            if(!err){ //ถ้าไม่ error จะใส่ในตัวแปร rows
                //res.send(rows)
                obj = { beers :rows , Error : err}
                res.render('showbyid',obj)
            } else {
                console.log(err)
            }
         }) 
    })
})
 


//(1)POST ทำการ INSERT --> req รับข้อมูลมาจากหน้าเว็บ, res จะส่งข้อมูลกลับไปยังหน้าเว็บ
//ใช้คำสั่ง bodyParser.urlencoded เพื่อทำให้สามารถรับข้อมูล x-www-form-urlencoded ทดสอบด้วย Postman ลงฐานข้อมูลได้

//สร้าง Path ของเว็บไซต์ additem
app.post('/additem',(req, res) => {
    pool.getConnection((err, connection) => { //pool.getConnection สำหรับใช้เชื่อมต่อกับ Database 
        if(err) throw err
            const params = req.body
 
                //Check 
                pool.getConnection((err, connection2) => {
                    connection2.query(`SELECT COUNT(id) AS count FROM beers WHERE id = ${params.id}`, (err, rows) => {
                        if(!rows[0].count){
                            connection.query('INSERT INTO beers SET ?', params, (err, rows) => {
                                connection.release()
                                if(!err){
                                    //res.send(`${params.name} is complete adding item. `)
                                    obj = {Error :err , mesg : `Success additem data ${params.name}`}
                                    res.render('additem', obj)

                                    
                                }else {
                                    console.log(err)
                                    }
                                })           
                        } else {
                            //res.send(`${params.name} do not insert data`)
                            obj = {Error:err, mesg : `Can not adding data ${params.name}`}                           
                            res.render('additem',obj)
                            }
                        })
                    })
                })
            })

//(2)DELETE ทำการ DELETE
//(2)DELETE ทำการ DELETE
//app.delete('/delete/:id',(req, res) => { ของเดิม /:id ลองสุ่มสามารถลบได้เลยไม่ปลอดภัย
app.post('/delete',(req, res) => {     //ใช้ POST เข้าจัดการจะปลอดภัยกว่าแบบเดิม
    var mesg
    pool.getConnection((err, connection) =>{
        if(err) throw err
        console.log("connected id : ?", connection.threadId)

        const {id} = req.body
        
        connection.query('DELETE FROM `beers` WHERE `beers`.`id` = ?', [id], (err, rows) => {
            connection.release();
            if(!err){ 
                //res.send(`${[req.params.id]} is complete delete item. `) 
                mesg = `${[id]} is complete delete item.`
                //res.render('deleteitem', obj)
            } else {
                mesg = `${[id]} can not delete item.`
                //res.render('deleteitem', obj)
            }
        })
    })

    pool.getConnection((err, connection) =>{
        if(err) throw err
        console.log("connected id : ?", connection.threadId) 
        connection.query('SELECT * FROM beers', (err, rows) => {
            connection.release();
            
            if(!err){ 
                //--------Model of Data--------------//
                obj = { beers : rows, Error : err, mesg : mesg}
                //-----------Controller--------------//
                res.render('deleteitem', obj)

            } else {
                console.log(err)
            }
        })
    })
})


//(3)PUT ทำการ UPDATE ข้อมูลใน Database ใช้วิธีการทดสอบทำเช่นเดียวกับของ POST
app.put('/update',(req, res) => {
    pool.getConnection((err, connection) =>{
        if(err) throw err
        console.log("connected id : ?", connection.threadId)
 
        //สร้างตัวแปรแบบกลุ่ม
        const {id, name, tagline, description, image} = req.body       
 
        //Update ข้อมูลต่าง ๆ ตามลำดับ โดยใช้เงื่อนไข id
        connection.query('UPDATE beers SET name = ?, tagline = ?, description = ?, image = ? WHERE id = ?', [name, tagline, description, image, id], (err, rows) => {
            connection.release();
            if(!err){ 
                res.send(`${name} is complete update item. `) 
            } else {
                console.log(err)
            }
        })
    })
})

app.listen(port, () => 
    console.log("listen on port : ?", port)
    )