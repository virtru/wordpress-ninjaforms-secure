import React from 'react';
import styles from './Manage.css';
import Logger from "../../../../utils/logger";
import Form from "../Form/Form";
import EmptyFormList from "../EmptyFormList/EmptyFormList";

function Manage({authEmail, userType}) {
    const submittedForms = Logger.getFormsByUserEmail(authEmail, userType) || [];
    return (
        <div className={styles.manageWrapper}>
            <div className={styles.manageTitle}>Submitted forms</div>
            <div className={styles.submittedForms}>
                <div className={styles.submittedForms}>
                    {
                        submittedForms.length > 0 && submittedForms.map((form, key) => (
                            <Form key={key} form={form} authEmail={authEmail} userType={userType}/>
                        )) || (
                            <EmptyFormList userType={userType} />
                        )
                    }
                </div>
            </div>
        </div>
    )
}
export default Manage;