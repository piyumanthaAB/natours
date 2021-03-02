import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if (res.data.status == 'success') {
            showAlert('success','Logged in Successfully !');
            window.setTimeout(() => {
                location.assign('/'); // reload the web page
            }, 1500);
        }
    } catch (err) {
        // window.alert(err.response.data.message);
        showAlert('error',`${err.response.data.message}`);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout'
        });
        if (res.data.status === 'success') {
            console.log(res.data);
            location.assign('/');
            // location.reload(); // reload the page from server. not from the browser cache.
        }
        // location.reload();
    } catch (err) {
        console.log(err.response);
        showAlert('error', 'Error in logging out');
    }
}



