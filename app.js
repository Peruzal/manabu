const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const lessMiddleware = require('less-middleware');
const syncLocalUser = require('./middleware/syncLocalUser');
const compression = require('compression');

require('./models');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const courseRouter = require('./routes/courses');
const adminRouter = require('./routes/admin');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.basedir = app.get('views');

app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/course_categories', express.static('public/course_categories'));
app.use('/uploads', express.static('public/uploads'));
app.use('/scripts', express.static(__dirname + '/node_modules'));
app.use(express.static(path.join(__dirname, 'node_modules')));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.use(syncLocalUser);
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/courses', courseRouter);
app.use('/admin', adminRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
