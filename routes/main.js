module.exports = function(app, shopData) {

    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
        res.redirect('./login')
        } else { next (); }
        }

    const { check, validationResult } = require('express-validator');

    // Handle our routes
    app.get('/',function(req,res){
        res.render('home.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });
    app.get('/list',function(req,res){
        let sqlquery = "SELECT * FROM food_details"; // query database to get all the books
            // execute sql query
            db.query(sqlquery, (err, result) => {
                if (err) {
                    res.redirect('./'); 
                }
                let newData = Object.assign({}, shopData, {availablesearchdata:result});
                // console.log(newData);
                res.render("list.ejs",newData);
            });
    });
    app.get('/search',function(req,res){
        res.render('search.ejs', shopData);
    });
    app.get('/update',redirectLogin,function(req,res){
        res.render('update.ejs', shopData);
    });
    app.get('/addfood',redirectLogin,function(req,res){
        // console.log(req.session.userId);
        res.render('addfood.ejs', shopData);
    });
 
    app.get('/api', function (req,res) {
        // Query database to get all the books
        
        
            let sqlquery = "SELECT * FROM food_details";
            // Execute the sql query
            db.query(sqlquery, (err, result) => {
            if (err) {
            res.redirect('./');
            }
            // Return results as a JSON object
            res.json(result);
            });
        
        
    });
    app.get('/search-result',[check('keyword').notEmpty()], 
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        res.redirect('./'); }
        else {
            //searching in the database
            //res.send("You searched for: " + req.query.keyword);

            let sqlquery = "SELECT * FROM food_details WHERE food_name LIKE '%" + req.sanitize(req.query.keyword) + "%'"; // query database to get all the books
            // execute sql query
            db.query(sqlquery, (err, result) => {
                if (err) {
                    res.redirect('./'); 
                }
                let newData = Object.assign({}, shopData, {availablesearchdata:result});
                // console.log(newData);
                res.render("search.ejs",newData);
            });
        
        }
                
    });
    app.get('/update-result',[check('update_box').notEmpty()], 
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        res.redirect('./'); }
        else {

            let sqlquery = "SELECT * FROM food_details WHERE food_name LIKE '%" + req.sanitize(req.query.update_box) + "%'"; // query database to get all the books
            // execute sql query
            db.query(sqlquery, (err, result) => {
                if (err) {
                    res.redirect('./'); 
                }
                let newData = Object.assign({}, shopData, {availablesearchdata:result});
                // console.log(newData);
                res.render("update.ejs",newData);
            });
        
        }
                
    });
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });

    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData);                                                                     
    });



    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
        return res.redirect('./')
        }
        res.send('you are now logged out sucessfully. <a href='+'./'+'>Home</a>');
        })
    });
        
  

    app.post('/loggedin', [check('user_name').isAlpha('en-US', {ignore: '\s'}).notEmpty(),
                           check('password').isLength({ min: 8 }).notEmpty()], 
    function (req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        res.redirect('./login'); }
        else {
                // saving data in database
                const bcrypt = require('bcrypt');

                // Compare the password supplied with the password in the database
                let sqlquery = 'SELECT hashedPassword FROM user_details WHERE username = ?';
                let our_l =[req.sanitize(req.body.user_name)];
    
                // //passing our insert query to mysql server
                db.query(sqlquery,our_l, (err, result) => {
                    if (err) {
                    console.log(err);
                    }
                    else{
                        console.log("query passed");
                        var hashedPassword = result[0].hashedPassword;
    
                        bcrypt.compare(req.sanitize(req.body.password), hashedPassword, function(err, rult) {
                            if (err) {
                            // TODO: Handle error
                                console.log(err);
                            }
                            else if (rult == true) {
                            // TODO: Send message
                            console.log("query passed again");
                            // Save user session here, when login is successful
                            req.session.userId = req.sanitize(req.body.user_name);
                            // console.log(req.session.userId);
                            //res.redirect('./index');
                            res.send('<a href='+'./'+'>Home</a> your password is correct, username: '+ req.sanitize(req.body.user_name));
                            }
                            else {
                            // TODO: Send message
                            console.log("query failed",req.sanitize(req.body.password));
                            res.send('<a href='+'./'+'>Home</a> your password is incorrect, password: '+ req.sanitize(req.body.password));
                            }
                        });
                        
                    }
                });

        }
        
        
    });

    app.post('/registered',[check('email').isEmail(),
                            check('password').isLength({ min: 8 }).notEmpty(),
                            check('user_name').isAlpha('en-US', {ignore: '\s'}).isLength({ min: 3 }).notEmpty()],
     function (req,res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./register');
        }
        else {
        
            // saving data in database
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const plainPassword = req.body.password;

            bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
                // Store hashed password in your database.
                // console.log(req.body.user_name,req.body.first,req.body.last,hashedPassword,req.body.email);

                let sqlquery = "INSERT INTO user_details (username,first_name,last_name,hashedPassword,email) VALUES (?,?,?,?,?)";
                let our_l =[req.body.user_name,req.sanitize(req.body.first),req.sanitize(req.body.last),hashedPassword,req.body.email];

                // //passing our insert query to mysql server
                db.query(sqlquery,our_l, (err, result) => {
                    if (err) {
                    console.log(err);
                    }
                    else{
                        console.log("added sucessfully");
                        
                    }
                });

                result = '<a href='+'./'+'>Home</a> Hello '+ req.sanitize(req.body.first) + ' '+ req.sanitize(req.body.last); 
                result += ' you are now registered! We will send an email to you at ' + req.sanitize(req.body.email);
                result += 'Your password is: '+ req.sanitize(req.body.password) +' and your hashed password is: '+ hashedPassword;
                res.send(result);

            });
            

        }

                                                                                      
    }); 
 
    app.post('/foodadded',[check('name').notEmpty().isAlpha('en-US', {ignore: '\s'}),
                            check('unit_typical_values').notEmpty().isAlpha('en-US', {ignore: '\s'}),
                            check('typical_values').isNumeric().notEmpty(),
                            check('Carbs').isNumeric().notEmpty(),
                            check('Fat').isNumeric().notEmpty(),
                            check('Protein').isNumeric().notEmpty(),
                            check('Salt').isNumeric().notEmpty(),
                           check('Sugar').isNumeric().notEmpty()], 
        function (req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        res.redirect('./'); }
        else {
            // saving data in database
            let sqlquery = "INSERT INTO food_details (username,food_name,typical_values,unit_typical_values,Carbs,Fat,Protein,Salt,Sugar) VALUES (?,?,?,?,?,?,?,?,?)";
            // execute sql query
            let newrecord = [req.session.userId, req.sanitize(req.body.name),req.sanitize(req.body.typical_values),req.sanitize(req.body.unit_typical_values),
                req.sanitize(req.body.Carbs),req.sanitize(req.body.Fat),req.sanitize(req.body.Protein),req.sanitize(req.body.Salt),
                req.sanitize(req.body.Sugar)];
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                return console.error(err.message);
                }
                else
                res.send('<a href='+'./'+'>Home</a> food added sucessfully');
            });
        }
        
    });
    
    app.post('/updatefinal',[check('name').notEmpty().isAlpha('en-US', {ignore: '\s'}),
                            check('unit_typical_values').notEmpty().isAlpha('en-US', {ignore: '\s'}),
                            check('typical_values').isNumeric().notEmpty(),
                            check('Carbs').isNumeric().notEmpty(),
                            check('Fat').isNumeric().notEmpty(),
                            check('Protein').isNumeric().notEmpty(),
                            check('Salt').isNumeric().notEmpty(),
                           check('Sugar').isNumeric().notEmpty()], 
        function (req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        res.redirect('./'); }
        else {
            // saving data in database
            let sqlquery = "UPDATE food_details SET food_name = ?, typical_values = ?, unit_typical_values = ?, Carbs = ?, Fat = ?, Protein = ?, Salt = ?, Sugar = ? WHERE id = ?";
            
            // execute sql query
            let newrecord = [req.sanitize(req.body.name),req.sanitize(req.body.typical_values),req.sanitize(req.body.unit_typical_values),
                req.sanitize(req.body.Carbs),req.sanitize(req.body.Fat),req.sanitize(req.body.Protein),req.sanitize(req.body.Salt),
                req.sanitize(req.body.Sugar),parseInt(req.body.id)];
                // console.log(req.body.id);
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                return console.error(err.message);
                }
                else
                res.send('<a href='+'./'+'>Home</a> food updated sucessfully');
            });
        }
        
    });
    
    app.post('/passupdate',[check('enterid').isNumeric().notEmpty()], 
    function (req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        res.redirect('./'); }
        else {

            let sqlquery = "SELECT * FROM food_details WHERE id LIKE '%" + parseInt(req.sanitize(req.body.enterid)) + "%'";
            // execute sql query
            
            db.query(sqlquery, (err, result) => {
                if (err) {
                return console.error(err.message);
                }
                else{
                    let newData = Object.assign({}, shopData, {availableupdata:result[0]});
                    if(result[0].username == req.session.userId){
                        res.render("newupdate.ejs",newData);
                    }
                    else{
                        res.redirect('./');
                    }
                }
            });
        }
    });

    app.post('/deletefinal',[check('id_delete').isNumeric().notEmpty()], 
    function (req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        res.redirect('./'); }
        else {

            let sqlquery = "DELETE FROM food_details WHERE id LIKE '%" + parseInt(req.body.id_delete) + "%'";
            // execute sql query
            
            db.query(sqlquery, (err, result) => {
                if (err) {
                return console.error(err.message);
                }
                else{
                    res.send('<a href='+'./'+'>Home</a> food deleted sucessfully');
                }
            });
        }
    });

    app.post('/listform',function (req,res) {
        
        var our_ids = req.body.selected;
        var input_multiplyer=[];
        var total_Carbs=[];
        var total_fat=[];
        var total_Protein=[];
        var total_salt=[];
        var total_sugar=[];
        for(var i=0;i<our_ids.length;i++){
            var single_v = our_ids[i].split(",");
            var our_ida = 'req.body.input'+ single_v[0];
            input_multiplyer.push(parseInt(eval(our_ida)));
            total_Carbs.push(parseInt(single_v[2]));
            total_fat.push(parseInt(single_v[3]));
            total_Protein.push(parseInt(single_v[4]));
            total_salt.push(parseInt(single_v[5]));
            total_sugar.push(parseInt(single_v[6]));
        }
        
        var total_carbs_final=0;
        var total_fat_final=0;
        var total_protein_final=0;
        var total_salt_final=0;
        var total_sugar_final=0;
        var result_answer = '<a href='+'./'+'>Home</a> calculated sucessfully: ' + 'food item multiplayer = '+input_multiplyer;
        result_answer = result_answer + ' ,carbs = ' + total_Carbs;
        result_answer = result_answer + ' ,fat = ' + total_fat;
        result_answer = result_answer + ' ,protein = ' + total_Protein;
        result_answer = result_answer + ' ,salt = ' + total_salt;
        result_answer = result_answer + ' ,sugar = ' + total_sugar;

        for(var i=0;i<total_Carbs.length;i++){

            total_carbs_final = total_carbs_final + (input_multiplyer[i]*total_Carbs[i]);
            total_fat_final = total_fat_final + (input_multiplyer[i]*total_fat[i]);
            total_protein_final = total_protein_final + (input_multiplyer[i]*total_Protein[i]);
            total_salt_final = total_salt_final + (input_multiplyer[i]*total_salt[i]);
            total_sugar_final = total_sugar_final + (input_multiplyer[i]*total_sugar[i]);
            
            
        }
        result_answer = result_answer + ' ,total carbs is = ' + total_carbs_final;
        result_answer = result_answer + ' ,total fat is = ' + total_fat_final;
        result_answer = result_answer + ' ,total protein is = ' + total_protein_final;
        result_answer = result_answer + ' ,total salt is = ' + total_salt_final;
        result_answer = result_answer + ' ,total sugar is = ' + total_sugar_final;
        
        res.send(result_answer);
        
    });       

}
