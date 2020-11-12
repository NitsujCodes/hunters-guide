function replaceData(string, dataObj)
{
    for (let key in dataObj) {
        if (dataObj.hasOwnProperty(key)) {
            string = string.replace('!!' + key + '!!', dataObj[key]);
        }
    }

    return string;
}

export {replaceData};