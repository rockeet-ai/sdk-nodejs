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
            url = CONFIG.ROOT_URL + url;
            if (method.toLowerCase() == "get") {
                url += "?" + Object.entries(data).map(([key,value]) => encodeURIComponent(key) + "=" + (Array.isArray(value) ? value.map(encodeURIComponent).join(",") : encodeURIComponent(value))).join("&");
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
                    resolve(d.arrayBuffer());
                } else {
                    d.json().then(d => {
                        resolve(new Proxy(d, {
                            get(target, name, receiver) {
                                console.log(target, name, receiver, target.result, name);

                                if (name === "result") return target.result;
                                if (name === "success") return target.success;

                                // if (name === "map") return target.result.map;
                                // if (name === "forEach") return target.result.forEach;
                                // if (name === "filter") return target.result.filter;
                                // if (name === "reduce") return target.result.reduce;

                                if (target.result.constructor == Object || Array.isArray(target.result)) {
                                    if (Reflect.has(target.result, name)) {
                                        return Reflect.get(target.result, name, receiver);
                                    }
                                } else {
                                    return target.result;
                                }
                            }
                        }));
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
