import React from "react";

export default class Unit extends React.Component {
    render() {
        let unitHtml = this.props.unit.html;
        
        return <div className="">
            <h5>Юнит {this.props.unit.uKey} - {this.props.unit.name}</h5>
            <div className="markdown-body" dangerouslySetInnerHTML={{__html : unitHtml}} />
        </div>;
    }
}