import axios from 'axios'

export function  getPublicData(name) {
    return axios.get(`${name}`).then((data)=>{
        console.log(data);
        if(data.data){
            return Promise.resolve(data.data)
        }
        return Promise.reject({
            returnCode :-1
        })
    })
}