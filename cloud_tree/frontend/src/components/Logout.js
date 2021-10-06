import { useHistory } from "react-router";
import React from 'react';

export default function Logout(){
    let history = useHistory();
    fetch('/rest-auth/logout/', {method: 'POST'})
    .then((response) => response.json())
    .then((data) => console.log(data))
    history.push('/')
    return null;
}