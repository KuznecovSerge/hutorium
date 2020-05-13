import React from "react";
import UnitsList from "../components/UnitsList.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

export default class PanelCoursePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          error: null,
          status: "idle",
          units: [],
          isOpenNewUnit: false,
          newUnit: {
              uKey: 0,
              name: "",
              html: ""
          },
          save: ""
        };
    }
    
    newUnit() {
        fetch("/api/maxkey")
        .then(res => res.json())
        .then((result) => {
            const newUnit = this.state.newUnit;
            delete newUnit.uKey;
            newUnit.uKey = result.maxkey+1;
            newUnit.name = `Юнит ${newUnit.uKey}`;
            newUnit.html = `Блок html-кода`;
            this.setState({
                newUnit: newUnit
            });
        })
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
        
        this.newUnit();
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
    
    showNewUnit(event) {
        this.setState({
            isOpenNewUnit: !this.state.isOpenNewUnit
        })
    }
    
    onChange (event) {
        if (this.state.save) this.state.save = '';
        const name = event.target.name;
        this.state.newUnit[name] = event.target.value;
        this.forceUpdate();
    }
    
    onSave (event) {
        event.preventDefault();
        
        console.log('save');
        
        fetch(`/api/unit`, {
            method: "post",
            credentials: "same-origin",
            body: JSON.stringify(this.state.newUnit),
            headers: {
              "Content-Type": "application/json"
            }
        })
        .then((res) => {
            return res.json();
        })
        .then(
          (result) => {
            if (!result.error) {
                const unit = result;
                this.state.units.push(unit);
                this.forceUpdate();
                this.newUnit();
                this.setState({
                  save: "Новый юнит добавлен",
                });
            } else {
                this.setState({
                  save: (result.error) ? "Ошибка сохранения: " + result.error: "",
                });
                if (result.status === 401) {
                  this.setState({
                    //toggleShowLogin: !this.state.toggleShowLogin
                  })
                };
            }
        });
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
                UnitsView = <UnitsList units={units} root="/panel/unit/" />;
                break;
                
            case "idle":
            default:
                UnitsView = <div className="alert alert-warning" role="alert">Странно, компонент нихрена не делает</div>;
        }
        
        const formAddUnit = (status=="ready" && this.state.isOpenNewUnit)  ? this.editForm() : '';
        
        const youAreHere = [
            {name: "Курс", link: "/"},
            {name: "Панель", link: "/panel"},
            {name: "Курс", link: "/panel/unit"}
        ];
        
        return <React.Fragment>
            <div className="row green">
                <div className="col s12">
                    <Breadcrumbs path={youAreHere}/>
                </div>
            </div>
            <div className="container top-offset">
                <h4>Курс Хуториум</h4>
                <br/>
                <div>Список юнитов:</div>
                {UnitsView}
                <br/>
                <button onClick={this.showNewUnit.bind(this)}>{(!this.state.isOpenNewUnit) ? "Добавить юнит": "Скрыть форму"}</button>
                {formAddUnit}
                <br/>
                <br/>
            </div>
        </React.Fragment>
    }
}
        