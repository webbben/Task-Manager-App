import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import the functions you need from the SDKs you need
import firebase from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import "firebase/database";
import { Provider } from 'react-redux';
import store from './redux/store';
import { FIREBASE_API_KEY } from './private';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "task-manager-c386d.firebaseapp.com",
  projectId: "task-manager-c386d",
  storageBucket: "task-manager-c386d.appspot.com",
  messagingSenderId: "498677312561",
  appId: "1:498677312561:web:b56fe13f36d5cc7d653910",
  measurementId: "G-9DHLN5Z9Z0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//const analytics = firebase.getAnalytics(app);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
