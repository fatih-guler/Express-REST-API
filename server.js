var express = require('express')
var app = express()
var md5 = require('md5')
var db = require('./database.js')

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded( {extended: false}));
app.use(bodyParser.json());

var HTTP_PORT = 8000

app.listen(HTTP_PORT, () => {
    console.log('Server  %PORT% üzerinde çalışıyor'.replace('%PORT%', HTTP_PORT))
});


app.get('/', (req, res, next) => {
    res.json({'message': 'ok'})
});


// kullanıcı silme

app.delete("/api/user/:id", (req, res, next) => {
    db.run(
        'DELETE FROM user WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})


// kullanıcı kaydetme
app.post('/api/user', (req, res, next) => {
    var errors = [];
    if(!req.body.password){
        errors.push('No password specified');
    }
    if(!req.body.email){
        errors.push('No email specified');
    }
    if(errors.length){
        res.status(400).json({'error': errors.join(',')});
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        password: md5(req.body.password)
    }
    var sql = 'INSERT INTO user(name, email, password) VALUES(?,?,?)'
    var params = [data.name, data.email, data.password]
    db.run(sql, params, (err, result) => {
        if(err){
            res.status(400).json({'err': err.message});
        }
        res.json({
            'message': 'success',
            'data': data,
            'id': this.lastID
        })
    })
})


// kullanıcı bilgilerini güncelleme
app.path('/api/user/:id', (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password ? md5(req.body.password) : null
    }
    db.run(
        `UPDATE user set 
        name = COALESCE(?,name), 
        email = COALESCE(?,email), 
        password = COALESCE(?,password) 
        WHERE id = ?`,
        [data.name, data.email, data.password, req.params.id],
        function(err, result) {
            if(err){
                res.status(400).json({'err': err.message});
                return;
            }
            res.json({
                message: 'success',
                data: data,
                changes: this.changes
            })
        });
})

// Tüm kullanıcıları çekme
app.get('/api/users', (req, res, next) => {
    var sql = 'select * from user'
    var params =  []
    db.all(sql,params,(err, rows) => {
        if(err){
            res.status(400).json({'error' : err.message})
            return;
        }
        res.json({
            'message': 'success',
            'data': rows
        })
    });
});

// Id si verilen kullanıcıyı çekme
app.get('/api/user/:id', (req, res, next) => {
    var sql = 'select * from user where id = ?'
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if(err){
            res.status(400).json({'error': err.message})
            return;
        }
        res.json({
            'message': 'success',
            'data': row
        })
    })
})

app.use(function(req, res){
    res.status(404)
});