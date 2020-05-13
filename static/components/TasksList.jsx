import React from "react";
import { Link } from "react-router-dom";


export default class TasksList extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
          activeIndex: 0
        };
	}
    
    
    render() {
        
        const taskNum = (this.props.activeTask) ? this.props.activeTask : 0;
        
        let itemsList = this.props.tasks.map(task => (
                                    <li className="step  step_status_40" data-index={task.tKey} key={task.tKey}>
                                        <Link className="step-title no-after waves-effect waves-dark" 
                                            to={`${this.props.root}${(taskNum != task.tKey) ? task.tKey : ''}`}
                                            >{task.name}
                                        </Link>
                                        {(taskNum == task.tKey) && this.props.children }
                                    </li>
                                ));
        
        return <ul className="stepper linear task-list">
            {itemsList}
        </ul>
    }
}