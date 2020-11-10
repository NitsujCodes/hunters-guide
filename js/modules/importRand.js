let randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const importMapping = {};

function addImportMapping(namespace, fileLocation) {
    if (typeof importMapping[namespace] === 'undefined') {
        importMapping[namespace] = {};
    }
    let explodePath = fileLocation.split('/');
    explodePath[explodePath.length - 1] = randomString + explodePath[explodePath.length - 1];

    importMapping[namespace][fileLocation] = explodePath.join('/');
}

function getFileString

export default {importMapping};