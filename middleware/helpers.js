exports.trim = function(req, res, next) {

    // Usage: To trim each and every property of the request payload
    let requestObj = JSON.stringify(req.body);

    // Regex to capture spaces before & after double-quotes(   "   )
    const pattern = /(\s)*\"(\s)*/g;
    requestObj = requestObj.replace(pattern, '\"');

    req.body = JSON.parse(requestObj);
    next();
}