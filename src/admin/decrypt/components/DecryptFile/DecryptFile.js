import React, { useEffect, useState } from 'react';
import styles from './DecryptFile.css';
import Virtru from "../../../../utils/VirtruWrapper";
import {
    getNameByFileUrl,
    setAuthEmail,
    getVirtruAuth
} from "../../../../utils";
import Logger from "../../../../utils/logger";
import {
    LOCAL_STORAGE,
    LOGGER_TYPE
} from "../../../../constants";
import DecryptFilePortal from "./DecryptFilePortal";
const base64 = require('virtru-base64');

async function decryptingFile(postId, authEmail, fileUrl, decrypted) {
    const client = Virtru.createClient({email: authEmail});
    const fileName = getNameByFileUrl(fileUrl);
    const responseFile = await fetch(fileUrl);
    const fileContent = await responseFile.text();
    const decryptParams = Virtru.buildDecryptParams(fileContent);
    const decryptedField = await client.decrypt(decryptParams);
    await decryptedField.toFile(fileName);
    decrypted();
    Logger.addLoggerEntity(postId, authEmail, LOGGER_TYPE.DOWNLOADED_FILE, null, 'file', true);
}

function DecryptFile({fileUrl, postId}) {
    const [isAuth, setAuth] = useState(false);
    const [authEmail, setEmail] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const decrypted = () => {
        setDownloading(false);
    };
    const decryptAndDownload = async (e) => {
        e.preventDefault();
        setDownloading(true);
        await decryptingFile(postId, authEmail, fileUrl, decrypted)
    };
    const afterAuth = async (email) => {
        setAuth(true);
        setEmail(email);
        setAuthEmail(email, true);
    };
    useEffect(() => {
        const virtruAuth = getVirtruAuth();
        if (virtruAuth && virtruAuth[LOCAL_STORAGE.ADMIN_AUTH]) {
            setEmail(virtruAuth[LOCAL_STORAGE.ADMIN_AUTH]);
            setAuth(true);
        }
        window.Virtru.AuthWidget('virtru-auth-widget-mount', { afterAuth });
    }, [fileUrl]);
    return (
        <div>
            <button className={styles.downloadButton} disabled={downloading} onClick={(e) => decryptAndDownload(e)}>
                {
                    downloading && 'Downloading' || 'Download Original File'
                }
            </button>
            <DecryptFilePortal>
                {
                    !isAuth && (
                        <div className={styles.virtruProtal}>
                            <div className={styles.portalWrapper}>
                                <div className={''}>
                                    <div className={styles.decryptTitle}>
                                        Please sign in Virtru
                                    </div>
                                    <div id="virtru-auth-widget-mount"/>
                                </div>
                            </div>
                        </div>
                    )
                }
            </DecryptFilePortal>
        </div>
    )
}
export default DecryptFile;