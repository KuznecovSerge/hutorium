import React from "react";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { Link } from "react-router-dom";

export default class PanelIndexPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          error: null,
          status: "idle"
        };
    }
    

    render() {

        const youAreHere = [{name: "Курс", link: "/"}, {name: "Панель", link: "/panel"}];
        
        return <React.Fragment>
            <div className="row green">
                <div className="col s12">
                    <Breadcrumbs path={youAreHere}/>
                </div>
            </div>
            <div className="container top-offset">
                <h1><Link to="/panel/unit">Курс</Link></h1>
                <br/>
                <br/>
                <h1><Link to="/panel/user">Пользователи</Link></h1>
                <br/>
                <br/>
            </div>
        </React.Fragment>
    }
}
        