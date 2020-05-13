/*
    Подгружает комментарии и позволяет добавить свой комментарий.
    
    Входные параметры:
        uKey - номер юнита
        tKey - номер задания в юните
        [userId] - комментарии какого юзера получить (если не указано - то авторизованного юзера)
*/

import React from "react";
import CommentsList from "../components/CommentsList.jsx";

const omit = require('lodash/omit');

export default class Comments extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            status: "idle",
            comments: [],
            newComment: {
                userId: 0,
                uKey: 0,
                tKey: 0,
                commentUser: 0,
                text: ''
            },
            save: '',
        };
    }
    
    componentDidMount() {
        this.setState({status: "pending" });
        this.getMe()
        .then((me) => {
            //console.log('me=', me);
            if(me.id) {
                let comment = omit(this.state.newComment);
                comment.userId = (this.props.userId) ? this.props.userId : me.id;
                comment.commentUser = me.id;
                comment.uKey = this.props.uKey;
                comment.tKey = this.props.tKey;
                this.setState({
                    newComment: comment
                });
                //console.log('this.state.newComment=', this.state.newComment);
                // Загружаем комментарии пользователя
                this.getComments(comment.userId);
            } else {
                this.setState({
                    error: 'Не авторизован',
                    status: "error",
                });
                
            }
        });
        
    }
    
    getMe() {
        
        return fetch(`/api/me`).then(res => res.json());
        
        
        // return new Promise((resolve, reject) => {
        //     fetch(`/api/me`)
        //     .then(res => res.json())
        //     .then((user) => {
        //         console.log(user);
        //         resolve(user);
        //     })
        // });
    }
    
    getComments(userId) {
        fetch(`/api/comment?userId=${userId}&uKey=${this.props.uKey}&tKey=${this.props.tKey}`)
          .then(res => res.json())
          .then(
            (comments) => {
                if (!comments.error) {
                    //console.log('load ok - comments=', comments);
                    this.setState({
                        status: "ready",
                        comments: comments,
                    });
                } else {
                   this.setState({
                        status: "error",
                        error: comments.error
                    });
                }
            })
          .catch(
            (error) => {
              this.setState({
                status: "error",
                error
              });
            }
        );
    }
    
    onChange (event) {
        this.state.newComment["text"] = event.target.value;
        this.forceUpdate();
    }
    
    onSave (event) {
        event.preventDefault();
        
        console.log('saveComment');
        
        fetch(`/api/comment`, {
            method: "post",
            credentials: "same-origin",
            body: JSON.stringify(this.state.newComment),
            headers: {
              "Content-Type": "application/json"
            }
        })
        .then((res) => {
            //console.log('fetch - response');
            return res.json();
        })
        .then(
          (result) => {
            if (!result.error) {
                const comment = result;
                //console.log('save ok - return comment=', comment);
                this.state.comments.push(comment);
                this.forceUpdate();
                this.newComment = [];
                this.setState({
                  save: "Новый комментарий добавлен",
                });
            } else {
                this.setState({
                  save: (result.error) ? "Ошибка сохранения: " + result.error: "",
                });
                if (result.status === 401) {
                  this.setState({
                    //toggleShowLogin: !this.state.toggleShowLogin
                  })
                };
            }
        });
    }
    
    onModerate (event) {
        event.preventDefault();
        
        console.log('Отправить на модерацию');
    }
    
    render() {
      
        const { status, error, comments } = this.state;
        let CommentsView;
        
        //console.log(comments);
        
        switch (status) {
            case "error": 
                CommentsView = <div className="alert alert-danger" role="alert" >Ошибка: {error.error}</div>;
                break;
              
            case "pending": 
                CommentsView = <div className="alert alert-primary" role="alert">Загружаем данные...</div>;
                break;
              
            case "ready":
                CommentsView = <CommentsList comments={comments} />;
                break;
                
            case "idle":
            default:
                CommentsView = <div className="alert alert-warning" role="alert">Странно, компонент нихрена не делает</div>;
        }
        
        return <React.Fragment>
            {CommentsView}
            <div className="task-state__comment-block has-comments">
                <div className="task-status green-text text-darken-4">Статус: Завершен</div>
                <div className="input-field">
                    <textarea className="materialize-textarea" name="text" onChange={this.onChange.bind(this)}></textarea>
                    <label>Комментарий</label>
                </div>
                <div className="task-state__comment-block__actions">
                    <button className="btn btn-flat waves-light light-blue darken-3 white-text"
                            onClick={ this.onSave.bind(this) }
                            >Комментировать
                    </button>
                    <button className="btn btn-flat waves-light green darken-1 white-text"
                            onClick={ this.onModerate.bind(this) }
                            >Отправить на проверку
                    </button>
                </div>
                <div>{this.state.save}</div>
            </div>
        </React.Fragment>

    }
}



