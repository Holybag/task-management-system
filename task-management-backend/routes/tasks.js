var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));

/* mysql setting */
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'yhkim',
  password        : 'yhkim01!',
  database        : 'taskmanagementsystem'
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  pool.query('SELECT * FROM Tasks WHERE postponeUntil is null or postponeUntil < now() ORDER BY dueDate, priority', function(error, results, fields){
    if (error) {
      res.send('fail');
    } else {
      //console.log(results[0].dueDate.toISOString().slice(0,19).replace('T', ' '));
      res.send(results);
    }
  });
});

router.get('/:id', function(req, res, next){
  var id = req.params.id;
  pool.query({
    sql: 'SELECT * FROM Tasks WHERE id=?',
    timeout: 4000,
    values: [id]
  }, function(error, result, fields){
    if (error) {
      res.send('fail');
    } else {
      res.send(result);
    }
  });
});

router.post('/', function(req, res, next){
  var dueDate = req.body.dueDate;
  var title = req.body.title;
  var description = req.body.description;
  var priority = req.body.priority;
  var status = req.body.status;

  pool.query({
    sql: 'INSERT INTO Tasks (id, createdAt, updatedAt, dueDate, \
                            title, description, priority, status) \
                      VALUES (uuid(), now(), now(), ?, ?, ?, ?, ?)',
    timeout: 4000,
    values: [dueDate, title, description, priority, status]
  }, function(error, result, fields){
    if (error) {
      res.send('fail');
    } else {
      res.send('success');
    }
  });
});

router.put('/:id', function(req, res, next){
  var id = req.params.id;
  var dueDate = req.body.dueDate;
  var title = req.body.title;
  var description = req.body.description;
  var priority = req.body.priority;
  var status = req.body.status;
  var postponeUntil = req.body.postponeUntil;
  var initPostponeUntil = req.body.initPostponeUntil;

  if (!id) {
    res.send('fail');
    return;
  }
  var sql = 'UPDATE Tasks SET ';
  if (dueDate) {
    sql += "dueDate='" + dueDate + "',";
  }
  if (title) {
    sql += "title='" + title + "',";      
  }
  if (description) {
    sql += "description='" + description + "',";
  }
  if (priority) {
    sql += "priority='" + priority + "',";
  }
  if (status) {
    sql += "status='" + status + "',";
  }
  if (postponeUntil) {
    sql += "postponeUntil=DATE_ADD(now(), INTERVAL 1 MINUTE),";
  } else if (initPostponeUntil) {
    sql += "postponeUntil=NULL,";
  }
  sql += "updatedAt=now()";
  sql +=  " WHERE id='" + id + "'";
  pool.query(sql, function(error, result, field){
    if (error) {
      res.send('fail');
    } else {
      res.send('success');
    }
  });
});

router.delete('/:id', function(req, res, next){
  var id = req.params.id;

  pool.query({
    sql: 'DELETE FROM Tasks WHERE id=?',
    timeout: 4000,
    values: [id]
  }, function(error, result, fields){
    if (error) {
      res.send('fail');
    } else {
      res.send('success');
    }
  });
});

module.exports = router;
