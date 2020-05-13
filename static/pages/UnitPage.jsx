import React from "react";
import TasksList from "../components/TasksList.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import Unit from "../components/Unit.jsx";
import Task from "../components/Task.jsx";


const omit = require('lodash/omit');

export default class UnitPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          error: null,
          status: "idle",
          unit: [],
          tasks: []
        };
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
        
    }
    


    render() {
        const { status, error, tasks } = this.state;
        
        const taskNum = (this.props.match.params.tKey) ? this.props.match.params.tKey : 0;
        let taskName = '';
        if ((taskNum > 0) && (this.state.tasks.length > 0)) {
            let task = this.state.tasks.find(o => Number(o.tKey) == taskNum);
            taskName = task.name;
        }
        
        let TasksView;
        
        switch (status) {
            case "error": 
                TasksView = <div className="alert alert-danger" role="alert" >Ошибка: {error.message}</div>;
                break;
              
            case "pending": 
                TasksView = <div className="alert alert-primary" role="alert">Загружаем данные...</div>;
                break;
              
            case "ready":
                TasksView = <TasksList 
                                tasks={tasks}
                                root={`/unit/${this.props.match.params.uKey}/`} 
                                activeTask={taskNum}
                            > { (taskNum>0) ? <Task uKey={this.props.match.params.uKey} tKey={taskNum} name={taskName} /> : '' }
                            </TasksList>;
                break;
                
            case "idle":
            default:
                TasksView = <div className="alert alert-warning" role="alert">Странно, компонент нихрена не делает</div>;
        }
        
        const unitName = (status=="ready" && taskNum==0) ? '- ' + this.state.unit.name : "";
        const youAreHere = [
            {name: "Курс", link: "/"},
            {name: `Юнит ${this.props.match.params.uKey} ${unitName}`, link: `/unit/${this.props.match.params.uKey}`}
            ];
            
        if (taskNum) {
            youAreHere.push( {
                name: `Задание ${taskNum} - ${taskName}`,
                link: `/unit/${this.props.match.params.uKey}/${taskNum}`
            }) 
        };
        
        return <React.Fragment>
            <div className="row green">
                <div className="col s12">
                    <Breadcrumbs path={youAreHere}/>
                </div>
            </div>
            <div className="container top-offset">
                {(status=="ready") ? <Unit unit={this.state.unit}/>:"Загружаю данные..."}
                {TasksView}
                <br/>
            </div>
        </React.Fragment>
    }
}
        