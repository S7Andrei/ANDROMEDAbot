"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _postmanCollection = require("postman-collection");

var _swagger = _interopRequireDefault(require("./converters/swagger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Converts postman collections to swagger (maybe more formats later)
 */
const postmanToSwagger = json => {
  /* istanbul ignore next */
  if (!json) throw new Error('Misuse, please look at docs');
  return (0, _swagger.default)(new _postmanCollection.Collection(json));
};

var _default = postmanToSwagger;
exports.default = _default;