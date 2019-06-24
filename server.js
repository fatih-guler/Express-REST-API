var express = require('express')
var app = express()
var db = require('./database.js')

var HTTP_PORT = 1234

app.listen(HTTP_PORT, () => {
    console.log('Server  %PORT% üzerinde çalışıyor'.replace('%PORT%', HTTP_PORT))
});

app.get('/', (req, res, next) => {
    res.json({'message': 'ok'})
});

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