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
