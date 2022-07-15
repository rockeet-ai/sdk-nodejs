/*
Copyright (c) 2022 Philipp Scheer
*/



const CONFIG = {
    TOKEN: null,
    ROOT_URL: "https://api.friday.fipsi.at/v1",
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
            if (method.toLowerCase() == "get") {
                return new Promise((resolve, reject) => {
                    var oReq = new XMLHttpRequest();
                    oReq.addEventListener("load", (ev) => { resolve(raw ? ev.currentTarget.response : JSON.parse(ev.currentTarget.responseText)) });
                    oReq.open("GET", `${CONFIG.ROOT_URL}${url}`);
                    oReq.setRequestHeader("Authorization", CONFIG.TOKEN);
                    oReq.setRequestHeader("Content-Type", "application/json");
                    oReq.send(JSON.stringify(data));
                });
            } else {
                fetch(`${CONFIG.ROOT_URL}${url}`, {
                    method: method,
                    body: form ? data : JSON.stringify(data),
                    headers: form ? { "Authorization": CONFIG.TOKEN } : {
                        "Authorization": CONFIG.TOKEN,
                        "Content-Type": "application/json"
                    }
                }).then(d => {
                    if (raw) {
                        resolve(d.arrayBuffer());
                    } else {
                        d.json().then(d => {
                            resolve(new Response(d))
                        }).catch(reject);
                    }
                }).catch(reject);
            }
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
