import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as actions from '../store/actions/auth';

function CustomForm(props) {
    let history = useHistory();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (props.token != null){
            history.push("/")
        }
    })

    function handleSubmit(event){
        event.preventDefault();
        switch(props.type){
            case 'login':
                props.authLogin(username, password);
                break;

            case 'register':
                props.authRegister(username, password, confirmPassword)
                break;
        }
        
    }

    let errorMessage = null;
    if (props.error) {
        errorMessage = (
            <p className="error">{props.error.message}</p>
        );
    }

    return (
        <div className="container login">
            <form onSubmit={handleSubmit}>
                <h5>{props.type == 'register' ? "Registrar" : "Fazer login" }</h5>
                {errorMessage}
                <label>Usuário</label>
                <input onChange={(e) => setUsername(e.target.value)}></input>
                <br/>
                <label>Senha</label>
                <input onChange={(e) => setPassword(e.target.value)} type="password"></input>
                {props.type == 'register' ? (
                <>
                    <br/>
                    <label>Confirmar senha</label>
                    <input onChange={(e) => setConfirmPassword(e.target.value)} type="password"></input>
                </>
                ) : null}
                <br/>
                {<button type="submit" className='btn'>{props.type == 'login' ? "Logar" : "Registrar"}</button>}
            </form>
            {props.type == 'register' ? 
            (<p>Já tem uma conta? <a href="/login">Faça login</a></p>)
            :
            (<p>Não tem uma conta? <a href="/register">Registre-se</a></p>)
            }
        </div>
    )
}

const mapDispatchToProps = (dispatch) => {
    return {
        authLogin: (username, password) => dispatch(actions.authLogin(username, password)),
        authRegister: (username, password1, password2) => dispatch(actions.authSignup(username, password1, password2))
    }
}

const mapStateToProps = (state) => {
    return {
        loading: state.loading,
        error: state.error,
        token: state.token
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomForm)