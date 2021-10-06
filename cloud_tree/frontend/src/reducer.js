const initState = {
    token: null,
    username: ""
}

const reducer = (state = initState, action) => {
    if (action.type === 'SET_TOKEN'){
        let newToken = action.token
        let newUsername = action.username
        return {
            ...state,
            token: newToken,
            username: newUsername
        }
    }
    return state;
}

export default reducer;