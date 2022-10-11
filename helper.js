const users = [];
const addUser = ({socket_id, name, user_id, room_id}) =>{
    const exist = users.find(user =>{
        return user.room_id === room_id && user.user_id === user_id
    })
    console.log(exist)
    if(exist && socket_id === exist.socket_id){   
            return {error: 'User already exist in this room'}
    }
    else{
        const user = {socket_id, name, user_id, room_id};
        users.push(user);
        console.log('all users', users)
        return {user}
    }
}

const removeUser = ({socket_id}) =>{
    const index  = users.findIndex(user => { return user.socket_id === socket_id})
    if(index !== -1){
        console.log('removed user '+ socket_id)
        return users.slice(index, 1)[0];
    }
}

const getUser = ({socket_id}) =>{
    return users.find((user) =>{ return user.socket_id === socket_id })
}

module.exports = {addUser, removeUser, getUser};