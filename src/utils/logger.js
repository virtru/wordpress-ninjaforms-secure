import {FORM_STATUS, LOGGER_TYPE, USER_TYPE} from "../constants";
import React from 'react';
import moment from "moment";

const uuidv4 = require('uuid/v4');

function createFormWrapper(owner, date) {
    const formId = uuidv4();
    const form = {
        id: formId,
        name: '',
        owner,
        fields: [],
        files: [],
        recipients: [],
        date,
        decrypted: [],
        originalFormId: 0,
        logger: [],
        status: FORM_STATUS.ACTIVE,
    };
    const forms = getAllForms();
    forms.push(form);
    setAllForms(forms);
    return formId;
}

function createLoggerElement(loggerEntity, i) {
    const { date, user, event, recipients, fileName } = loggerEntity;
    const users = recipients && recipients.map((recipient, index) => (
        <span className="user" key={index}>{recipient}<span>{index < (recipients - 1) ? ', ': ''}</span></span>
    ));
    const events = {
        [LOGGER_TYPE.ENCRYPT_FORM]: () => (
            <pre key={i}>
                <span className="date">{date}: </span>User <span className="user">{user} </span> <span className="action"> encrypted</span> the form with recipients: [{users}]
            </pre>
        ),
        [LOGGER_TYPE.ADD_RECIPIENT]: () => (
            <pre key={i}>
                <span className="date">{date}: </span>User <span className="user">{user} </span> <span className="action"> added user </span> {users} to the policy
            </pre>
        ),
        [LOGGER_TYPE.REMOVE_RECIPIENT]: () => (
            <pre key={i}>
                <span className="date">{date}: </span>User <span className="user">{user} </span> <span className="action"> removed user </span> {users} from the policy
            </pre>
        ),
        [LOGGER_TYPE.REVOKE]: () => (
            <pre key={i}>
                <span className="date">{date}: </span>User <span className="user">{user} </span> <span className="action"> revoked </span> the form policy
            </pre>
        ),
        [LOGGER_TYPE.DOWNLOADED_FILE]: () => (
            <pre key={i}>
                <span className="date">{date}: </span>User <span className="user">{user} </span> <span className="action"> downloaded </span> the file
            </pre>
        ),
        [LOGGER_TYPE.DECRYPT]: () => (
            <pre key={i}>
                <span className="date">{date}: </span>User <span className="user">{user} </span> <span className="action"> decrypted </span> the form <span className="user"> {fileName}</span>
            </pre>
        ),
    };
    return events[event]();
}

function createLoggerEntity(date, user, event, recipients, fileName) {
    return {
        date,
        user,
        event,
        recipients,
        fileName,
    }
}

/**
 *
 * @param formId
 * @param user
 * @param event
 * @param recipients
 * @param fileName
 * @param isOriginalFormId
 */
function addLoggerEntity(formId, user, event, recipients, fileName, isOriginalFormId) {
    let currentForm = {};
    if (isOriginalFormId) {
        currentForm = getFormByOriginalFormId(formId);
    } else {
        currentForm = getFormByID(formId);
    }
    const date = moment().format('hh:mm:ss, DD-MM-YYYY');
    const loggerEntity = createLoggerEntity(date, user, event, recipients, fileName);
    currentForm.logger.push(loggerEntity);

    if (isOriginalFormId) {
        saveFormByOriginalID(formId, currentForm);
    } else {
        saveForm(formId, currentForm);
    }
    return loggerEntity;
}

function setAllForms(forms) {
    localStorage.setItem('virtru-forms', JSON.stringify(forms));
}

function getAllForms() {
    return JSON.parse(localStorage.getItem('virtru-forms')) || [];
}

function saveForm(id, form) {
    let forms = getAllForms();
    forms = forms.filter((form) => {
        return form.id !== id
    });
    forms.push(form);
    setAllForms(forms);
}

function saveFormByOriginalID(originalFormId, form) {
    let forms = getAllForms();
    forms = forms.filter((form) => {
        return form.originalFormId !== (originalFormId * 1)
    });
    forms.push(form);
    setAllForms(forms);
}

function getFormByID(id) {
    const forms = getAllForms();
    const result = forms.find((form) => {
        return form.id === id
    });
    if (!result) {
        return false
    }
    return result;
}

function getFormByOriginalFormId(originalFormId) {
    const forms = getAllForms();
    const result = forms.find((form) => {
        return form.originalFormId === (originalFormId * 1)
    });
    if (!result) {
        return false
    }
    return result;
}

function getFormsByUserEmail(email, userType) {
    const forms = getAllForms();
    if (userType === USER_TYPE.OWNER) {
        return forms.filter((form) => {
            return form.owner === email
        });
    }
    return forms.filter((form) => {
        return form.recipients.includes(email);
    });
}

function updateFormFields(formId, fields) {
    const currentForm = getFormByID(formId);
    if (!currentForm) {
        return false;
    }
    currentForm.fields = fields;
    saveForm(formId, currentForm);
}

function updateFormName(formId, name) {
    const currentForm = getFormByID(formId);
    if (!currentForm) {
        return false;
    }
    currentForm.name = name;
    saveForm(formId, currentForm);
}

function updateOriginalFormId(formId, originalId) {
    const currentForm = getFormByID(formId);
    if (!currentForm) {
        return false;
    }
    currentForm.originalFormId = (originalId * 1);
    saveForm(formId, currentForm);
}

function addRecipients(formId, recipients = [], isOriginalFormId) {
    let currentForm = {};
    if (isOriginalFormId) {
        currentForm = getFormByOriginalFormId(formId);
    } else {
        currentForm = getFormByID(formId);
    }
    if (!currentForm) {
        return false;
    }
    recipients.forEach((recipient) => {
        currentForm.recipients.push(recipient);
    });
    if (isOriginalFormId) {
        saveFormByOriginalID(formId, currentForm);
    } else {
        saveForm(formId, currentForm);
    }
}

function removeRecipient(formId, removedUser, isOriginalFormId) {
    let currentForm = {};
    if (isOriginalFormId) {
        currentForm = getFormByOriginalFormId(formId);
    } else {
        currentForm = getFormByID(formId);
    }
    if (!currentForm) {
        return false;
    }
    currentForm.recipients = currentForm.recipients.filter((recipient) => {
        return recipient !== removedUser;
    });
    if (isOriginalFormId) {
        saveFormByOriginalID(formId, currentForm);
    } else {
        saveForm(formId, currentForm);
    }
}

function revokeForm(formId, isOriginalFormId) {
    let currentForm = {};
    if (isOriginalFormId) {
        currentForm = getFormByOriginalFormId(formId);
    } else {
        currentForm = getFormByID(formId);
    }
    if (!currentForm) {
        return false;
    }
    currentForm.status = FORM_STATUS.REVOKE;
    if (isOriginalFormId) {
        saveFormByOriginalID(formId, currentForm);
    } else {
        saveForm(formId, currentForm);
    }
}

function addDecrypt(originalFormId, recipient) {
    const decryptObject = {
        recipient,
        date: moment().format()
    };
    const currentForm = getFormByOriginalFormId(originalFormId);
    if (!currentForm) {
        return false;
    }
    currentForm.decrypted.push(decryptObject);
    saveFormByOriginalID(originalFormId, currentForm);
}

export default {
    createFormWrapper,
    getFormByID,
    getFormsByUserEmail,
    updateFormFields,
    updateFormName,
    addRecipients,
    removeRecipient,
    addDecrypt,
    revokeForm,
    updateOriginalFormId,
    addLoggerEntity,
    createLoggerElement,
}