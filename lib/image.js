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
