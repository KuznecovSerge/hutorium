import React from "react";
import { Link } from "react-router-dom";

export default class Breadcrumbs extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
          activeIndex: 0
        };
	}
    
    
    render() {
        
        const lastIndex = this.props.path.length - 1;
        //console.log('lastIndex', lastIndex);
        const items = this.props.path.map((here, index)=>{
          //return <a key={index} href={here.link} className="breadcrumb">{here.name}</a>
          return <Link key={index} to={here.link} className="breadcrumb">{here.name}</Link>
        })
        

        return <nav className="transparent z-depth-0">
                <div className="nav-wrapper">
                  <div className="col s12">
                    {items}
                    <div className="app-bar__auth app-bar__tablet-and-desktop"><a href="/login"><i className="material-icons circle">person</i> Войти</a></div>
                  </div>
                </div>
              </nav>
    }
}