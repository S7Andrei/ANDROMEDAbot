"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _helpers = require("./_helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const template = {
  swagger: '2.0'
};

const makeAddMember = (paths, tag) => member => {
  const request = member.request;
  const fullPath = `/${request.url.path.join('/')}`;
  const method = request.method;
  const parameters = (0, _helpers.convertheaders)(request).concat((0, _helpers.convertBody)(request));
  const responses = (0, _helpers.convertResponses)(member.responses);

  _lodash.default.set(paths, `${fullPath}.${method.toLowerCase()}`, {
    description: _lodash.default.get(request, 'description.content'),
    summary: _lodash.default.get(member, 'name'),
    tags: [tag],
    produces: ['application/json'],
    // operationId: 'SiraEstimatesPost',
    parameters,
    responses
  });

  return paths;
}; // Collection is postman collection


var _default = collection => {
  // eslint-disable-next-line
  const {
    npm_package_version
  } = process.env; // Clone

  const newSwagger = _objectSpread({}, template); // Info


  _lodash.default.set(newSwagger, 'version', npm_package_version);

  _lodash.default.set(newSwagger, 'schemes', (0, _helpers.convertSchemes)(collection));

  _lodash.default.set(newSwagger, 'info', {
    title: collection.name,
    version: npm_package_version,
    description: _lodash.default.get(collection, 'description.content', 'No description'),
    host: (0, _helpers.convertCommonHost)(collection)
  });

  const paths = {};
  collection.items.members.forEach(group => {
    // Ignore from docs folders starting with __
    if (group.name.startsWith('__')) return;
    const tag = group.name; // The default root one

    if (!group.items) {
      makeAddMember(paths, 'default')(group);
      return;
    } // Folders


    const members = group.items.members;
    members.forEach(makeAddMember(paths, tag));
  });
  return _objectSpread({}, newSwagger, {
    paths
  });
};

exports.default = _default;