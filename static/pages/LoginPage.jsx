import React from "react";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import UserInfo from "../components/UserInfo.jsx";

export default class LoginPage extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
          error: null,
          status: "idle",
          user: []
        };
        
    }
    
    componentDidMount() {
        this.setState({status: "pending" });
        this.checkUser();
        
    }
    
    checkUser() {
        fetch("/api/me")
          .then(res => res.json())
          .then(
            (result) => {
                if (!result.error){
                    this.setState({
                        status: "ready",
                        user: result
                    });
                } else {
                    this.setState({
                        status: "error",
                        error: result.error
                    });
                }
            })
          .catch(
            (error) => {
              this.setState({
                status: "error",
                error: null
              });
            }
        );
    }
    
    logout() {
        console.log('logout');
        fetch("/sign-out")
        .then(
          () => {
            this.setState({
                status: "idle",
                error: null
            });
            this.checkUser();
        })
    }
    
    
    
    render() {
        //const logout = function() {this.logout};
        
        const {status, user} = this.state;

        const youAreHere = [{name: "Курс", link: "/"}, {name: "Авторизация", link: "/login/"}];
        
        return  <React.Fragment>
            <div className="row green">
                <div className="col s12">
                    <Breadcrumbs path={youAreHere}/>
                </div>
            </div>
            <div className="container top-offset">
                <h4>{(status != 'ready') ? 'Авторизация' : 'Личный кабинет' }</h4>
                <br/>
                
                {(status == 'ready') && <UserInfo user={user} logout={this.logout.bind(this)}/>}
                
                {(status != 'ready') &&
                <div>
                    <p>Для получения доступа к курсу и в личный кабинет небходимо авторизоваться. <br/>
                        На данный момент поддерживается только авторизация через VK.
                    </p>
                    <p>
                        <a className="btn btn-flat btn-large waves-light green darken-1 white-text"
                            href="/auth/vk">Войти через VK
                        </a>
                    </p>
                </div>
                }
                <br/>
                <br/>

            </div>
            <div className="row white">
                <div className="col s12">
                
                </div>
            </div>
        </React.Fragment>;
    }
}
        