import React from "react";
import Comments from "../components/Comments.jsx";

export default class Task extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
          error: null,
          status: "idle",
          task: []
        };
    }
    
    componentDidMount() {
        this.setState({status: "pending" });
        fetch(`/api/unit/${this.props.uKey}/${this.props.tKey}`)
          .then(res => res.json())
          .then(
            (task) => {
                this.setState({
                    status: "ready",
                    task: task,
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
                const taskHtml = task.html;
                TaskView = <div dangerouslySetInnerHTML={{__html : taskHtml}} />;
                break;
                
            case "idle":
            default:
                TaskView = <div className="alert alert-warning" role="alert">Странно, компонент нихрена не делает</div>;
        }
        
        return <div className="step-content">
            <div className="task">
                <div className="markdown-body">
                    <h1>Задание {this.props.tKey} - {this.props.name}</h1>
                    {TaskView}
                </div>
                
                { (status == "ready") && <Comments uKey={this.props.uKey} tKey={this.props.tKey} />}
            </div>
        </div>;
    }
}