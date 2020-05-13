import React from "react";
import TasksList from "../components/TasksList.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

const omit = require('lodash/omit');

export default class PanelUnitPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          error: null,
          status: "idle",
          unit: [],
          saveUnit: "",
          tasks: [],
          isOpenNewTask: false,
          newTask: {
              tKey: 0,
              name: "",
              html: ""
          },
          saveTask: ""
        };
    }
    
    newTask() {
        fetch(`/api/unit/${this.props.match.params.uKey}/maxkey`)
        .then(res => res.json())
        .then((result) => {
            //console.log('newTask','getMaxKey', 'result=', result);
            const newTask = this.state.newTask;
            delete newTask.tKey;
            newTask.tKey = result.maxkey+1;
            newTask.name = `Задание ${newTask.tKey}`;
            newTask.html = `Блок html-кода`;
            this.setState({
                newTask: newTask
            });
        })
    }
    
    componentDidMount() {
        this.setState({status: "pending" });
        fetch(`/api/unit/${this.props.match.params.uKey}`)
          .then(res => res.json())
          .then(
            (result) => {
                const unit_patch = omit(result, ['tasks']);
                this.setState({
                    status: "ready",
                    unit: unit_patch,
                    tasks: result.tasks
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
        
        this.newTask();
    }
    
    unitForm() {
        return <form id="unit">
                    <div className="form-group">
                        <label htmlFor="inputKey">Номер юнита</label>
                        <input className="form-control"
                            name="uKey"
                            value={ this.state.unit.uKey } 
                            onChange={ this.onChangeUnit.bind(this) }
                        />
                        <small id="keyUnitHelp" className="form-text text-muted">Порядковый номер юнита.</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="inputTitle">Наименование юнита</label>
                        <input className="form-control"
                            name="name"
                            value={ this.state.unit.name } 
                            onChange={ this.onChangeUnit.bind(this) }
                        />
                        <small id="nameUnitHelp" className="form-text text-muted">Пожалуйста, не превышайте 100 символов.</small>
                    </div> 
                    <div className="form-group">    
                        <label htmlFor="inputDescription">HTML-блок</label>
                        <textarea className="form-control" rows="5"
                            name="html"
                            value={ this.state.unit.html } 
                            onChange={ this.onChangeUnit.bind(this) }
                        />
                        <small id="htmlUnitHelp" className="form-text text-muted">HTML-блок юнита.</small>
                    </div>   
                    <button type="submit" className="btn btn-primary"
                        onClick={ this.onSaveUnit.bind(this) }
                        >Сохранить</button>
                    <label className="pl-2" htmlFor="buttonSave">{this.state.saveUnit}</label>
                </form>
    }
    
    onChangeUnit (event) {
        if (this.state.saveUnit) this.state.saveUnit = '';
        const name = event.target.name;
        this.state.unit[name] = event.target.value;
        this.forceUpdate();
    }
    
    onSaveUnit (event) {
        event.preventDefault();
        fetch(`/api/unit/${this.props.match.params.uKey}`, {
            method: "put",
            credentials: "same-origin",
            body: JSON.stringify(this.state.unit),
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
                const unit= result;
                this.setState({
                  status: "ready",
                  saveUnit: "Изменения сохранены",
                  unit: unit
                });
            } else {
                this.setState({
                  saveUnit: (result.error) ? "Ошибка сохранения: " + result.error: ""
                });
                if (result.status === 401) {
                  this.setState({
                    //toggleShowLogin: !this.state.toggleShowLogin
                  });
                }
            }
        })
        .catch( (err) => {
            this.setState({
              status: "ready",
              saveUnit: err
            });
        });
    }
    

    
    taskForm() {
        return <form id="task">
                    <div className="form-group">
                        <label htmlFor="inputKey">Номер задания</label>
                        <input className="form-control"
                            name="tKey"
                            value={ this.state.newTask.tKey } 
                            onChange={ this.onChangeTask.bind(this) }
                        />
                        <small id="keyTaskHelp" className="form-text text-muted">Порядковый номер задания.</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="inputTitle">Наименование задания</label>
                        <input className="form-control"
                            name="name"
                            value={ this.state.newTask.name } 
                            onChange={ this.onChangeTask.bind(this) }
                        />
                        <small id="nameTaskHelp" className="form-text text-muted">Пожалуйста, не превышайте 100 символов.</small>
                    </div> 
                    <div className="form-group">    
                        <label htmlFor="inputDescription">HTML-блок</label>
                        <textarea className="form-control" rows="5"
                            name="html"
                            value={ this.state.newTask.html } 
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
    
    showNewTask(event) {
        this.setState({
            isOpenNewTask: !this.state.isOpenNewTask
        })
    }
    
    onChangeTask (event) {
        if (this.state.saveTask) this.state.saveTask = '';
        const name = event.target.name;
        this.state.newTask[name] = event.target.value;
        this.forceUpdate();
    }
    
    onSaveTask (event) {
        event.preventDefault();
        
        console.log('save');
        
        fetch(`/api/unit/${this.props.match.params.uKey}`, {
            method: "post",
            credentials: "same-origin",
            body: JSON.stringify(this.state.newTask),
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
                const task = result;
                this.state.tasks.push(task);
                this.forceUpdate();
                this.newTask();
                this.setState({
                  save: "Новое задание добавлено",
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
    
    
    render() {
        const { status, error, tasks } = this.state;
        
        let TasksView;
        
        switch (status) {
            case "error": 
                TasksView = <div className="alert alert-danger" role="alert" >Ошибка: {error.message}</div>;
                break;
              
            case "pending": 
                TasksView = <div className="alert alert-primary" role="alert">Загружаем данные...</div>;
                break;
              
            case "ready":
                TasksView = <TasksList tasks={tasks} root={`/panel/unit/${this.props.match.params.uKey}/`}/>;
                break;
                
            case "idle":
            default:
                TasksView = <div className="alert alert-warning" role="alert">Странно, компонент нихрена не делает</div>;
        }
        
        const formAddTask = (status=="ready" && this.state.isOpenNewTask)  ? this.taskForm() : '';
        
        const unitName = (status=="ready") ? this.state.unit.name : "";
        const youAreHere = [{name: "Курс", link: "/"},
                            {name: "Панель", link: "/panel"},
                            {name: "Курс", link: "/panel/unit"},
                            {name: `Юнит ${this.props.match.params.uKey} - ${unitName}`, link: `/panel/unit/${this.props.match.params.uKey}`}];
        
        return <React.Fragment>
            <div className="row green">
                <div className="col s12">
                    <Breadcrumbs path={youAreHere}/>
                </div>
            </div>
            <div className="container top-offset">
                {(status=="ready") ? this.unitForm():"Загружаю данные..."}
                <div>UnitsList</div>
                <br/>
                {TasksView}
                <br/>
                <button onClick={this.showNewTask.bind(this)}>{(!this.state.isOpenNewTask) ? "Добавить задание": "Скрыть форму"}</button>
                {formAddTask}
            </div>
        </React.Fragment>
    }
}
        