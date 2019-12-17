import Virtru from "../../../../utils/VirtruWrapper";
import React, { useEffect, useState } from 'react';
import styles from './Form.css';
import Logger from "../../../../utils/logger";
import {
    LOGGER_TYPE,
    FORM_STATUS,
    USER_TYPE
} from "../../../../constants";
const classNames = require('classnames');

const formStatus = {
    [FORM_STATUS.ACTIVE]: 'Active',
    [FORM_STATUS.REVOKE]: 'Revoked'
};

async function addUserToPolicies(authEmail, form, recipientEmail) {
    const client = Virtru.createClient({ email: authEmail });
    const result = form.fields.map(async (item) => {
        const policyId = item.policyId || localStorage.getItem('filePolicyId');
        const policy = await client.fetchPolicy(policyId);
        const newPolicy = policy.builder()
            .addUsersWithAccess(recipientEmail)
            .build();
        await client.updatePolicy(newPolicy);
    });

    return Promise.all(result);
}

async function removeUserToPolicies(authEmail, form, recipientEmail) {
    const client = Virtru.createClient({ email: authEmail });
    const result = form.fields.map(async (item) => {
        const policyId = item.policyId || localStorage.getItem('filePolicyId');
        const policy = await client.fetchPolicy(policyId);
        const newPolicy = policy.builder()
            .removeUsersWithAccess(recipientEmail)
            .build();
        await client.updatePolicy(newPolicy);
    });

    return Promise.all(result);
}

async function revokePolicy(authEmail, form) {
    const client = Virtru.createClient({ email: authEmail });
    const result = form.fields.map(async (item) => {
        const policyId = item.policyId || localStorage.getItem('filePolicyId');
        return await client.revokePolicy(policyId);
    });

    return Promise.all(result);
}

function Form({form, authEmail, userType}) {
    const [isShow, setIsShow] = useState(false);
    const [logEntities, setEntities] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientEmailError, setRecipientEmailError] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState(FORM_STATUS.ACTIVE);
    const [updatingPolicy, setUpdatingPolicy] = useState(false);
    const showMoreClick = () => {
        isShow ? setIsShow(false) : setIsShow(true);
    };
    const clearError = () => {
        setRecipientEmailError(false);
        setError('');
    };
    const addUser = async (e) => {
        e.preventDefault();
        clearError();
        if (!recipientEmail) {
            setRecipientEmailError(true);
            setError('Please input email');
            return false;
        }
        setUpdatingPolicy(true);
        if (form.recipients.includes(recipientEmail)) {
            setRecipientEmailError(true);
            setError('User already has permissions to this policy');
            return false;
        }
        await addUserToPolicies(authEmail, form, recipientEmail);
        setUpdatingPolicy(false);
        const logEntity = Logger.addLoggerEntity(form.id, authEmail, LOGGER_TYPE.ADD_RECIPIENT, [recipientEmail]);
        Logger.addRecipients(form.id, [recipientEmail]);
        const updatedLogEntities = [...logEntities];
        updatedLogEntities.push(logEntity);
        setEntities(updatedLogEntities);
        const updatedRecipients = [...recipients];
        updatedRecipients.push(recipientEmail);
        setRecipients(updatedRecipients);
        setRecipientEmail('');
    };
    const removeUser = async (e, userEmail) => {
        e.preventDefault();
        setUpdatingPolicy(true);
        await removeUserToPolicies(authEmail, form, userEmail);
        setUpdatingPolicy(false);
        const logEntity = Logger.addLoggerEntity(form.id, authEmail, LOGGER_TYPE.REMOVE_RECIPIENT, [userEmail]);
        Logger.removeRecipient(form.id, userEmail);
        const updatedLogEntities = [...logEntities];
        updatedLogEntities.push(logEntity);
        setEntities(updatedLogEntities);
        const updatedRecipients = recipients.filter(user => user !== userEmail);
        setRecipients(updatedRecipients);
        setRecipientEmail('');
    };
    const revokePolicyClick = async (e) => {
        e.preventDefault();
        setUpdatingPolicy(true);
        await revokePolicy(authEmail, form);
        setUpdatingPolicy(false);
        const logEntity = Logger.addLoggerEntity(form.id, authEmail, LOGGER_TYPE.REVOKE);
        Logger.revokeForm(form.id);
        const updatedLogEntities = [...logEntities];
        updatedLogEntities.push(logEntity);
        setEntities(updatedLogEntities);
        setStatus(FORM_STATUS.REVOKE);
    };
    const recipientClassNames = classNames({
        [styles.recipientItem]: true,
        [styles.recipientItemDisable]: updatingPolicy || status === FORM_STATUS.REVOKE,
    });
    const statusClassName = classNames({
        [styles.activeStatus]: status === FORM_STATUS.ACTIVE,
        [styles.revokeStatus]: status === FORM_STATUS.REVOKE,
    });
    useEffect(() => {
        setEntities(form.logger);
        setRecipients(form.recipients);
        setStatus(form.status);
    }, [form]);
    return (
        <div className={styles.virtruSubmittedForm}>
            <div className={styles.virtruFormTitle} onClick={() => {showMoreClick()}}>
                <div className={styles.virtruFormName}>
                    <span>{ `${form.name} (${form.originalFormId})` }</span>
                    <span className={statusClassName}>{ formStatus[status] }</span>
                </div>
            </div>
            {
                isShow && (
                    <div className={styles.virtruFormWrapper}>
                        <div className={styles.virtruSideWrapper}>
                            <div className={styles.virtruInfoWrapper}>
                                <div className={styles.virtruInfoTitle}>
                                    Form Info
                                </div>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                Encrypted fields
                                            </td>
                                            <td>
                                                {
                                                    form.fields.map((field, index) => (
                                                        <span key={index}>{ field.name + (index < (form.fields.length - 1) ? ', ': '') }</span>
                                                    ))
                                                }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Recipients
                                            </td>
                                            <td>
                                                {
                                                    recipients.map((recipient, key) => (
                                                        <div key={key} className={recipientClassNames} onClick={e => removeUser(e, recipient)}>
                                                            { recipient }
                                                        </div>
                                                    ))
                                                }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Add recipient
                                            </td>
                                            <td>
                                                <input type="email" name="recipientEmail" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="Enter email"/><br/>
                                                {
                                                    recipientEmailError && (
                                                        <div className={styles.error}>{error}</div>
                                                    )
                                                }
                                                <button disabled={updatingPolicy || status === FORM_STATUS.REVOKE} type="button" onClick={(e) => addUser(e)}>Submit</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Status
                                            </td>
                                            <td>
                                                { formStatus[status] }
                                            </td>
                                        </tr>
                                        {
                                            userType === USER_TYPE.OWNER && (
                                                <tr>
                                                    <td>
                                                        Revoke policy
                                                    </td>
                                                    <td>
                                                        <button disabled={updatingPolicy || status === FORM_STATUS.REVOKE} type="button" onClick={(e) => revokePolicyClick(e)}>Revoke</button>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className={styles.virtruSideWrapper}>
                            <div className={styles.virtruInfoTitle}>
                                Policy audit
                            </div>
                            <div className={styles.virtruLogWrapper}>
                                {
                                    logEntities.map((entity, indexEntity) => (
                                        <div key={indexEntity}>
                                            {
                                                Logger.createLoggerElement(entity, indexEntity)
                                            }
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}
export default Form;