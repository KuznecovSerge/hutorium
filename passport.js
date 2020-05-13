const express = require('express');
const passport = require('passport');
const eSession = require('express-session')
const AuthVKStrategy = require('passport-vkontakte').Strategy;

passport.use('vk', new AuthVKStrategy({
        clientID: '6770217', //config.get("auth:vk:app_id"),
        clientSecret: 'LbMl49lfmUKJpRbKSj1z' , //config.get("auth:vk:secret"),
        callbackURL: 'http://80.211.25.188/auth/vk/callback', //,config.get("app:url") + "/auth/vk/callback"
        profileFields: ['photo_200']
    },
    function (accessToken, refreshToken, profile, done) {
 
        //console.log("vk auth: ", profile);
        
        // Заглушка, которая выдаёт юзера
        // Тут должна быть проверка юзера в БД - подходит ли он нам
        // пример: User.findOrCreate(user).then( (user)=>{done(null, user);}).catch(done);
        
        // NEW
        // Авторизуем пользователя VK всегда, только не предоставляем ему доступ к курсу

 
        return done(null, {
            username: profile.displayName,
            photoUrl: profile.photos[0].value,
            photo200Url: profile.photos[1].value,
            profileUrl: profile.profileUrl,
            id: profile.id
        });
    }
));


//
// Этот метод вызывается после успешной авторизации
// 
// Сериализация - процесс перевода какой-либо структуры данных в любой другой
// 
// 1) Ваш авторизатор (свой или как у нас VK) отдаёт данные в объекте user
// 2) Вы формируете только те данные, которые нужно хранить - например только id и username
// 3) Passport с помощью модуля express-session записывает данные в сессию пользователя (по вызову done)
// 
// (метод вызывается один раз для записи в сессию)
passport.serializeUser(function (user, done) {
    //console.log('serializeUser', 'user=', user);
    done(null, JSON.stringify(user));
});
 
//
// Десериализация - перевод обратно
// Но в данном случае, метод будет доставать сохранённые данные из сессии и отдавать вам
// 
// Метод будет вызываться при "каждом обновлении страницы", ну т.е. где прописан роутинг для сессий
//
// Здесь вы можете, например для сохранённого id пользователя (в сессии), добавить время длительность его сеанса, 
// или запросить доп данные по пользователю из БД  
//
passport.deserializeUser(function (data, done) {
    //console.log('deserializeUser', 'data=', data);
    try {
        done(null, JSON.parse(data));
    } catch (err) {
        done(err)
    }
});

module.exports = function (app, DBService) {
    
    // Эти мидлеваре видимо нужны были для старых версий паспорта - без них пока всё работает
    //app.use(require('cookie-parser')());
    //app.use(require('body-parser').urlencoded({extended: true}));
    
    // Подлючаем мидлеваре Express-session, их далее используем Passport
    app.use(eSession({secret:'V nedrah tundry vydry v getrah', resave: true, saveUninitialized: true}));
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    app.get('/auth', function (req, res) {
 
        if (req.isAuthenticated()) {
            res.redirect('/login');
            return;
        }
 
        res.render('auth', {
            error: 'error'
        });
    });
    
    app.get('/sign-out', function (req, res) {
        req.logout();
        res.redirect('/login');
    });
    
    app.get('/auth/vk',
        passport.authenticate('vk', {
            //scope: ['friends']
        }),
        function (req, res) {
         console.log("проверка связи");
         // The request will be redirected to vk.com 
         // for authentication, so
         // this function will not be called.
        });
 
    app.get('/auth/vk/callback',
        passport.authenticate('vk', {
            failureRedirect: '/auth'
        }),
        function (req, res) {
            // Successful authentication
            //, redirect home.
            //console.log('req.session', req.session.passport.user);
            let id = JSON.parse(req.session.passport.user).id;
            // Добавляем поле - дата последнего доступа
            req.user.lastAccessDate = new Date();
            // Ищем пользователя в нашей БД
            DBService.getUserById(id)
            .then((user)=>{
                //console.log('user', user);
                // если пользователя нет в БД, то добавляем его
                if (!user) {
                    DBService.newUser(req.user)
                    .then((result) => {
                        res.redirect('/login');
                    })
                    .catch((err) => {
                        res.status(500).end({ error: err }); // json
                    });
                } else {
                    // обвновляем поля
                    DBService.updateUser(id, req.user)
                    .then((result) => {
                        //console.log('passport', 'updateUser', 'result=', result);
                    })
                    .catch((err) => {
                        //res.status(500).end({ error: err }); // json
                        console.log('passport', 'updateUser', 'ошибка обновления БД');
                    });
                    res.redirect('/login');
                }
            })
            .catch((err)=>{
                res.status(500).end({ error: err }); // json
            })
                
            
            
        });
    
}