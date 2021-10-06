import React, { Component } from "react";
import { BrowserRouter, Route } from 'react-router-dom';
import Modal from 'react-modal';
import Tree from './Tree';
import LoginForm from "./CustomForm";
import './style.css';
import { connect } from 'react-redux';
import * as actions from '../store/actions/auth';

Modal.setAppElement('#app')

class App extends Component{

    constructor(props){
        super(props);
        this.handleLogOut = this.handleLogOut.bind(this);
    }

    componentDidMount() {
        this.props.onTryAutoSignup(this.props.username);
    }

    handleLogOut(){
        this.props.logOut();
        window.location.reload();
    }

    render(){
        
        return (
            <BrowserRouter>
                <div className="App">
                    {/*this.props.username !== "" ? <button onClick={this.handleLogOut}>Deslogar</button> : null*/}
                    <Route exact path='/'>
                        <Tree />
                        <button onClick={this.props.logOut}>Logout</button>
                    </Route>
                    <Route exact path='/login'>
                        <LoginForm type="login"/>
                    </Route>
                    <Route exact path='/register'>
                        <LoginForm type="register"/>
                    </Route>
                </div>
            </BrowserRouter>
        )
    }
}
const mapStateToProps = state => {
    return {
      isAuthenticated: state.token !== null
    }
  }

const mapDispatchToProps = dispatch => {
    return {
      onTryAutoSignup: (username) => dispatch(actions.authCheckState(username)),
      logOut: () => dispatch(actions.logout())
    }
  }

export default connect(mapStateToProps, mapDispatchToProps)(App)