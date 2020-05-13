import React from "react";
const moment = require('moment');
//require('moment/locale/ru');

export default class CommentsList extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
          activeIndex: 0
        };
	}
    
    
    render() {
        
        //console.log('new comments array=', this.props.comments);
        
        let itemsList = this.props.comments.map(
            (comment, index) => {
                let date = new Date(comment.date);
                //let dateHuman = `${date.getDate()}.${('0' + (date.getMonth()+1)).slice(-2)}.${date.getFullYear()} в ${date.getUTCHours()+3}:${('0' + (date.getMinutes())).slice(-2)}`;
                //moment.locale('ru');
                let dateHuman = moment(date).format('DD.MM.YYYY в HH:mm');
                return <li key={index} className="task-state-event collection-item avatar">
                    <img src={comment.user[0].photoUrl} className="circle" />
                    <div className="title">{comment.user[0].username}</div>
                    <span className="task-event__datetime">{dateHuman}</span>
                    <div className="task-event__text">
                        <p>{comment.text}</p>
                    </div>
                </li>
            }
        );
        
        return <ul className="collection task-state__events">
            {itemsList}
        </ul>
    }
}