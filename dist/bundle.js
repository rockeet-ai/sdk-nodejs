(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
Copyright (c) 2022 Philipp Scheer
*/



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

},{}],2:[function(require,module,exports){
/*
Copyright (c) 2022 Philipp Scheer
*/

const { endpoint } = require("./_helper");



class Assistant {
    constructor(assistantId) {
        this.id = assistantId;
    }

    get() {
        return endpoint(`/assistant`, {
            assistantId: this.id
        }, "get");
    }

    delete() {
        return endpoint(`/assistant`, {
            assistantId: this.id
        }, "delete");
    }

    train() {
        return endpoint(`/assistant/train`, {
            assistantId: this.id
        }, "post");
    }

    parse(input, allScores=false) {
        return new Promise((resolve, reject) => {
            endpoint(`/assistant/parse`, {
                assistantId: this.id,
                input,
                allScores
            }, "post").then(d => {
                resolve(d.result);
            }).catch(er => {
                reject(er);
            });
        }) 
    }


    get Entity() {
        return {
            export: (entityName) => {
                return endpoint(`/assistant/entity`, {
                    assistantId: this.id,
                    entityName
                }, "get");
            },
            add: (name, examples, autoExtend=true, useSynonyms=true, strictness=1, metadata={}) => {
                return endpoint(`/assistant/entity`, {
                    assistantId: this.id,
                    name,
                    examples,
                    autoExtend,
                    useSynonyms,
                    strictness,
                    metadata
                }, "post");
            },
            delete: (entityName) => {
                return endpoint(`/assistant/entity`, {
                    assistantId: this.id,
                    entityName
                }, "delete");
            },
            list: (expand) => {
                return new Promise((resolve, reject) => {
                    endpoint(`/assistant/entity`, {
                        assistantId: this.id,
                        expand
                    }, "get").then(d => {
                        resolve(d.result);
                    }).catch(er => {
                        reject(er);
                    });
                })
            }
        }
    }

    get Intent() {
        return {
            add: (name, slots, utterances, metadata) => {
                return endpoint(`/assistant/intent`, {
                    assistantId: this.id,
                    name,
                    slots,
                    utterances,
                    metadata
                }, "post");
            },
            delete: (intentName) => {
                return endpoint(`/assistant/intent`, {
                    assistantId: this.id,
                    intentName
                }, "delete");
            },
            list: (expand=[]) => {
                return endpoint(`/assistant/intents`, {
                    assistantId: this.id,
                    expand
                }, "get");
            },

            Utterance: {
                add: (intentName, utterance, index=undefined) => {
                    return endpoint(`/assistant/intent/utterance`, {
                        assistantId: this.id,
                        intentName,
                        utterance,
                        index
                    }, "put");
                },
                delete: (intentName, index) => {
                    return endpoint(`/assistant/intent/utterance`, {
                        assistantId: this.id,
                        intentName,
                        index
                    }, "delete");
                },
                list: (intentName) => {
                    return endpoint(`/assistant/intent/utterance`, {
                        assistantId: this.id,
                        intentName
                    }, "get");
                }
            },

            Slot: {
                add: (intentName, entityName, slotName) => {
                    return endpoint(`/assistant/intent/slot`, {
                        assistantId: this.id,
                        intentName,
                        entityName,
                        slotName
                    }, "put");
                },
                remove: (intentName, slotName) => {
                    return endpoint(`/assistant/intent/slot`, {
                        assistantId: this.id,
                        intentName,
                        slotName
                    }, "delete");
                },
                list: (intentName, expand=true) => {
                    return endpoint(`/assistant/intent/slot`, {
                        assistantId: this.id,
                        intentName,
                        expand
                    }, "get");
                }
            },
        }
    }

    static list() {
        return endpoint("/assistants", {}, "get");
    }


    /**
     * Create a new assistant
     * @param {string} name A name for the new assistant
     * @param {string} language The language of the assistant. Choose from "en", "de", "es", "fr", "it"
     * @param {object} metadata Metadata to be associated with the assistant 
     * @returns {Promise<Assistant>} A promise with a new assistant object
     */
    static new(name, language, metadata = {}) {
        return new Promise((resolve, reject) => {
            endpoint("/assistant", {
                name,
                language,
                metadata
            }).then(d => {
                resolve(new Assistant(d.result));
            }).catch(er => {
                reject(er);
            });
        });
    }
}


module.exports = Assistant
},{"./_helper":1}],3:[function(require,module,exports){
/*
Copyright (c) 2022 Philipp Scheer
*/


const { extractFileId, endpoint } = require("./_helper");


module.exports = {
    toWave: (fileId) => {
        fileId = extractFileId(fileId);
        return endpoint("/audio/wave", {
            fileId
        });
    },
    profile: (fileId, name, start=null, end=null, metadata={}) => {
        console.log(fileId);
        fileId = extractFileId(fileId);
        return endpoint("/audio/profile", {
            fileId,
            name,
            start,
            end,
            metadata
        });
    },
    speakers: (fileId, profiles, allChunks=false, allScores=false, unknownThreshold=0.75, rate=16) => {
        fileId = extractFileId(fileId);
        for (let i = 0; i < profiles.length; i++) {
            const profile = profiles[i];
            profiles[i] = extractFileId(profile);
        }
        return endpoint("/audio/speakers", {
            fileId,
            profiles,
            allChunks,
            allScores,
            unknownThreshold,
            rate
        });
    }
}

},{"./_helper":1}],4:[function(require,module,exports){
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
},{"./_helper":1}],5:[function(require,module,exports){
/*
Copyright (c) 2022 Philipp Scheer
*/

const File = require("./file");
const { endpoint, extractFileId, isFileId, isLocalFile } = require("./_helper");


module.exports = {
    faces: (fileId, sensitivity=0.9, nms=0.3, scale=1) => {
        return new Promise(async (resolve, reject) => {
            fileId = extractFileId(fileId);
    
            let deleteAfterProcessing = false;
    
            if (!isFileId(fileId)) {
                fileId = extractFileId(await File.upload(fileId));
                deleteAfterProcessing = true;
            }
    
            endpoint("/image/faces", {
                fileId,
                sensitivity,
                nms,
                scale
            }).then(d => {
                if (deleteAfterProcessing) {
                    File.delete(fileId);
                }
                resolve(d);
            }).catch(reject);
        });
    },
    person: async (name, profile, metadata={}) => {
        console.log(profile);

        profile = extractFileId(profile, "profile");

        if (isLocalFile(profile)) {
            profile = extractFileId(await module.exports.faces(profile), "profile");
        }

        return endpoint("/image/person", {
            name,
            profile,
            metadata
        });
    },
    identify: (fileId, profiles=[], sensitivity=0.9, nms=0.3, scale=1, similarity=0.9) => {
        fileId = extractFileId(fileId);
        profiles = profiles.map(profile => extractFileId(profile, "profile") );
        return endpoint("/image/identify", {
            fileId,
            profiles,
            sensitivity,
            nms,
            scale,
            similarity
        });
    },
    similarity: (profile1, profile2, range=false) => {
        profile1 = extractFileId(profile1, "profile");
        profile2 = extractFileId(profile2, "profile");
        return endpoint("/image/similarity", {
            profile1,
            profile2,
            range
        });
    }
}

},{"./_helper":1,"./file":4}],6:[function(require,module,exports){
/*
Copyright (c) 2022 Philipp Scheer
*/


const { extractFileId, endpoint } = require("./_helper");


module.exports = {
    faces: (fileId, profiles, sensitivity=0.9, nms=0.3, scale=1, similarity=0.9, detectionFramesPerSecond=2) => {
        fileId = extractFileId(fileId);
        for (let i = 0; i < profiles.length; i++) {
            const profile = profiles[i];
            profiles[i] = extractFileId(profile);
        }

        return endpoint("/video/faces", {
            fileId, 
            profiles, 
            sensitivity, 
            nms, 
            scale, 
            similarity, 
            detectionFramesPerSecond
        });
    }
}

},{"./_helper":1}],7:[function(require,module,exports){
/*
Copyright (c) 2022 Philipp Scheer
*/


module.exports = {
    Assistant: require("./lib/assistant"),
    File: require("./lib/file"),
    Image: require("./lib/image"),
    Video: require("./lib/video"),
    Audio: require("./lib/audio"),

    setToken: require("./lib/_helper").setToken,
}

},{"./lib/_helper":1,"./lib/assistant":2,"./lib/audio":3,"./lib/file":4,"./lib/image":5,"./lib/video":6}],8:[function(require,module,exports){
/*
Copyright (c) 2022 Philipp Scheer
*/

// Grab an existing namespace object, or create a blank object
// if it doesn't exist
var rockeet = window.rockeet || {};

// Stick on the modules that need to be exported.
// You only need to require the top-level modules, browserify
// will walk the dependency graph and load everything correctly
rockeet = require("./rockeet.js");

// Replace/Create the global namespace
window.rockeet = rockeet;

},{"./rockeet.js":7}]},{},[8]);
