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