import React from 'react';
import styles from './Logout.css';

function Logout({logout}) {
    const logoutClick = (event) => {
        event.preventDefault();
        logout();
    };
    return (
        <button className={styles.logoutButton} onClick={(e) => logoutClick(e)}>
            Logout
        </button>
    )
}
export default Logout;