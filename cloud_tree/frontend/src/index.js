import React from 'react';
import { render } from 'react-dom';
import App from "./components/App";
import { createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import reducer from './store/reducers/auth';


const composeEnhances = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(reducer, composeEnhances(
    applyMiddleware(thunk)
));

const appDiv = document.getElementById("app");

const ret = (
    <Provider store={store}> 
        <App username={appDiv.getAttribute("username")}/>
    </Provider>
)

render(ret, appDiv);