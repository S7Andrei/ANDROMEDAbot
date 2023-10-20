"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertCommonHost = convertCommonHost;
exports.convertSchemes = convertSchemes;
exports.convertheaders = convertheaders;
exports.convertBody = convertBody;
exports.convertResponses = convertResponses;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * helpers
 */
function convertCommonHost(collection) {
  const hosts = collection.items.members.map(item => {
    const url = item.request && item.request.url;
    if (!url) return undefined;
    return url.host.join('/');
  }).filter(url => !!url); // Find most frequent

  return _lodash.default.head((0, _lodash.default)(hosts).countBy().entries().maxBy('[1]'));
}

function convertSchemes(collection) {
  return _lodash.default.uniq(collection.items.members.map(item => {
    const url = _lodash.default.get(item, 'request.url');

    if (!url) return undefined;
    return url.protocol;
  })).filter(protocol => !!protocol);
}

function convertheaders(request) {
  return request.headers.members.map(header => ({
    name: header.key,
    in: 'header',
    required: true,
    type: 'string',
    example: header.value
  }));
}

function convertBody(request) {
  const rawBody = _lodash.default.get(request, 'body.raw');

  if (!rawBody) return undefined;
  const exampleBody = {
    name: 'Body',
    in: 'body',
    required: true
  };

  try {
    exampleBody.example = JSON.parse(rawBody);
    exampleBody.properties = _lodash.default.mapValues(exampleBody.example, value => ({
      description: '',
      example: value,
      type: typeof value
    }));
  } catch (e) {
    exampleBody.example = _lodash.default.truncate(rawBody, {
      length: 250
    });
  } finally {
    exampleBody.type = typeof exampleBody.example;
  }

  return [exampleBody];
}

function convertResponses(_responses) {
  /* istanbul ignore next */
  if (!_lodash.default.get(_responses, 'members.length')) return undefined;
  const members = _responses.members;
  const responses = {};
  members.forEach(member => {
    // Description
    _lodash.default.set(responses, member.code, {
      description: `${_lodash.default.get(member, '_details.standardName')} - ${_lodash.default.get(member, '_details.detail')}`
    }); // Response body


    if (member.body) {
      try {
        const json = JSON.parse(member.body);

        _lodash.default.set(responses, `${member.code}.examples.application/json`, json);
      } catch (e) {
        /* istanbul ignore next */
        _lodash.default.set(responses, `${member.code}.examples.application/text`, _lodash.default.truncate(member.body, {
          length: 250
        }));
      }
    }
  });
  return responses;
}