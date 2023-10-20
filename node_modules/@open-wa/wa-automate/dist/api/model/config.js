"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseType = exports.QRQuality = exports.OnError = exports.NotificationLanguage = exports.DIRECTORY_STRATEGY = exports.CLOUD_PROVIDERS = exports.QRFormat = void 0;
/**
 * The different types of qr code output.
 */
var QRFormat;
(function (QRFormat) {
    QRFormat["PNG"] = "png";
    QRFormat["JPEG"] = "jpeg";
    QRFormat["WEBM"] = "webm";
})(QRFormat = exports.QRFormat || (exports.QRFormat = {}));
var CLOUD_PROVIDERS;
(function (CLOUD_PROVIDERS) {
    CLOUD_PROVIDERS["GCP"] = "GCP";
    CLOUD_PROVIDERS["WASABI"] = "WASABI";
    CLOUD_PROVIDERS["AWS"] = "AWS";
    CLOUD_PROVIDERS["CONTABO"] = "CONTABO";
    CLOUD_PROVIDERS["DO"] = "DO";
    CLOUD_PROVIDERS["MINIO"] = "MINIO";
})(CLOUD_PROVIDERS = exports.CLOUD_PROVIDERS || (exports.CLOUD_PROVIDERS = {}));
var DIRECTORY_STRATEGY;
(function (DIRECTORY_STRATEGY) {
    /**
     * E.g `/2021-08-16/`
     */
    DIRECTORY_STRATEGY["DATE"] = "DATE";
    /**
     * E.g `/447123456789/`
     */
    DIRECTORY_STRATEGY["CHAT"] = "CHAT";
    /**
     * E.g `/447123456789/2021-08-16/`
     */
    DIRECTORY_STRATEGY["CHAT_DATE"] = "CHAT_DATE";
    /**
     * E.g `/2021-08-16/447123456789/`
     */
    DIRECTORY_STRATEGY["DATE_CHAT"] = "DATE_CHAT";
})(DIRECTORY_STRATEGY = exports.DIRECTORY_STRATEGY || (exports.DIRECTORY_STRATEGY = {}));
/**
 * The available languages for the host security notification
 */
var NotificationLanguage;
(function (NotificationLanguage) {
    NotificationLanguage["PTBR"] = "pt-br";
    NotificationLanguage["ENGB"] = "en-gb";
    NotificationLanguage["DEDE"] = "de-de";
    NotificationLanguage["IDID"] = "id-id";
    NotificationLanguage["ITIT"] = "it-it";
    NotificationLanguage["NLNL"] = "nl-nl";
    NotificationLanguage["ES"] = "es";
})(NotificationLanguage = exports.NotificationLanguage || (exports.NotificationLanguage = {}));
var OnError;
(function (OnError) {
    /**
     * Return it as a string
     */
    OnError["AS_STRING"] = "AS_STRING";
    /**
     * Do not log anything, just return `false`
     */
    OnError["RETURN_FALSE"] = "RETURN_FALSE";
    /**
     * throw the error
     */
    OnError["THROW"] = "THROW";
    /**
     * Log the error and return false
     */
    OnError["LOG_AND_FALSE"] = "LOG_AND_FALSE";
    /**
     * Log the error AND return the string
     */
    OnError["LOG_AND_STRING"] = "LOG_AND_STRING";
    /**
     * Return the error object
     */
    OnError["RETURN_ERROR"] = "RETURN_ERROR";
    /**
     * Do nothing.
     */
    OnError["NOTHING"] = "NOTHING";
})(OnError = exports.OnError || (exports.OnError = {}));
/**
 * The set values of quality you can set for the quality of the qr code output. Ten being the highest quality.
 */
var QRQuality;
(function (QRQuality) {
    QRQuality[QRQuality["ONE"] = 0.1] = "ONE";
    QRQuality[QRQuality["TWO"] = 0.2] = "TWO";
    QRQuality[QRQuality["THREE"] = 0.3] = "THREE";
    QRQuality[QRQuality["FOUR"] = 0.4] = "FOUR";
    QRQuality[QRQuality["FIVE"] = 0.5] = "FIVE";
    QRQuality[QRQuality["SIX"] = 0.6] = "SIX";
    QRQuality[QRQuality["SEVEN"] = 0.7] = "SEVEN";
    QRQuality[QRQuality["EIGHT"] = 0.8] = "EIGHT";
    QRQuality[QRQuality["NINE"] = 0.9] = "NINE";
    QRQuality[QRQuality["TEN"] = 1] = "TEN";
})(QRQuality = exports.QRQuality || (exports.QRQuality = {}));
var LicenseType;
(function (LicenseType) {
    LicenseType["CUSTOM"] = "CUSTOM";
    LicenseType["B2B_RESTRICTED_VOLUME_LICENSE"] = "B2B_RESTRICTED_VOLUME_LICENSE";
    LicenseType["INSIDER"] = "Insiders Program";
    LicenseType["TEXT_STORY"] = "Text Story License Key";
    LicenseType["IMAGE_STORY"] = "Image Story License Key";
    LicenseType["VIDEO_STORY"] = "Video Story License Key";
    LicenseType["PREMIUM"] = "Premium License Key";
    LicenseType["NONE"] = "NONE";
})(LicenseType = exports.LicenseType || (exports.LicenseType = {}));
