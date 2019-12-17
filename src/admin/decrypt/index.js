import {
    ENCRYPTED_STRING,
    SELECTORS
} from '../../constants';
import {
    renderDecryptComponent,
    renderDecryptFile,
} from '../../utils/index';

// editData sent from backend side in virtru-nf-extension.php
const POST_ID = editData.post;

jQuery(document).ready(($) => {
    let hasEncryptedFields = false;
    const $nfSubFields = $(`#${SELECTORS.NF_SUB_FIELDS}`);
    $nfSubFields.find('input, textarea').each((index, input) => {
        if (input.value.includes(ENCRYPTED_STRING)) {
            hasEncryptedFields = true;
        }
    });
    if (hasEncryptedFields) {
        $nfSubFields.addClass(SELECTORS.VIRTRU_ENCRYPTED);
        $nfSubFields.find('input, textarea').each((index, input) => {
            if (!input.value.includes(ENCRYPTED_STRING)) {
                renderDecryptFile(POST_ID, input);
            }
        });
        renderDecryptComponent(POST_ID);
    }
});
