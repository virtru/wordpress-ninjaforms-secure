import React, { useEffect, useState } from 'react';
import {
    TDF
} from 'tdf3-js';
import Virtru from "../../../utils/VirtruWrapper";
import {
    unMountComponent,
    fileToArrayBuffer,
} from "../../../utils";
import {
    SELECTORS
} from "../../../constants";

async function encryptFiles(email, fileData) {
    const client = Virtru.createClient({ email });
    const ADMIN_EMAIL = adminEmail.data;
    if (fileData.files && fileData.files.length > 0) {
        const result = fileData.files.map(async (file) => {
            const fileBuffer = await fileToArrayBuffer(file);
            const contentStream = TDF.createMockStream(fileBuffer);
            const encryptParams = Virtru.buildFileEncryptParams(contentStream, ADMIN_EMAIL, file.name);
            const encryptedField = await client.encrypt(encryptParams);
            const encryptedBuffer = await encryptedField.toBuffer();
            const policyId = encryptParams.getPolicyId();
            localStorage.setItem('filePolicyId', policyId);
            const blobFile = new Blob([encryptedBuffer], {type: 'text/html'});
            return new File([blobFile], `${file.name}.tdf.html`, {
                type: "text/html",
            });
        });
        return Promise.all(result);
    }
}

function EncryptFile({email, fileData, hideModal}) {
    const [isEncrypting, setEncrypting] = useState(true);
    const [isEncrypted, setEncrypted] = useState(false);
    useEffect(() => {
        (async () => {
            const encryptedFiles = await encryptFiles(email, fileData);
            setEncrypting(false);
            setEncrypted(true);
            const updateData = {...fileData};
            updateData.isEncrypted = true;
            updateData.files = encryptedFiles;
            updateData.submit();
            hideModal();
            unMountComponent(SELECTORS.MODAL_SELECTOR_ID);
        })();
    }, [email]);
    return (
        <div>
            {isEncrypting && <div>Encrypting</div>}
            {isEncrypted && <div>Encrypted</div>}
        </div>
    )
}
export default EncryptFile;