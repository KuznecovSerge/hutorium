import React from "react";

export default class UserInfo extends React.Component {
    
    onClick() {
        this.props.logout();
    }

    render() {
        return <div className="me">
                    <div className="me__line">
                        <div className="me__ava">
                            <img className="responsive-img circle" src={this.props.user.photo200Url} />
                        </div>
                        <div className="me__info">Вы авторизованы как <b>{this.props.user.username}</b>&nbsp;
                            <a className="me__logout" onClick={this.onClick.bind(this)}>[выйти]</a>
                            <div className="me__info__activation-status">Ваш аккаунт активен до <b>25.07.2019</b></div>
                            <div className="me__info__recommendations">Вы можете работать и выполнять новые задания до окончания этого срока. После окончания сохранится доступ ко всем пройденным заданиям.</div>
                        </div>
                    </div>
                    <div className="me__line">
                        <div className="me__ava">&nbsp;</div>
                        <div className="me__info me__info_action">
                            <a className="btn btn-flat btn-large green darken-1 waves-effect waves-light white-text" href="/unit/1/1">Перейти к заданиям</a>
                        </div>
                    </div>
                </div>

    }
}