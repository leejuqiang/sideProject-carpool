var server = require("./server");

exports.onRequest = function (req, res) {
    ret = { "error": server.errorCode.ok };
    server.database.getUser(req.body.userID, req.body.sessionID, function (user, error) {
        if (error === null) {
            server.database.getUserDriverInfo(user, function (error) {
                if (error === null) {
                    server.database.getUserPassengerInfo(user, function (error) {
                        if (error === null) {
                            var postIds = [];
                            for (var app in user.post.repeatedPost) {
                                postIds.push(app._id);
                            }
                            var addPostIds = [];
                            for (var app in user.post.addPost) {
                                addPostIds.push(app._id);
                            }
                            server.database.getApplicationForUser(user, postIds, addPostIds, function (err) {
                                if (err !== null) {
                                    ret.error = server.errorCode.databaseError;
                                    server.respond(res, ret);
                                } else {
                                    ret["repeatedPost"] = user.post.repeatedPost;
                                    ret["additionalPost"] = user.post.addPost;
                                    ret["cancellationPost"] = user.post.cancel;
                                    ret["repeatedApplication"] = user.application.apps;
                                    ret["additionalApplication"] = user.application.addApps;
                                    ret["repeatApplicationForPost"] = user.repeatAppForPost;
                                    ret["addApplicationForPost"] = user.addAppForPost;
                                    server.respond(res, ret);
                                }
                            });
                        } else {
                            ret.error = server.errorCode.databaseError;
                            server.respond(res, ret)
                        }
                    });
                } else {
                    ret.error = server.errorCode.databaseError;
                    server.respond(res, ret);
                }
            });
        } else {
            ret.error = server.errorCode.noSuchUser;
            server.respond(res, ret);
        }
    });
}