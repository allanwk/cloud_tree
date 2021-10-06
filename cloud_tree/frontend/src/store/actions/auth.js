import * as actionTypes from './actionTypes';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
}

export const authSuccess = (token, username = "") => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        token: token,
        username: username
    }
}

export const authFail = error => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    }
}

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    fetch('/rest-auth/logout/', {method: 'POST'})
    .then((response) => response.json())
    .then((data) => console.log(data))
    return {
        type: actionTypes.AUTH_LOGOUT
    };
}

export const checkAuthTimeout = expirationTime => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime * 1000)
    }
}

export const authLogin = (username, password) => {
    return dispatch => {
        dispatch(authStart());
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: username,
              password: password
            }),
        };
        fetch("/rest-auth/login/", requestOptions)
        .then(res => res.json())
        .then((data) => {
            if ('key' in data){
                const token = data.key;
                const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
                localStorage.setItem('token', token);
                localStorage.setItem('expirationDate', expirationDate);
                dispatch(authSuccess(token, username));
                dispatch(checkAuthTimeout(3600));   
            } else {
                dispatch(authFail(new Error("Credenciais inválidas")))
            }
        })
        .catch(err => {
            dispatch(authFail(err))
        })
        
    }
}

export const authSignup = (username, password1, password2) => {
    return dispatch => {
        dispatch(authStart());
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: username,
              password1: password1,
              password2: password2
            }),
        };
        fetch("/rest-auth/registration/", requestOptions)
        .then(res => res.json())
        .then((data) => {
            if ('key' in data){
                const token = data.key;
                const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
                localStorage.setItem('token', token);
                localStorage.setItem('expirationDate', expirationDate);
                dispatch(authSuccess(token));
                dispatch(checkAuthTimeout(3600));   
            } else {
                var error_msg = "";
                for (var prop in data){
                    error_msg += prop + ":" + data[prop] + "  "
                }
                dispatch(authFail(new Error(error_msg)))
            }
        })
        .catch(err => {
            dispatch(authFail(err))
        })
    }
}

export const authCheckState = (username) => {
    console.log("Trying to auth")
    return dispatch => {
        const token = localStorage.getItem('token');
        if (token === undefined) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'));
            if ( expirationDate <= new Date() ) {
                dispatch(logout());
            } else {
                dispatch(authSuccess(token, username));
                dispatch(checkAuthTimeout( (expirationDate.getTime() - new Date().getTime()) / 1000) );
            }
        }
    }
}
