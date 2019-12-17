import { ajaxBeforeSend } from './ajaxSetup';
import { renderAuthModal } from './../utils/index';
import {DATA_TYPE} from "../constants";



jQuery(document).ready(($) => {
    const nfRadio = Backbone.Radio;
    const radioChannel = nfRadio.channel( 'file_upload' );
    const uploadController = Marionette.Object.extend({
        initialize: function () {
            this.listenTo(radioChannel, 'render:view', this.updateFileUpload);
        },
        updateFileUpload: function (view) {
            const $file = $( view.el ).find( '.nf-element' );
            $file.fileupload({
                submit: function(e, data) {
                    if (!data.isEncrypted) {
                        e.preventDefault();
                        renderAuthModal(null, DATA_TYPE.FILE, data);
                    }
                }
            });
        }
    });

    $.ajaxSetup({
        beforeSend: ajaxBeforeSend
    });
    new uploadController();
});