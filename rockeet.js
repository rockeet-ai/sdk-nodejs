/*
Copyright (c) 2022 Philipp Scheer
*/


module.exports = {
    Assistant: require("./lib/assistant"),
    File: require("./lib/file"),
    Image: require("./lib/image"),
    // Video: require("./lib/video"),
    Audio: require("./lib/audio"),

    setToken: require("./lib/_helper").setToken,
}
