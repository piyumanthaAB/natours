// console.log('hello from parcel bundler');
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';


// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOut = document.querySelector('.nav__el--logout');
const formUpdateDetails = document.querySelector('.form-user-data');
const formUpdatePassword = document.querySelector('.form-user-password');

// VALUES



// DELEGATION
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password);
        
    });
}

if (logOut) {
    logOut.addEventListener('click', () => {
        logout();
    })
}

if (formUpdateDetails) {
    formUpdateDetails.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        // console.log(email,name);
        updateSettings({email, name},'data');
    })
}
if (formUpdatePassword) {
    formUpdatePassword.addEventListener('submit', async e => {
        e.preventDefault();

        document.querySelector('.btn--save-password').textContent = 'Updating....'
        
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        
        
        await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
        // console.log(passwordCurrent,password,passwordConfirm);
        
        document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD'

        document.getElementById('password-current').value='';
        document.getElementById('password').value='';
        document.getElementById('password-confirm').value='';
    })
}