import { parseFormData, renderAuthModal, saveFormSettings } from "../utils";
import {LOCAL_STORAGE_FORM_SETTING_KEY, NINJA_FORM_AJAX_SUBMIT_ACTION} from "./../constants";

export function ajaxBeforeSend(xhr, settings) {
    if (!settings.isEncrypted) {
        const { data } = settings;
        const settingsData = parseFormData(data);
        if (settingsData.action === NINJA_FORM_AJAX_SUBMIT_ACTION) {
            const { formData } = settingsData;
            const parsedFormData = JSON.parse(formData);
            const { id: formId } = parsedFormData;
            localStorage.removeItem(`${LOCAL_STORAGE_FORM_SETTING_KEY}${formId}`);
            // To change saving data to local storage to saving in redux store
            saveFormSettings(formId, settings);
            xhr.abort();
            renderAuthModal(formId);
        }
    }
    console.log('default send')
}