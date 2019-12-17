import React, { useState } from 'react';
import styles from './DecryptWrapper.css';
import Decrypt from '../../components/Decrypt/Decrypt'
import {
    unMountComponent
} from "../../../../utils";
import {
    SELECTORS
} from "../../../../constants";

function DecryptWrapper({postId}) {
    const [isDecrypted, setDecrypted] = useState(false);
    const [isDenied, setDenied] = useState(false);
    const [startedDecrypt, setStart] = useState(false);
    const decrypted = () => {
        setDecrypted(true);
        unMountComponent(SELECTORS.DECRYPT_WRAPPER_ID);
    };
    const denied = () => {
        setDenied(true);
    };
    const startDecrypt = (e, enableDecrypt) => {
        e.preventDefault();
        if (enableDecrypt) {
            setDenied(false);
        }
        setStart(true);
    };
    if (isDenied) {
        return (
            <div className={styles.decryptWrapper}>
                <div className={styles.decryptContent}>
                    <div>
                        <div className={styles.decryptTitle}>
                            You have no permissions<br/>to decrypt this form
                        </div>
                        <div className={styles.decryptText}>
                            You can try with another email
                        </div>
                        <button className={styles.decryptButton} onClick={ e => startDecrypt(e, true)}>
                            Decrypt
                        </button>
                    </div>
                </div>
            </div>
        )
    }
    return (
        !isDecrypted && (
            <div className={styles.decryptWrapper}>
                <div className={styles.decryptContent}>
                    {
                        startedDecrypt && <Decrypt postId={postId} decrypted={decrypted} denied={denied}/> ||
                        (
                            <div>
                                <div className={styles.decryptTitle}>
                                    From was encrypted by Virtru
                                </div>
                                <button className={styles.decryptButton} onClick={ e => startDecrypt(e)}>
                                    Decrypt
                                </button>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    )
}
export default DecryptWrapper;