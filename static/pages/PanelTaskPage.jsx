import React from "react";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

const omit = require('lodash/omit');

export default class PanelTaskPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          error: null,
          status: "idle",
          task: [],
          saveTask: ""
        };
    }
    
    componentDidMount() {
        this.setState({status: "pending" });
        fetch(`/api/unit/${this.props.match.params.uKey}/${this.props.match.params.tKey}`)
          .then(res => res.json())
          .then(
            (result) => {
                const task_patch = omit(result, ['_id']);
                this.setState({
                    status: "ready",
                    task: task_patch
                });
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
    
    
    taskForm() {
        return <form id="task">
                    <div className="form-group">
                        <label htmlFor="inputKey">Номер задания</label>
                        <input className="form-control"
                            name="tKey"
                            value={ this.state.task.tKey } 
                            onChange={ this.onChangeTask.bind(this) }
                        />
                        <small id="keyTaskHelp" className="form-text text-muted">Порядковый номер задания.</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="inputTitle">Наименование задания</label>
                        <input className="form-control"
                            name="name"
                            value={ this.state.task.name } 
                            onChange={ this.onChangeTask.bind(this) }
                        />
                        <small id="nameTaskHelp" className="form-text text-muted">Пожалуйста, не превышайте 100 символов.</small>
                    </div> 
                    <div className="form-group">    
                        <label htmlFor="inputDescription">HTML-блок</label>
                        <textarea className="form-control" rows="5"
                            name="html"
                            value={ this.state.task.html } 
                            onChange={ this.onChangeTask.bind(this) }
                        />
                        <small id="htmlHelp" className="form-text text-muted">HTML-блок задания.</small>
                    </div>   
                    <button type="submit" className="btn btn-primary"
                        onClick={ this.onSaveTask.bind(this) }
                        >Сохранить</button>
                    <label className="pl-2" htmlFor="buttonSave">{this.state.saveTask}</label>
                </form>
    }
    
    onChangeTask (event) {
        if (this.state.saveTask) this.state.saveTask = '';
        const name = event.target.name;
        this.state.task[name] = event.target.value;
        this.forceUpdate();
    }
    
    onSaveTask (event) {
        event.preventDefault();
        
        console.log('save');
        
        fetch(`/api/unit/${this.props.match.params.uKey}/${this.props.match.params.tKey}`, {
            method: "put",
            credentials: "same-origin",
            body: JSON.stringify(this.state.task),
            headers: {
              "Content-Type": "application/json"
            }
        })
        .then((res) => {
            console.log('fetch - response');
            return res.json();
        })
        .then(
          (result) => {
            if (!result.error) {
                const task= result;
                this.setState({
                  status: "ready",
                  saveTask: "Изменения сохранены",
                  task: task
                });
            } else {
                this.setState({
                  saveTask: (result.error) ? "Ошибка сохранения: " + result.error: ""
                });
                if (result.status === 401) {
                  this.setState({
                    //toggleShowLogin: !this.state.toggleShowLogin
                  });
                }
            }
        })
    }
    
    
    render() {
        const { status, error, task } = this.state;
        
        let TaskView;
        
        switch (status) {
            case "error": 
                TaskView = <div className="alert alert-danger" role="alert" >Ошибка: {error.message}</div>;
                break;
              
            case "pending": 
                TaskView = <div className="alert alert-primary" role="alert">Загружаем данные...</div>;
                break;
              
            case "ready":
                TaskView = this.taskForm();
                break;
                
            case "idle":
            default:
                TaskView = <div className="alert alert-warning" role="alert">Странно, компонент нихрена не делает</div>;
        }
        
        const taskName = (status=="ready") ? this.state.task.name : "";
        const youAreHere = [{name: "Курс", link: "/"},
                            {name: "Панель", link: "/panel"},
                            {name: "Курс", link: "/panel/unit"},
                            {name: `Юнит ${this.props.match.params.uKey}`, link: `/panel/unit/${this.props.match.params.uKey}`},
                            {name: `Задание ${this.props.match.params.tKey} - ${taskName}`, link: `/panel/unit/${this.props.match.params.uKey}/${this.props.match.params.tKey}`}];
        
        return <React.Fragment>
            <div className="row green">
                <div className="col s12">
                    <Breadcrumbs path={youAreHere}/>
                </div>
            </div>
            <div className="container top-offset">
                <div>Task</div>
                <br/>
                {TaskView}
                <br/>
            </div>
        </React.Fragment>
    }
}
        