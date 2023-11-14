import firebase from "firebase/app";
import { createUserNode } from "./dataProvider";
require('firebase/auth');


/**
 * Attempts to create a new user with the given email and password. 
 * If successful, user is logged in.
 * @param {string} email email address
 * @param {string} password password
 */
export function createNewUser(email, password, userInfo) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in 
        var user = userCredential.user;
        console.log(user);
        createUserNode(user.uid, email, userInfo);
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode + ": " + errorMessage);
    });
}

export function login(email, password, setAlert) {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        console.log(user);
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        setAlert(errorMessage + " [" + errorCode + "]");
        console.log(errorCode + ": " + errorMessage);
    });
}

export function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("logged out.");
    }).catch((error) => {
        console.log(error);
    });
}

/**
 * gets the user's unique ID from firebase auth
 * @returns user's unique ID
 */
export function getUserID() {
    return firebase.auth().currentUser.uid;
}