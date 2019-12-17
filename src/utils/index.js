import React from 'react';
import ReactDOM from 'react-dom';
import virtruAuthModalWindow from '../frontend/templates/virtruAuthModalWindow.html';
import virtruDecryptWrapper from '../admin/decrypt/templates/virtruDecryptWrapper.html';
import virtruDecryptFileButton from '../admin/decrypt/templates/virtruDecryptFileWrapper.html';
import successEncryptedForm from '../frontend/templates/successEncryptedForm.html';
import AuthModal from '../frontend/components/AuthModal/AuthModal'
import DecryptWrapper from '../admin/decrypt/components/DecryptWrapper/DecryptWrapper';
import DecryptFile from '../admin/decrypt/components/DecryptFile/DecryptFile';
import {
    LOCAL_STORAGE_FORM_SETTING_KEY,
    SELECTORS,
    ENCRYPTED_STRING,
    LOCAL_STORAGE
} from "../constants";

const $ = jQuery;
const currentPageHref = window.location.href;

function isEmpty(obj) {
    for(const key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

export function parseFormData(data) {
    if (!data || isEmpty(data)) {
        return false;
    }
    const parsedData = data.split('&');
    let result = {};
    parsedData.forEach((part) => {
        const item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}

export function updateFormSettings(fields, formId) {
    const settings = localStorage.getItem(`${LOCAL_STORAGE_FORM_SETTING_KEY}${formId}`);
    const parsedSettings = JSON.parse(settings);
    const data = parseFormData(parsedSettings.data);
    const formData = JSON.parse(data.formData);
    const updatedFormData = {...formData};
    updatedFormData.fields = fields;
    const updatedData = {...data};
    updatedData.formData = JSON.stringify(updatedFormData);
    parsedSettings.data = updatedData;
    parsedSettings.isEncrypted = true;
    saveFormSettings(formId, parsedSettings);
}

export function renderAuthModal(formId, type, fileData) {
    const $body = $('body');
    if ($body.find(`#${SELECTORS.MODAL_SELECTOR_ID}`).length === 0) {
        $body.append(virtruAuthModalWindow);
    }
    ReactDOM.render(
    <AuthModal formId={formId} fileData={fileData} type={type}/>,
    document.getElementById(SELECTORS.MODAL_SELECTOR_ID),
);
}

export function renderDecryptComponent(postID) {
    const $subFields = $(`#${SELECTORS.NF_SUB_FIELDS}`);
    if ($subFields.find(`#${SELECTORS.DECRYPT_WRAPPER_ID}`).length === 0) {
        $subFields.append(virtruDecryptWrapper);
    }
    ReactDOM.render(
    <DecryptWrapper postId={postID}/>,
    document.getElementById(SELECTORS.DECRYPT_WRAPPER_ID),
);
}

export function renderDecryptFile(postID, input) {
    const $input = $(input);
    const inputValue = $input.val();
    const $subFields = $(`#${SELECTORS.NF_SUB_FIELDS}`);
    if ($subFields.find(`#${SELECTORS.DECRYPT_FILE_WRAPPER_ID}`).length === 0) {
        $input.after(virtruDecryptFileButton);
    }
    ReactDOM.render(
        <DecryptFile fileUrl={inputValue} postId={postID}/>,
        document.getElementById(SELECTORS.DECRYPT_FILE_WRAPPER_ID),
    );
}

export function createFormData(data) {
    return Object.keys(data).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
    }).join('&');
}

export async function sendEncryptedForm(formId) {
    const settings = getFormSettings(formId);
    const { url, type: method, data } = settings;
    const body = createFormData(data);
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        method,
        body,
    });
    const result = await response.json();
    const domainFixLocal = '/wp-virtru.loc';
    const manageLinkURL = `${window.location.origin}${domainFixLocal}/virtru-policy-management/`;
    const manageLink = `<a href="${manageLinkURL}" target="_blank">Manage Virtru Policy Encryption</a>`;
    const $currentForm = $(`#nf-form-${formId}-cont`);
    $currentForm.find('.nf-form-layout').hide();
    $currentForm.find('.nf-response-msg')
        .html(successEncryptedForm)
        .show()
        .find('.virtru-manage-link')
        .append(manageLink);
    return result;
}

export function unMountComponent(elementId) {
    const $unMountElement = $(`#${elementId}`);
    if ($unMountElement.length > 0) {
        ReactDOM.unmountComponentAtNode(document.getElementById(elementId));
    }
}
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};

export function saveFormSettings(formId, settings) {
    const result = JSON.stringify(settings, getCircularReplacer());
    localStorage.setItem(`${LOCAL_STORAGE_FORM_SETTING_KEY}${formId}`, result);
}

export function getFormSettings(formId) {
    const settings = localStorage.getItem(`${LOCAL_STORAGE_FORM_SETTING_KEY}${formId}`);
    return JSON.parse(settings);
}

export function getEncryptedValue(base64String) {
    return `${ENCRYPTED_STRING}<span class='virtru-encrypted-field'>${base64String}</span>`;
}

export function getFormFields(formSettings) {
    const data = parseFormData(formSettings.data);
    const formData = JSON.parse(data.formData);
    return formData.fields;
}

export function getEncryptedForm() {
    const result = [];
    $(`#${SELECTORS.NF_SUB_FIELDS}`).find('input, textarea').each((index, input) => {
        const inputName = $(input).attr('name');
        const inputValue = $(input).val();
        const sanitizedValue = inputValue.substr(ENCRYPTED_STRING.length);
        const $fakeElement = $('<div></div>').html(sanitizedValue);
        const encryptedValue = $fakeElement.find('.virtru-encrypted-field').text();
        result.push({
            name: inputName,
            encryptedValue,
            decryptedValue: null,
        });
    });
    return result;
}

export function fillDecryptedField(name, data) {
    $(`#${SELECTORS.NF_SUB_FIELDS}`).find(`[name="${name}"]`).val(data);
}

export function isPublicVirtruPage() {
    return currentPageHref.includes('virtru-policy-management/');
}

export function isAdminVirtruPage() {
    return currentPageHref.includes('?page=nf_virtru_plugin');
}

export function getVirtruAuth() {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE.FIELD))
}

export function clearVritruAuth() {
    const virtruAuth = getVirtruAuth() || {};
    if (isAdminVirtruPage()) {
        delete virtruAuth[LOCAL_STORAGE.ADMIN_AUTH];
    }
    if (isPublicVirtruPage()) {
        delete virtruAuth[LOCAL_STORAGE.PUBLIC_AUTH];
    }
    localStorage.setItem(LOCAL_STORAGE.FIELD, JSON.stringify(virtruAuth))
}

export const fileToArrayBuffer = file => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();
            reject(new DOMException(file));
        };

        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(file);
    });
};

export function setAuthEmail(email, forceAdminPage, forcePublicPage) {
    const virtruAuth = getVirtruAuth() || {};
    if (isAdminVirtruPage() || forceAdminPage) {
        virtruAuth[LOCAL_STORAGE.ADMIN_AUTH] = email;
    }
    if (isPublicVirtruPage() || forcePublicPage) {
        virtruAuth[LOCAL_STORAGE.PUBLIC_AUTH] = email;
    }

    localStorage.setItem(LOCAL_STORAGE.FIELD, JSON.stringify(virtruAuth))
}

export function getNameByFileUrl(fileUrl) {
    const partsArray = fileUrl.split('/') || [];
    if (partsArray.length > 0) {
        const encryptedFileName = partsArray[partsArray.length - 1];
        const encryptedPartName = '.tdf_.html';
        return encryptedFileName.slice(0, encryptedFileName.indexOf(encryptedPartName));
    }
    return '';
}