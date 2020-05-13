import React from "react";
import UnitsList from "../components/UnitsList.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

export default class IndexPage extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
          error: null,
          status: "idle",
          units: []
        };
    }
    
    componentDidMount() {
        this.setState({status: "pending" });
        fetch("/api/unit/")
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                status: "ready",
                units: result
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
        
        const { status, error, units } = this.state;
        
        let UnitsView;
        
        switch (status) {
            case "error": 
                UnitsView = <div className="alert alert-danger" role="alert" >Ошибка: {error.message}</div>;
                break;
              
            case "pending": 
                UnitsView = <div className="alert alert-primary" role="alert">Загружаем данные...</div>;
                break;
              
            case "ready":
                UnitsView = <UnitsList units={units} root="/unit/"/>;
                break;
                
            case "idle":
            default:
                UnitsView = <div className="alert alert-warning" role="alert">Странно, компонент нихрена не делает</div>;
        }
        
        const youAreHere = [{name: "Курс", link: "/"}];
        
        return  <React.Fragment>
            <div className="row green">
                <div className="col s12">
                    <Breadcrumbs path={youAreHere}/>
                </div>
            </div>
            <div className="container top-offset">
                <h4>Курс Хуториум</h4>
                <br/>
                {UnitsView}
            </div>
            <div className="row white">
                <div className="col s12">
                
                </div>
            </div>
        </React.Fragment>;
    }
}
        