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
