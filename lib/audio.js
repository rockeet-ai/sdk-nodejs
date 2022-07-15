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
