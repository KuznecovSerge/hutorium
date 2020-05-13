import React from "react";
import { Link } from "react-router-dom";

export default class UnitsList extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
          activeIndex: 0
        };
	}
    
    
    render() {
        
        let itemsList = this.props.units.map(unit => (
                                    <li className="collection-item" key={unit.uKey}>
                                        <Link to={`${this.props.root}${unit.uKey}`}>#{unit.uKey}. {unit.name}</Link>
                                    </li>
                                ));
        
        return <ul className="collection">
            {itemsList}
        </ul>
    }
}