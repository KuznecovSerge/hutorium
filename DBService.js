const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const omit = require('lodash/omit');

let shopDatabase;
let taskCollection;
let userCollection;
let commentCollection;

module.exports = {
    init() {
    MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true })
        .then(function (clientInstance) {
            shopDatabase = clientInstance.db("hutorium");
            taskCollection = shopDatabase.collection("task");
            userCollection = shopDatabase.collection("user");
            commentCollection = shopDatabase.collection("comment");
        })
    },
    
    //
    // ---------- Функции по Юнитам  ---------
    // 
    getUnits(where) {
        if (where.uKey) {
            where.uKey = Number(where.uKey);
        }
        return taskCollection.find(where, {projection:{uKey:1, name:1}}).toArray();
    },
    getUnitByKey(key) {
        return taskCollection.findOne({'uKey':Number(key)}, 
            {projection:{uKey:1, name:1, html:1, "tasks.tKey": 1, "tasks.name": 1}});
    },
    
    getMaxKey() {
        return new Promise((resolve, reject) => {
            const maxKey = taskCollection.find({}, {projection:{uKey:1}}).sort({uKey: -1}).limit(1).toArray()
            .then((unit) => {
                resolve({maxkey: unit[0].uKey});
            })
            .catch((e) => reject(e));
        });
    },
    newUnit(unit) {
        return new Promise((resolve, reject) => {
            console.log('DBService', 'unit:', unit);
            let error;
            // проверки данных
            if (!isNaN(unit.uKey)) {
                let key=Number(unit.uKey);
                delete unit.uKey;
                unit.uKey=key;
            } else error="Поле key должно быть числовым";
            
            if (error) throw error;
            
            unit.tasks=[];
            
            //console.log('DBService', 'before insert, json:', unit);
            
            taskCollection.insertOne(unit)
            .then((result) => {
                console.log('after insert, result.ops[0]:',result.ops[0]);
                resolve(result.ops[0]);
            })
            .catch(() => {
                reject("Добавить юнит в БД неудалось!");
            })
            
        })
    },
    
    updateUnit(uKey, patch) {
        //console.log('updade unit');
        let error='';
        const mongo_patch = omit(patch, ['_id']);
        
        // проверки данных
        if (!isNaN(mongo_patch.uKey)) {
            let key=Number(mongo_patch.uKey);
            delete mongo_patch.uKey;
            mongo_patch.uKey=key;
        } else error="Поле key должно быть числовым";
        

        return new Promise((resolve, reject) => {
            if (error) reject(error);
            //console.log('before update, patch=', mongo_patch, ' uKey=', uKey);
            taskCollection.updateOne(
                { uKey: Number(uKey) },
                {
                    // $set - обновляет только указанные поля, а не заменяет польностью объект 
                    $set:mongo_patch      
                }
            )
            .then((response) => {
                //console.log('after update, result=', response.result);
                resolve(this.getUnitByKey(uKey));
            })
            .catch((e) => {reject(e)});
        });
    },
    
    //
    // ---------- Функции по Task'ам (задачам) ---------
    // 
    getTasks(uKey) {
        if (uKey) {
              uKey = Number(uKey);
        }
        return taskCollection.find({'uKey': uKey}, {projection:{tasks:1}}).toArray();
    },
    getTaskByKey(uKey, tKey) {
        if (uKey) uKey = Number(uKey);
        if (tKey) tKey = Number(tKey);
        return new Promise((resolve, reject) => {
            taskCollection.findOne({'uKey': uKey, 'tasks.tKey': tKey}, 
                {
                    projection:{'_id': 0, 'tasks': {$elemMatch: {'tKey': tKey} } }
                })
            .then((unit) =>{
                //console.log(unit); // output: { tasks: [ { name: 'Задание 2', html: 'Блок html-кода', tKey: 2 } ] }
                if (unit) {
                    resolve(unit.tasks[0]);
                } else reject("Задание не найдено!");
            })
            .catch((err) => {
                reject("Ошибка БД:", err);
            });
        });
    },
    getMaxTaskKey(uKey) {
        if (uKey) {
              uKey = Number(uKey);
        }
        return new Promise((resolve, reject) => {
            taskCollection.findOne({uKey: uKey}, {projection:{"_id":0, "tasks.tKey":1}})
            .then((unit) => {
                let max = -1;
                unit.tasks.map((task) => {
                    if (task.tKey > max) max=task.tKey;
                });
                //console.log(max);
                resolve({maxkey: max});
            })
            .catch((e) => reject(e));
        });
    },
    newTask(uKey, task) {
        return new Promise((resolve, reject) => {
            //console.log('DBService', 'task:', task);
            let error;
            // проверки данных
            if (!isNaN(task.tKey)) {
                let key=Number(task.tKey);
                delete task.tKey;
                task.tKey=key;
            } else error="Поле key должно быть числовым";
            
            if (error) throw error;
            
            //console.log('DBService', 'before insert, json:', task);
            
            taskCollection.updateOne(
                { uKey: Number(uKey) },
                {
                    // $set - обновляет только указанные поля, а не заменяет польностью объект 
                    $push: {"tasks": task}      
                }
            )
            .then((result) => {
                //console.log('after insert, result:',result);
                if (result.modifiedCount > 0) {
                    this.getTaskByKey(uKey, task.tKey)
                    .then((task) => {
                        resolve(task);
                    })
                    .catch((err) => {
                        reject("Ошибка БД:", err);
                    });
                } else {
                    reject("Добавить задание в БД неудалось!");
                };
            })
            .catch((err) => {
                //console.log('error after insert:', err);
                reject("Добавить задание в БД неудалось!");
            })
            
        })
    },
    
    updateTask(uKey, tKey, patch) {
        //console.log('updade task');
        if (uKey) uKey = Number(uKey);
        if (tKey) tKey = Number(tKey);
        let error='';
        const mongo_patch = omit(patch, ['_id']);
        
        // проверки данных
        if (!isNaN(mongo_patch.tKey)) {
            let key=Number(mongo_patch.tKey);
            delete mongo_patch.tKey;
            mongo_patch.tKey=key;
        } else error="Поле tKey должно быть числовым";

        return new Promise((resolve, reject) => {
            if (error) reject(error);
            //console.log('before update, patch=', mongo_patch, ' uKey=', uKey, ' tKey=', tKey);
            
            taskCollection.updateOne(
                { uKey: uKey, 'tasks.tKey': tKey},
                {
                    // $set - обновляет только указанные поля, а не заменяет польностью объект 
                    $set: {'tasks.$' : mongo_patch}      
                }
            )
            .then((response) => {
                //console.log('after update, result=', response.result);
                resolve(this.getTaskByKey(uKey, tKey));
            })
            .catch((e) => {reject(e)});
        });
    },
    /*
    getTaskById(prodId) {

        return new Promise((resolve, reject) => {
            let o_id;
            try {
                o_id = new ObjectId(prodId);
                resolve(taskCollection.findOne({"_id": o_id}));
            } catch (e) {reject(e)}; 
            });
    },
    */
    
    getProgress(uKey, tKey){
        return new Promise((resolve, reject) => {
            taskCollection.aggregate(
                {$match: {}},
                {$project: {_id: 0, uKey: 1, 'tasks.tKey': 1, }},
                {$unwind: "$tasks.tKey"},
                // {$group:
                //     { total: {$count: '$tasks.tKey'} }
                // }
            ).toArray()
            .then((result)=>{
                let taskCount = 0;
                let thisTask = 0;
                let nextTask = false;
                let uKeyNext = uKey+1; let tKeyNext = 1; 
                //перебираем массив объектов
                result.forEach((unit)=>{
                    //console.log(unit.uKey);
                    unit.tasks.forEach((task)=>{
                        taskCount++;
                        // запоминаем следующее задания, если стоит флаг nextTask
                        if (nextTask) {uKeyNext = unit.uKey; tKeyNext = task.tKey; nextTask = false};
                        // запоминаем сквозной номер текущего задания; устанавливаем флаг - nextTask
                        if ((unit.uKey == uKey) && (task.tKey == tKey)) {thisTask = taskCount; nextTask = true};
                    })
                });
                //console.log('taskCount', taskCount, '   thisTask=', thisTask);
                let progress = Math.round(thisTask * 100 / taskCount);
                resolve({taskCount: taskCount, thisTask: thisTask, progress: progress, uKeyNext: uKeyNext, tKeyNext: tKeyNext});
            })
            .catch((err)=>{
                reject(err);
            });
        });
    },
    
    //
    // ---------- Функции по пользователям ---------
    //
    
    getUsers(where) {
        if (where.id) {
            where.id = Number(where.id);
        }
        return userCollection.find(where, {projection:{_id:0}}).toArray();
    },
    
    getUserById(id){
        //console.log(id);
        return userCollection.findOne({'id': Number(id)});
    },
    newUser(user){
        let error='';
        if (!user) {
            error='Параметры функции не указаны: нет полей id, username, photoUrl и profileUrl';
        } else if (!user.id) {
            error='Не все параметры указаны: нет поля id';
        } else if (!user.username) {
            error='Не все параметры указаны: нет поля username';
        } else if (!user.photoUrl) {
            error='Не все параметры указаны: нет поля photoUrl';
        } else if (!user.profileUrl) {
            error='Не все параметры указаны: нет поля profileUrl';
        };
        
        user.access = false;
        user.lastAccessDate = new Date();
        user.lastStatus = "inwork";
        
        return new Promise((resolve, reject) => {
            if (error) throw error;
            
            userCollection.insertOne(user)
            .then((result) => {
                resolve(result.ops[0]);
            })
            .catch(() => {
                reject("Добавить пользователя в БД неудалось!");
            })
        })
    },
    
    updateUser(id, patch){
        let error='';
        
        let user_patch = omit(patch, ['_id']);

        // проверки данных
        if (!isNaN(user_patch.id)) {
            let id=Number(user_patch.id);
            delete user_patch.id;
            user_patch.id=id;
        } else error="Поле id должно быть числовым";
        
        //user_patch.lastAccessDate = new Date(); // перенёс в passport, чтобы не изменялось при обновлении из админки
        
        //console.log('updateUser', 'id=', id, '   user_patch=', user_patch);

        return new Promise((resolve, reject) => {
            if (error) throw error;
            
            userCollection.updateOne(
                { id: Number(id)},
                { $set: user_patch }
            )
            .then((result) => {
                //console.log('result=', result.result)
                resolve(this.getUserById(id));
            })
            .catch(() => {
                reject("Обновить пользователя в БД неудалось!");
            })
        })
    },
    
    
    
    
    
    //
    // ---------- Функции по Комментариями  ---------
    // 
    newComment(comment) {
        return new Promise((resolve, reject) => {
            //console.log('DBService', 'comment:', comment);
            let error;
            // проверки данных
            if (!isNaN(comment.userId)) {
                let userId=Number(comment.userId);
                delete comment.userId;
                comment.userId=userId;
            } else error="Поле userId должно быть числовым";
            if (!comment.userId) error="Не указан id пользователя владельца";
            if (!comment.uKey) error="Не указан номер юнита uKey";
            if (!isNaN(comment.uKey)) {
                let key=Number(comment.uKey);
                delete comment.uKey;
                comment.uKey=key;
            } else error="Поле uKey должно быть числовым";

            if (!comment.tKey) error="Не указан номер задания tKey";
            if (!isNaN(comment.tKey)) {
                let key=Number(comment.tKey);
                delete comment.tKey;
                comment.tKey=key;
            } else error="Поле tKey должно быть числовым";
            
            if (!comment.commentUser) error="Не указан id пользователя, написавшего комментарий";
            if (!comment.text) error="Пустой текст комментария";
            //
            
            comment.date = new Date();
            
            
            // if (error) reject(error);
            // if (error) throw error; 
            
            
            //console.log('DBService', 'before insert, json:', unit);
            if (error) reject(error)
            else commentCollection.insertOne(comment)
            .then((result) => {
                let comment = result.ops[0];
                //console.log('after insert, result.ops[0]:',result.ops[0]);
                if (comment.commentUser) {
                    this.getUserById(comment.commentUser)
                        .then((user) => {
                            comment.user = [];
                            comment.user.push(user);
                            resolve(comment);
                        })
                        .catch((err) => {reject(err)})
                } else reject("Добавить комментарий в БД неудалось!")
            })
            .catch(() => {
                reject("Добавить комментарий в БД неудалось!");
            })
            
        })
    },
    
    getComments(where) {
        if (where.uKey) {
            where.uKey = Number(where.uKey);
        }
        if (where.tKey) {
            where.tKey = Number(where.tKey);
        }
        if (where.userId) {
            where.userId = Number(where.userId);
        }
        if (where.commentUser) {
            where.commentUser = Number(where.commentUser);
        }


        //return commentCollection.find(where, {projection:{_id:0}}).sort({date: 1}).toArray();
        
        return commentCollection.aggregate(
                {$match: where},
                {$lookup: {from: "user",localField: "commentUser",foreignField: "id",as: "user"}},
                {$project: { 
                    _id: 0,
                    'user._id': 0
                }},
            ).sort({date: 1}).toArray();

    },
    
 //...

};

