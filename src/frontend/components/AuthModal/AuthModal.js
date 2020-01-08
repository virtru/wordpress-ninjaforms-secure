import React, { useEffect, useState } from 'react';
import styles from './AuthModal.css';
import Encrypt from './../Encrypt/Encrypt';
import EncryptFile from "../EncryptFile/EncryptFile";
import {
    DATA_TYPE,
    LOCAL_STORAGE
} from "../../../constants";
import {
    getVirtruAuth,
    setAuthEmail
} from "../../../utils";

function AuthModal({formId, type, fileData}) {
    const [isAuth, setAuth] = useState(false);
    const [authEmail, setEmail] = useState('');
    const [isShow, toggleModal] = useState(true);
    const afterAuth = (email) => {
        setEmail(email);
        setAuthEmail(email, false, true);
        setAuth(true);
    };
    const isFile = type === DATA_TYPE.FILE;
    const hideModal = () => {
        toggleModal(false)
    };
    useEffect(() => {
        const virtruAuth = getVirtruAuth();
        if (virtruAuth && virtruAuth[LOCAL_STORAGE.PUBLIC_AUTH]) {
            setEmail(virtruAuth[LOCAL_STORAGE.PUBLIC_AUTH]);
            setAuth(true);
        }
        window.Virtru.AuthWidget('virtru-auth-widget-mount', { afterAuth });
    }, [formId]);
    return (
        isShow && (
            <div className={styles.virtruAuthModal}>
                <div className={styles.authModalWrapper}>
                    <div className={styles.authTitle}>
                        This { isFile ? 'file' : 'form'} will be encrypted by Virtru.
                    </div>
                    {
                        (!isAuth && <div id="virtru-auth-widget-mount"/>) ||
                        (
                            type === DATA_TYPE.FILE && (
                                <EncryptFile email={authEmail} fileData={fileData} hideModal={hideModal}/>
                            ) || (
                                <Encrypt email={authEmail} formId={formId} hideModal={hideModal}/>
                            )

                        )
                    }
                </div>
            </div>
        )
    )
}
export default AuthModal;