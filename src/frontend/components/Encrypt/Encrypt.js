import React, { useEffect, useState } from 'react';
import Virtru from "../../../utils/VirtruWrapper";
import {
    getFormFields,
    getFormSettings,
    updateFormSettings,
    sendEncryptedForm,
    getEncryptedValue,
    unMountComponent,
} from "../../../utils";
import Logger from '../../../utils/logger'
import {
    LOGGER_TYPE,
    SELECTORS
} from "../../../constants";
import moment from "moment";
const base64 = require('../../../utils/base64');

async function encryptFields(client, fieldsArray, recipient) {
    const result = fieldsArray.map(async (field) => {
        const { value } = field;
        if (value.length > 0) {
            const encryptParams = Virtru.buildEncryptParams(value, recipient);
            const encryptedField = await client.encrypt(encryptParams);
            const encryptedString = await encryptedField.toString();
            const base64String = base64.encode(encryptedString);
            const policyId = encryptParams.getPolicyId();
            field.value = getEncryptedValue(base64String);
            field.policyId = policyId;
            return field;
        } else {
            if (field.files && field.files.length > 0) {
                field.policyId = localStorage.getItem('filePolicyId');
            }
            return field;
        }
    });
    return Promise.all(result);
}
async function encryptForm(email, formId, loggedFormId) {
    const client = Virtru.createClient({ email });
    // admin data passed from backend side (see virtru-nf-extension.php)
    const ADMIN_EMAIL = adminEmail.data;
    Logger.addLoggerEntity(loggedFormId, email, LOGGER_TYPE.ENCRYPT_FORM, [ADMIN_EMAIL]);
    const currentFormSettings = getFormSettings(formId);
    const fields = getFormFields(currentFormSettings);
    let fieldsArray = [];
    for (const field in fields) {
        if (fields.hasOwnProperty(field)) {
            fieldsArray.push(fields[field]);
        }
    }
    const encryptedArray = await encryptFields(client, fieldsArray, ADMIN_EMAIL);
    Logger.updateFormFields(loggedFormId, encryptedArray);
    Logger.addRecipients(loggedFormId, [ADMIN_EMAIL]);
    encryptedArray.forEach((item) => {
        fields[item.id] = item;
    });
    updateFormSettings(fields, formId);
}

function Encrypt({email, formId, hideModal}) {
    const [isEncrypting, setEncrypting] = useState(true);
    const [isEncrypted, setEncrypted] = useState(false);
    useEffect(() => {
        (async () => {
            const dateNow = moment();
            const loggedFormId = Logger.createFormWrapper(email, dateNow);
            await encryptForm(email, formId, loggedFormId);
            setEncrypting(false);
            setEncrypted(true);
            const savedForm = await sendEncryptedForm(formId);
            if (savedForm.data && savedForm.data.actions) {
                const { actions } = savedForm.data;
                if (savedForm.data.actions.save) {
                    const savedFormId = actions.save.sub_id;
                    Logger.updateOriginalFormId(loggedFormId, savedFormId);
                }
                const savedFields = savedForm.data.fields;
                const loggedForm = Logger.getFormByID(loggedFormId);
                const { fields } = loggedForm;
                const updatedFields = fields.map((item) => {
                    item.name = savedFields[item.id].label;
                    return item;
                });
                const formName = savedForm.data.settings && savedForm.data.settings.title || '';
                Logger.updateFormName(loggedFormId, formName);
                const notEmptyFields = updatedFields.filter((item) => {
                    return item.value.length > 0 || (item.files && item.files.length > 0);
                });
                Logger.updateFormFields(loggedFormId, notEmptyFields);
            }
            hideModal();
            unMountComponent(SELECTORS.MODAL_SELECTOR_ID)
        })();
    }, [email]);
    return (
        <div>
            {isEncrypting && <div>Encrypting</div>}
            {isEncrypted && <div>Encrypted</div>}
        </div>
    )
}
export default Encrypt;