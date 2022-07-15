/*
Copyright (c) 2022 Philipp Scheer
*/

const { endpoint, extractFileId } = require("./_helper");


module.exports = {
    faces: (fileId, sensitivity=0.9, nms=0.3, scale=1) => {
        fileId = extractFileId(fileId);
        return endpoint("/image/faces", {
            fileId,
            sensitivity,
            nms,
            scale
        })
    },
    person: (name, profile, metadata={}) => {
        profile = extractFileId(profile, "profile");
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
