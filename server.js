const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const fs = require('fs');
const bodyParser = require('body-parser');
const DBService = require("./DBService.js");
const passport = require("./passport.js");

const app = express();
const config = require('./webpack.js');
const compiler = webpack(config);
DBService.init();

const jsonParser = bodyParser.json();


const serveSPA = (req, res) => {
  //console.log('serveSPA');
  let contentType = 'text/html; charset=utf-8';
  res.setHeader("Content-Type", contentType);
  
  try {
    fs.readFile('./public/index.html', function(error, content) {
          if ( !error ) {
            res.end(content, 'utf-8');
          }
          else
          {
            serveNotFound(req, res);
          }
    });
  } catch (e) {
    console.log(e)
  }
}

const serveNotFound = (req, res, errTitle, errMessage, statCode) => {
  console.log('serveNotFound');
  let error = {title: (errTitle) ? errTitle : 'Несуществующая страница', text: (errMessage) ? errMessage : 'Введенная вами страница на сайте не обнаружена.'};
  let status = (statCode) ? statCode : 404;
  
  res.status(status).json({  error: error.title + ': ' + error.text, status: status });
}


//
// ///////    Функции по юнитам   //////////
//
  
const serveUnits = (req,res) => {
//
// Получение JSON списка всех юнитов
//
  DBService.getUnits(req.query)
  .then((unitsList) => {
    //если массив вернулся не пустым
    if (unitsList.length !== 0) {
      //выводим JSON
      res.json(unitsList);
    } else {
      //говорим - внутренная ошибка сервера
      serveNotFound(req, res, 'Что-то пошло не так...', 'По вашему запросу ничего не найдено.', 500)
    }
  })
}

const serveOneUnit = (req,res) => {
//
// Получение JSON выбранного юнита [GET]
//
  DBService.getUnitByKey(req.params.key)
  .then((unit) => {
    //если массив вернулся не пустым
    if (unit.length !== 0) {
      //выводим JSON
      res.json(unit);
    } else {
      //говорим - внутренная ошибка сервера
      serveNotFound(req, res, 'Что-то пошло не так...', 'По вашему запросу ничего не найдено.', 500)
    }
  })
}

const serveNewUnit = (req, res)  => {  
//
// Запись в БД нового юнита [POST]
//
  console.log('serveNewUnit');
  DBService.newUnit(req.body)
  .then((result) => {
      res.status(201).json(result);
    })
  .catch((err) => {
      res.status(500).end// json({ error: err });;
    });
  
}

const serveUpdateUnit = (req, res) => {
//
// Обновление юнита [PUT]
//
  if (!req.body) return res.sendStatus(400);
  
  DBService.updateUnit(req.params.uKey, req.body)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: err });;
    });

}


const serveGetMaxKey = (req, res) => {
//
// Получение максимального KEY юнита, который есть в БД
//
  DBService.getMaxKey()
  .then((result) => {
      res.json(result);
    })
  .catch((err) => {
      res.status(500).json({ error: err });;
    });
}




//
// ///////    Функции по заданиям   //////////
//
  

const serveTasks = (req,res) => {
//
// Получение JSON списка заданий [GET]  - функция пока не работает и не используется
//
  DBService.getUnits(req.query.unit)
  .then((unitsList) => {
    //если массив вернулся не пустым
    if (unitsList.length !== 0) {
      //выводим JSON
      res.json(unitsList);
    } else {
      //говорим - внутренная ошибка сервера
      serveNotFound(req, res, 'Что-то пошло не так...', 'По вашему запросу ничего не найдено.', 500)
    }
  })
}

const serveOneTask = (req,res) => {
//
// Получение JSON выбранного задания [GET]
//
  DBService.getTaskByKey(req.params.uKey, req.params.tKey)
  .then((task) => {
    //если массив вернулся не пустым
    if (task.length !== 0) {
      //выводим JSON
      res.json(task);
    } else {
      //говорим - внутренная ошибка сервера
      serveNotFound(req, res, 'Что-то пошло не так...', 'По вашему запросу ничего не найдено.', 500)
    }
  })
  .catch((err) => {
    serveNotFound(req, res, 'Ошибка БД', err, 500)
  })
}


const serveNewTask = (req, res)  => {  
//
// Запись в БД нового задания [POST]
//
  //console.log('serveNewTask');
  DBService.newTask(req.params.key, req.body)
  .then((result) => {
      res.status(201).json(result);
    })
  .catch((err) => {
      res.status(500).end// json({ error: err });;
    });
  
}

const serveUpdateTask = (req, res) => {
//
// Обновление задания [PUT]
//
  if (!req.body) return res.sendStatus(400);
  
  DBService.updateTask(req.params.uKey, req.params.tKey, req.body)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: err });;
    });

}

const serveGetMaxTaskKey = (req, res) => {
//
//Получение максимального KEY задания, который есть в БД
//
  DBService.getMaxTaskKey(req.params.uKey)
  .then((result) => {
      res.json(result);
    })
  .catch((err) => {
      res.status(500).json({ error: err });;
    });
}


//
// ///////    Функции по пользователям   //////////
//

const serveNewUser = (req, res)  => {  
//
// Запись в БД нового пользователя [POST]
//
  //console.log('serveNewUser');
  DBService.newUser(req.user)
  .then((result) => {
      res.status(201).json(result);
    })
  .catch((err) => {
      res.status(500).end// json({ error: err });;
    });
  
}

const serveUpdateUser = (req, res) => {
//
// Обновление в БД пользователя [PUT]
//
  if (!req.body) return res.sendStatus(400);

  //console.log('serveUpdateUser', 'id=', req.params.id);
  
  DBService.updateUser(req.params.id, req.body)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: err });;
    });

}

const serveMe = (req, res) => {
  
  if (req.session && req.session.passport && req.session.passport.user) {
    res.json( JSON.parse(req.session.passport.user));
  } else {
    res.status(401).json({error: 'not authorized'})
  }

}

const serveUsers = (req,res) => {
//
// Получение JSON списка пользователей
//
  //console.log('serveUsers');
  DBService.getUsers(req.query)
  .then((userList) => {
    //если массив вернулся не пустым
    if (userList.length !== 0) {
      //выводим JSON
      res.json(userList);
    } else {
      //говорим - внутренная ошибка сервера
      serveNotFound(req, res, 'Что-то пошло не так...', 'По вашему запросу ничего не найдено.', 500)
    }
  })
}


const serveProgress = (req,res) => {
//
// Получить сколько всего заданий в курсе
//
  DBService.getProgress(req.params.uKey, req.params.tKey)
  .then((progress) => {
    //если массив вернулся не пустым
    if (progress.length !== 0) {
      //выводим JSON
      res.json(progress);
    } else {
      //говорим - внутренная ошибка сервера
      serveNotFound(req, res, 'Что-то пошло не так...', 'По вашему запросу ничего не найдено.', 500)
    }
  })
}


//
// ///////    Функции по комментариям   //////////
//

const serveNewComment = (req, res)  => {  
//
// Запись в БД нового комментария [POST]
//
  //console.log('serveNewTask');
  DBService.newComment(req.body)
  .then((result) => {
      res.status(201).json(result);
    })
  .catch((err) => {
      serveNotFound(req, res, 'Ошибка записи в БД.', err, 500)
    });
  
}

const serveComments = (req,res) => {
//
// Получение JSON списка всех комментариев [GET]
//
  DBService.getComments(req.query)
  .then((commentsList) => {
    //если массив вернулся не пустым
    if (commentsList.length !== 0) {
      //выводим JSON
      res.json(commentsList);
    } else {
      //говорим - внутренная ошибка сервера
      serveNotFound(req, res, 'Что-то пошло не так...', 'По вашему запросу ничего не найдено.', 200)
    }
  })
}



// Горячее обновление кода
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));
app.use(require("webpack-hot-middleware")(compiler));

// Подключаем мидлваре для обработки статичных файлов: html, css, jpg...
const staticMiddleware = express.static("public");
app.use(staticMiddleware);

//require("./pasport.js")(app);
passport(app, DBService);


app.get('/', serveSPA);
// Получить наибольший ключ юнита/задания
app.get('/api/maxkey', serveGetMaxKey);
app.get('/api/unit/:uKey/maxkey', serveGetMaxTaskKey);
// Получить юнит/задание
app.get('/api/unit', serveUnits);
app.get('/api/unit/:key', serveOneUnit);
app.get('/api/unit/:uKey/:tKey', serveOneTask);
// Пользователь
app.get('/api/me', serveMe);
app.get('/api/user', serveUsers);
// Сколько всего заданий
app.get('/api/progress/:uKey/:tKey', serveProgress);
// Комментарии
app.get('/api/comment', serveComments);



// Добавление нового юнита в БД
//app.post('/api/product', checkToken);
app.post('/api/unit', jsonParser, serveNewUnit);
// Добавление нового задания в БД
//app.post('/api/unit/:key', checkToken);
app.post('/api/unit/:key', jsonParser, serveNewTask);
// Добавление нового пользователя БД
app.post('/api/user', jsonParser, serveNewUser);
// Добавление нового комментария в БД
app.post('/api/comment', jsonParser, serveNewComment);

// Обновление полей юнита в БД
//app.put('/api/unit/:uKey', checkToken);
app.put('/api/unit/:uKey', jsonParser, serveUpdateUnit);
// Обновление полей задания в БД
//app.put('/api/unit/:uKey', checkToken);
app.put('/api/unit/:uKey/:tKey', jsonParser, serveUpdateTask);
// Обновление пользователя в БД
app.put('/api/user/:id', jsonParser, serveUpdateUser);


app.use(serveSPA);
//app.use(serveNotFound);


//app.set('trust proxy', '80.211.25.188');
app.listen(81, '0.0.0.0', function() {
  
  console.log("Server started");
  
});