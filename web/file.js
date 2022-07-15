/*
Copyright (c) 2022 Philipp Scheer
*/


const { endpoint, extractFileId } = require("./_helper");


module.exports = {
    upload: (file) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("file", file);
            endpoint("/file", formData, method="post", form=true).then(resolve).catch(reject);
        });
    },
    list: () => {
        return new Promise((resolve, reject) => {
            endpoint("/files", {}, "get").then(d => {
                resolve(d.result);
            }).catch(reject);
        });
    },
    download: (fileId) => {
        fileId = extractFileId(fileId);
        return endpoint(`/file/${fileId}`, {}, "get", form=false, raw=true);
    },
    delete: (fileId) => {
        if (fileId instanceof Array) {
            let deleteArray = [];
            for (let i = 0; i < fileId.length; i++) {
                const file = extractFileId(fileId[i]);
                deleteArray.push(endpoint(`/file/${file}`, {}, "delete"));
            }
            return deleteArray;
        } else {
            return endpoint(`/file/${fileId}`, {}, "delete");
        }
    }
}