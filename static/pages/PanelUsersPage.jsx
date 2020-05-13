import React from "react";
import UserEdit from "../components/UserEdit.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

export default class PanelUsersPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          error: null,
          status: "idle",
          users: [],
          save: ""
        };
    }
    
    componentDidMount() {
        this.setState({status: "pending" });
        fetch("/api/user")
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                status: "ready",
                users: result
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
    
    editForm() {
        return <form>
                    <div className="form-group">
                        <label htmlFor="inputKey">Номер юнита</label>
                        <input className="form-control"
                            name="uKey"
                            value={ this.state.newUnit.uKey } 
                            onChange={ this.onChange.bind(this) }
                        />
                        <small id="keyHelp" className="form-text text-muted">Порядковый номер юнита.</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="inputTitle">Наименование юнита</label>
                        <input className="form-control"
                            name="name"
                            value={ this.state.newUnit.name } 
                            onChange={ this.onChange.bind(this) }
                        />
                        <small id="nameHelp" className="form-text text-muted">Пожалуйста, не превышайте 100 символов.</small>
                    </div> 
                    <div className="form-group">    
                        <label htmlFor="inputDescription">HTML-блок</label>
                        <textarea className="form-control" rows="5"
                            name="html"
                            value={ this.state.newUnit.html } 
                            onChange={ this.onChange.bind(this) }
                        />
                        <small id="htmlHelp" className="form-text text-muted">HTML-блок юнита.</small>
                    </div>   
                    <button type="submit" className="btn btn-primary"
                        onClick={ this.onSave.bind(this) }
                        >Сохранить</button>
                    <label className="pl-2" htmlFor="buttonSave">{this.state.save}</label>
                </form>
    }
    

    
    render() {
        const { status, error, users } = this.state;
        
        let UsersView;
        
        // switch (status) {
        //     case "error": 
        //         UsersView = <div className="alert alert-danger" role="alert" >Ошибка: {error.message}</div>;
        //         break;
              
        //     case "pending": 
        //         UsersView = <div className="alert alert-primary" role="alert">Загружаем данные...</div>;
        //         break;
              
        //     case "ready":
        //         UsersView = <UnitsList units={units} root="/panel/unit/" />;
        //         break;
                
        //     case "idle":
        //     default:
        //         UsersView = <div className="alert alert-warning" role="alert">Странно, компонент нихрена не делает</div>;
        // }
        

        const youAreHere = [
            {name: "Курс", link: "/"},
            {name: "Панель", link: "/panel"},
            {name: "Пользователи", link: "/panel/user"}
        ];
        
        return <React.Fragment>
            <div className="row green">
                <div className="col s12">
                    <Breadcrumbs path={youAreHere}/>
                </div>
            </div>
            <div className="container top-offset">
                <h4>Список пользователей</h4>
                <br/>
                { (status == 'ready') && this.state.users.map((user, index) => <UserEdit user={user} key={index} />) }
                <br/>
                <br/>
            </div>
        </React.Fragment>
    }
}
        