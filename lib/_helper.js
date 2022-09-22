/*
Copyright (c) 2022 Philipp Scheer
*/



const request = require('request');
const fetch = require("node-fetch");
const FormData = require('form-data');


const CONFIG = {
    TOKEN: null,
    ROOT_URL: "https://api.rockeet.ai/v1",
}


class Response {
    constructor(response) {
        this.response = response;
    }

    get success() {
        return this.response.success;
    }

    get result() {
        return this.response.result;
    }
}


module.exports = {
    isLocalFile: (fileName) => {
        return /(\/.*|[a-zA-Z]:\\(?:([^<>:"\/\\|?*]*[^<>:"\/\\|?*.]\\|..\\)*([^<>:"\/\\|?*]*[^<>:"\/\\|?*.]\\?|..\\))?)/.test(fileName);
    },

    isFileId: (fileId) => {
        return /^[a-z]{0,3}_[a-f0-9]{32}$/.test(fileId);
    },

    extractFileId: (obj, key="fileId", index=0) => {
        /* check if object is a response */
        if (obj instanceof Response) {
            if (typeof obj.result === 'string' || obj.result instanceof String) {
                return obj.result;
            }
            if (obj.result instanceof Array) {
                return obj.result[index][key];
            }
            return obj.result[key];
        }
        return obj;
    },

    endpoint(url, data, method="post", form=false, raw=false) {
        return new Promise((resolve, reject) => {
            if (form) {
                /* for all keys in data add a parameter to a formdata */
                let form = new FormData();
                for (key in data) {
                    if (data.hasOwnProperty(key)) {
                        let value = data[key];
                        form.append(key, value);
                    }
                }
                data = form;
            }

            url = CONFIG.ROOT_URL + url;
            if (method.toLowerCase() == "get") {
                url += "?" + Object.entries(data).map(([key,value]) => encodeURIComponent(key) + "=" + encodeURIComponent(Array.isArray(value) ? JSON.stringify(value) : value)).join("&");
            }

            fetch(url, {
                method: method.toUpperCase(),
                body: method.toLowerCase() === "get" ? undefined : (form ? data : JSON.stringify(data)),
                headers: form ? { "Authorization": CONFIG.TOKEN } : {
                    "Authorization": CONFIG.TOKEN,
                    "Content-Type": "application/json"
                }
            }).then(d => {
                if (raw) {
                    resolve(d.buffer());
                } else {
                    d.json().then(d => {
                        resolve(new Response(d))
                    }).catch(reject);
                }
            }).catch(reject);
        });
    },

    setToken(token) {
        CONFIG.TOKEN = token
    },

    getToken() {
        return CONFIG.TOKEN
    },

    Response
}
