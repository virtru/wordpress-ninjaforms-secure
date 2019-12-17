import React, { useEffect } from 'react';
import styles from './Login.css';
import {
    setAuthEmail
} from "../../../../utils";

function Login({setEmail, afterLogin}) {
    const afterAuth = (email) => {
        setEmail(email);
        setAuthEmail(email);
        afterLogin(true);
    };
    useEffect(() => {
        window.Virtru.AuthWidget('virtru-auth-widget-mount', { afterAuth });
    }, [afterLogin]);
    return (
        <div className={styles.loginWrapper}>
            <div className={styles.loginForm}>
                <div className={styles.formTitle}>Please sign in Virtru</div>
                <div id="virtru-auth-widget-mount">
                </div>
            </div>
        </div>
    )
}
export default Login;