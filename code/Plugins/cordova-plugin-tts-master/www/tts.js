/*

    Cordova Text-to-Speech Plugin
    https://github.com/vilic/cordova-plugin-tts

    by VILIC VANE
    https://github.com/vilic

    MIT License

*/
exports.silence = function(Time, onSuccessCallback, onrejected) {
    var ThenFail = window.ThenFail;
    var promise;

    if (ThenFail && !onfulfilled && !onrejected) {
        promise = new ThenFail();
    }
    cordova
        .exec(onSuccessCallback, function (reason) {
            if (promise) {
                promise.reject(reason);
            } else if (onrejected) {
                onrejected(reason);
            }
        }, 'TTS', 'silence', [Time]);

    return promise;
}

exports.speak = function (Text, onSuccessCallback, onrejected) {
    var ThenFail = window.ThenFail;
    var promise;

    if (ThenFail && !onfulfilled && !onrejected) {
        promise = new ThenFail();
    }
    
    var
        text = "",
        locale = "it-IT",
        rate = 1.0;

    if (typeof Text === 'string')
        text = Text;
    else {
        if (typeof Text.text === "string")
            text = Text.text;
        if (typeof Text.locale === "string")
            locale = Text.locale;
        if (typeof Text.rate === "number")
            rate = Text.rate;
    }
    cordova
        .exec(onSuccessCallback, function (reason) {
            if (promise) {
                promise.reject(reason);
            } else if (onrejected) {
                onrejected(reason);
            }
        }, 'TTS', 'speak', [text,locale,rate]);

    return promise;
};