import { hot } from 'react-hot-loader/root';
import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, Switch, NotFoundRoute } from "react-router-dom";
import { createBrowserHistory } from "history";

import IndexPage from "./pages/IndexPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import UnitPage from "./pages/UnitPage.jsx";

import PanelIndexPage from "./pages/PanelIndexPage.jsx";
import PanelCoursePage from "./pages/PanelCoursePage.jsx";
import PanelUnitPage from "./pages/PanelUnitPage.jsx";
import PanelTaskPage from "./pages/PanelTaskPage.jsx";
import PanelUsersPage from "./pages/PanelUsersPage.jsx";


const history = createBrowserHistory();

class App extends React.Component {
    render() {
        return <Router history={ history }>
            <Switch>
                <Route exact path="/" render={(props)=><IndexPage {...props}/>} />
                <Route exact path="/login" render={(props)=><LoginPage {...props}/>} />
                <Route exact path="/unit/:uKey" render={(props)=><UnitPage {...props}/>} />
                <Route exact path="/unit/:uKey/:tKey" render={(props)=><UnitPage {...props}/>} />
                <Route exact path="/panel" render={(props)=><PanelIndexPage {...props}/>} />
                <Route exact path="/panel/unit" render={(props)=><PanelCoursePage {...props}/>} />
                <Route exact path="/panel/unit/:uKey" render={(props)=><PanelUnitPage {...props}/>} />
                <Route exact path="/panel/unit/:uKey/:tKey" render={(props)=><PanelTaskPage {...props}/>} />
                <Route exact path="/panel/user" render={(props)=><PanelUsersPage {...props}/>} />
                <Route component={NotFoundPage}/>
            </Switch>
        </Router>;
    }
}

const app = <App />;
hot(app);

ReactDOM.render(app, document.getElementById("root"));