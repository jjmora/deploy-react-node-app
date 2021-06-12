var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const schedule = require('node-schedule');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'build')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

///// SCHEDULE TASK /////

//schedule (https://crontab.guru/)
let time = 0

//GET crypto data from Coingecko
const request = require('request')
let responseBody = []

let curr_price = ''
let new_price = ''

function getCryptoValue(){
  request({
    url: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false',
    json: true
  }, (err, response, body) => {
    responseBody = body
  })
}

schedule.scheduleJob('crypto-job','*/10 * * * * *', () => {
  getCryptoValue()
  time = time +1
  console.log(time)
  console.log(`BTC : ${responseBody[0]["current_price"]} / ${time}`)
  new_price = responseBody[0]["current_price"]
  if(curr_price === '')
    {
      curr_price = responseBody[0]["current_price"]
      console.log(`Current: ${curr_price} at ${new Date().toString()}`)
    } else if(curr_price !== new_price){
      console.log(`Current: ${new_price} at ${new Date().toString()}`)
      curr_price = new_price
    }

  if(time === 10){
    schedule.cancelJob('crypto-job')
  }
})
///// SCHEDULE TASK END /////

module.exports = app;
