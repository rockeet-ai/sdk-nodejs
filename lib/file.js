/*
Copyright (c) 2022 Philipp Scheer
*/


const fs = require("fs");
const { endpoint, extractFileId } = require("./_helper");


module.exports = {
    upload: (pathOrReadStream) => {
        return new Promise((resolve, reject) => {
            if (typeof pathOrReadStream === 'string' || pathOrReadStream instanceof String) {
                if (fs.lstatSync(pathOrReadStream).isFile()) {
                    pathOrReadStream = fs.createReadStream(pathOrReadStream);
                } else {
                    reject("path is a directory, must be a file");
                }
            }
            endpoint("/file", {
                file: pathOrReadStream
            }, method="post", form=true).then(resolve).catch(reject);
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