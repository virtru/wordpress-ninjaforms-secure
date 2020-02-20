import React, { useEffect, useState } from 'react';
import styles from './Decrypt.css';
import Virtru from "../../../../utils/VirtruWrapper";
import {
    getEncryptedForm,
    fillDecryptedField,
    getVirtruAuth,
    setAuthEmail
} from "../../../../utils";
import Logger from "../../../../utils/logger";
import {
    LOCAL_STORAGE,
    LOGGER_TYPE
} from "../../../../constants";
const base64 = require('../../../../utils/base64');

async function decryptData(postId, email) {
    const client = Virtru.createClient({email});
    const formData = getEncryptedForm();
    const result = formData.map(async (input) => {
        const { encryptedValue} = input;
        try {
            const decodeBase64 = base64.decode(encryptedValue);
            const decryptParams = Virtru.buildDecryptParams(decodeBase64);
            const decryptedField = await client.decrypt(decryptParams);
            input.decryptedValue = await decryptedField.toString();
        } catch (e) {
            const { response } = e;
            if (response && response.status === 403) {
                console.log(response);
                return {
                    error: true,
                    status: 403,
                }
            }
        }
        return input;
    });

    return Promise.all(result);
}

function Decrypting({postId, authEmail, denied, decrypted}) {
    useEffect(() => {
        (async () => {
            const decryptedFields = await decryptData(postId, authEmail);
            let accessDenied = false;
            decryptedFields.map((item) => {
                if (item.error && item.status === 403) {
                    accessDenied = true;
                } else {
                    fillDecryptedField(item.name, item.decryptedValue);
                }
            });
            if (accessDenied) {
                denied()
            } else {
                decrypted();
                Logger.addLoggerEntity(postId, authEmail, LOGGER_TYPE.DECRYPT, null,null, true);
            }
        })();
    });
    return (
        <div className={styles.decryptLoading} >
            Decrypting
        </div>
    )
}

function Decrypt({postId, decrypted, denied}) {
    const [isAuth, setAuth] = useState(false);
    const [authEmail, setEmail] = useState(false);
    const [isDecrypting, setDecrypting] = useState(false);
    const afterAuth = async (email) => {
        setEmail(email);
        setAuthEmail(email, true);
        setAuth(true);
        setDecrypting(true);
    };
    useEffect(() => {
        const virtruAuth = getVirtruAuth();
        if (virtruAuth && virtruAuth[LOCAL_STORAGE.ADMIN_AUTH]) {
            setEmail(virtruAuth[LOCAL_STORAGE.ADMIN_AUTH]);
            setAuth(true);
            setDecrypting(true);
        }
        window.Virtru.AuthWidget('virtru-auth-widget-mount', { afterAuth });
    }, [postId, isAuth]);
    if (!isAuth) {
        return (
            <div className={''}>
                <div className={styles.decryptTitle}>
                    Please sign in Virtru
                </div>
                <div id="virtru-auth-widget-mount"/>
            </div>
        )
    }
    return (
        <div>
            {
                isDecrypting && (
                    <Decrypting
                        denied={denied}
                        postId={postId}
                        authEmail={authEmail}
                        decrypted={decrypted}
                    />
                )
            }
        </div>
    )
}
export default Decrypt;