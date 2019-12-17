import React, { useEffect, useState } from 'react';
import styles from './App.css';
import Header from "../Header/Header";
import Manage from "../Manage/Manage";
import Login from "../Login/Login";
import {
    isAdminVirtruPage,
    isPublicVirtruPage,
    getVirtruAuth,
    clearVritruAuth
} from "../../../../utils";
import {
    LOCAL_STORAGE,
    USER_TYPE
} from "../../../../constants";

function App() {
    const [isAuth, setAuth] = useState(false);
    const [authEmail, setEmail] = useState('');
    const [userType, setUserType] = useState('');
    const clearEmail = () => {
        setEmail('');
    };
    const logout = () => {
        setEmail('');
        setAuth(false);
        clearVritruAuth();
    };
    useEffect(() => {
        const virtruAuth = getVirtruAuth();
        if (!virtruAuth) {
            clearEmail();
        } else {
            if (isPublicVirtruPage() && virtruAuth[LOCAL_STORAGE.PUBLIC_AUTH]) {
                setEmail(virtruAuth[LOCAL_STORAGE.PUBLIC_AUTH]);
                setAuth(true);
                setUserType(USER_TYPE.OWNER);
            }
            if (isAdminVirtruPage() && virtruAuth[LOCAL_STORAGE.ADMIN_AUTH]) {
                setEmail(virtruAuth[LOCAL_STORAGE.ADMIN_AUTH]);
                setAuth(true);
                setUserType(USER_TYPE.RECIPIENT);
            }
        }
    }, [authEmail]);
    return (
        <div className={styles.wrapper}>
            <Header isAuth={isAuth} logout={logout}/>
            {
                isAuth && (
                    <Manage authEmail={authEmail} userType={userType}/>
                ) || (
                    <Login afterLogin={setAuth} setEmail={setEmail}/>
                )
            }
        </div>
    )
}
export default App;