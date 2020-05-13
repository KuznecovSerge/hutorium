import React from "react";
import Comments from "../components/Comments.jsx";

const moment = require('moment');

export default class UserEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          error: null,
          status: "idle",
          user: {
              access: 0
          },
          save: "-",
          progress: 0,
          showComments: 0,
        };
    }
    
    componentDidMount() {
        
        let user = this.props.user;
        if (!this.state.user.uKey) user.uKey = 1;
        if (!this.state.user.tKey) user.tKey = 1;
        //console.log(user);
        
        this.setState({
            user: user
        });
        
        //console.log(user);
        
        fetch(`/api/count/${user.uKey}/${user.tKey}`)
        .then((result)=>{
            this.setState({
                progress : result.progress
            })
        })
        
    }
    
    onChange (event) {
        if (this.state.save) this.state.save = '';
        const name = event.target.name;
        let value = event.target.value;
        if (name == 'access') {
            value = !this.state.user[name];
        } else {
            value = value;
        }
        
        //console.log(event.target.name, value);
        this.state.user[name] = value;
        this.forceUpdate();
    }
    
    onSave (event) {
        event.preventDefault();
        
        //console.log('save', this.state.user);
        
        fetch(`/api/user/${this.props.user.id}`, {
            method: "put",
            credentials: "same-origin",
            body: JSON.stringify(this.state.user),
            headers: {
              "Content-Type": "application/json"
            }
        })
        .then((res) => {
            return res.json();
        })
        .then(
          (result) => {
            if (!result.error) {
                const user = result;
                this.setState({
                    save: "Настройки сохранены",
                    user: user
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
    
    onShowComments() {
        this.setState({
            showComments: !this.state.showComments,
        });
    }
    
    render () {
        
        const {user} = this.state;
        
        let date = new Date(user.lastAccessDate);
        let lastAccess = '';
        if (user.lastAccessDate) {
            //console.log(user.lastAccessDate.toString());
            //lastAccess =  `${date.getDate()}.${('0' + (date.getMonth()+1)).slice(-2)}.${date.getFullYear()} в ${date.getUTCHours()+3}:${('0' + (date.getMinutes())).slice(-2)}`;
            lastAccess = moment(date).format('DD.MM.YYYY в HH:mm');
        }
        
        return <div className="me">
                    <div className="me__line">
                        <div className="me__ava">
                            <img className="responsive-img circle" src={this.props.user.photo200Url} />
                        </div>
                        <div className="me__info">
                            <div><a href={user.profileUrl} target="_blank">{user.username}</a></div>
                            <div>В последний раз был <b>{lastAccess}</b></div>
                            <div className="me__line">Выполняет задание {user.uKey}-{user.tKey}
                                <div className="progress">
                                    <div className="determinate" style={{width: this.state.progress+'%'}}></div>
                                </div>
                            </div>

                            <div className="switch">
    
                                <span style={{marginRight: '20px'}}>Доступ к курсу:</span><label>
                                  Выкл
                                  <input name="access" type="checkbox" 
                                        onChange={this.onChange.bind(this)}
                                        // defaultChecked={user.access} 
                                        checked={user.access} />
                                  <span className="lever"></span>
                                  Вкл
                                </label>
                            </div>
                            
                            <br/>
                            <button name="save" onClick={this.onSave.bind(this)} className={(this.state.save=='') ? 'waves-effect waves-light btn' : 'waves-effect waves-light btn disabled'}>Сохранить</button>
                            
                        </div>
                    </div>
                    
                    <br/>

                    <div className="me__line" style={{'line-height': '2'}}>
                    Статус: выполняет задание
                    </div>
                    
                    <div className="me__line" style={{'line-height': '2'}}>
                        
                            <div className="switch">
                                Комментарии:
                                <label>
                                  <input name="access" type="checkbox" 
                                        onChange={this.onShowComments.bind(this)}
                                        checked={this.state.showComments} />
                                  <span className="lever"></span>
                                  Показать
                                </label>
                            </div>
                        
                    </div>
                    
                    {(!this.state.showComments) ? '' : <div className="me__line">    
                        <Comments uKey={user.uKey} tKey={user.tKey} userId={this.props.user.id}/>
                    </div>
                    }
                    
                    <br/>
                    
                    <div className="me__line">
                    <button className='waves-effect waves-light btn' style={{marginRight: '20px'}}>Одобрить</button>
                    <button className='waves-effect waves-light btn' disabled={user.lastStatus!=='moderate'}>Отправить на доработку</button>
                    </div>
                    
                    <br/>
                    <br/>
                </div>
    }
    
}