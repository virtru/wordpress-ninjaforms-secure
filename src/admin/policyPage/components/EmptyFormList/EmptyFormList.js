import React from 'react';
import styles from './EmptyFormList.css';
import {
    USER_TYPE
} from "../../../../constants";

function EmptyFormList({userType}) {
    return (
        <div className={styles.emptyList}>
            {
                userType === USER_TYPE.RECIPIENT && 'You did not receive forms yet.' ||
                    'You did not submit forms yet.'
            }
        </div>
    )
}
export default EmptyFormList;