import Virtru from 'virtru-sdk';

function createClient({ email }) {
    if (!email) {
        return new Virtru.Client();
    }
    return new Virtru.Client({ email });
}

function buildEncryptParams(string, recipient) {
    return new Virtru.EncryptParamsBuilder()
        .withStringSource(string)
        .withUsersWithAccess([recipient])
        .build();
}

function buildFileEncryptParams(stream, recipient, fileName) {
    return new Virtru.EncryptParamsBuilder()
        .withStreamSource(stream)
        .withUsersWithAccess([recipient])
        .withDisplayFilename(fileName)
        .build();
}

function buildDecryptParams(string) {
    return new Virtru.DecryptParamsBuilder()
        .withStringSource(string)
        .build();
}

export default {
    createClient,
    buildEncryptParams,
    buildFileEncryptParams,
    buildDecryptParams,
}