"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCollections = exports.collections = void 0;
const __1 = require("..");
const postman_2_swagger_1 = __importDefault(require("postman-2-swagger"));
const path = __importStar(require("path"));
const fs_extra_1 = require("fs-extra");
exports.collections = {};
const generateCollections = (config, spinner) => __awaiter(void 0, void 0, void 0, function* () {
    let swCol = null;
    let pmCol = null;
    //TODO GENERATE TYPE SCHEMAS ON BUILD. AXIOS GET FROM GITHUB!
    const _types = (0, fs_extra_1.readJsonSync)(path.resolve(__dirname, '../../bin/oas-type-schemas.json')) || {};
    spinner.info('Generating Swagger Spec');
    pmCol = yield (0, __1.generatePostmanJson)(config);
    spinner.succeed(`Postman collection generated: open-wa-${config.sessionId}.postman_collection.json`);
    swCol = (0, postman_2_swagger_1.default)(pmCol);
    swCol.tags = [
        {
            "name": "default",
            "description": "All methods from the Client",
            "externalDocs": {
                "description": "Find out more",
                "url": "https://docs.openwa.dev/classes/api_Client.Client.html"
            }
        },
        {
            "name": "meta",
            "description": "Operations related to generating SDKs for this specific API"
        },
        {
            "name": "media",
            "description": "Access files in the /media folder when messagePreProcessor is set to AUTO_DECRYPT_SAVE"
        }
    ];
    /**
     * Fix swagger docs by removing the content type as a required paramater
     */
    Object.keys(swCol.paths).forEach(p => {
        const path = swCol.paths[p].post;
        if (config.key)
            swCol.paths[p].post.security = [
                {
                    "api_key": []
                }
            ];
        swCol.paths[p].operationId = swCol.paths[p].nickname = p.replace("/", "");
        swCol.paths[p].post.externalDocs = {
            "description": "Documentation",
            "url": swCol.paths[p].post.documentationUrl
        };
        swCol.paths[p].post.responses['200'].schema = {
            "$ref": "#/components/schemas/EasyApiResponse"
        };
        swCol.paths[p].post.requestBody = {
            "description": path.summary,
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object"
                    },
                    example: path.parameters[1].example
                }
            }
        };
        delete path.parameters;
    });
    const metaPaths = {
        "/media/{fileName}": {
            "get": {
                "summary": "Get a file from the /media folder",
                "description": "Make sure to set messagePreProcessor to AUTO_DECRYPT_SAVE in order to decrypt and save media within the /media folder",
                tags: ["media"],
                "produces": [
                    "application/pdf",
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp",
                    "audio/mpeg",
                    "audio/ogg",
                    "audio/vorbis",
                    "video/mp4",
                ],
                "parameters": [
                    {
                        "name": "fileName",
                        "in": "path",
                        "description": "The filename, e.g: 2B8A12C1DAF21D8CA34105560D5B1864.jpeg",
                        "required": true,
                        "type": "string",
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Downloaded file"
                    },
                    "404": {
                        "description": "File not found"
                    },
                }
            }
        },
        "/meta/swagger.json": {
            "get": {
                "description": "Get a swagger/OAS collection json",
                tags: ["meta"],
                "produces": [
                    "application/json",
                ],
                "responses": {
                    "200": {
                        "description": "successful request"
                    },
                }
            }
        },
        "/meta/postman.json": {
            "get": {
                "description": "Get a postman collection json",
                tags: ["meta"],
                "produces": [
                    "application/json",
                ],
                "responses": {
                    "200": {
                        "description": "successful request"
                    },
                }
            }
        },
        "/meta/basic/commands": {
            get: {
                "description": "Get a list of possible client methods/commands",
                tags: ["meta"],
                "produces": [
                    "application/json",
                ],
                "responses": {
                    "200": {
                        "description": "successful request"
                    },
                }
            }
        },
        "/meta/basic/listeners": {
            get: {
                "description": "Get a list of possible listeners",
                tags: ["meta"],
                "produces": [
                    "application/json",
                ],
                "responses": {
                    "200": {
                        "description": "successful request"
                    },
                }
            }
        },
        "/meta/codegen/{language}": {
            post: {
                "summary": "Generate SDK",
                "description": "Generate a SDK for this specific API - see https://codegen.openwa.dev/api/gen/clients for list of possible languages",
                tags: ["meta"],
                "parameters": [
                    {
                        "name": "language",
                        "in": "path",
                        "description": "The language to generate the SDK for. ",
                        "required": true,
                        "type": "string",
                    }
                ],
                "responses": {
                    "200": {
                        "description": "successful request"
                    },
                }
            }
        }
    };
    swCol.paths = Object.assign(Object.assign({}, swCol.paths), metaPaths);
    delete swCol.swagger;
    swCol.openapi = "3.0.3";
    swCol.components = {};
    swCol.components.schemas = _types;
    swCol.externalDocs = {
        "description": "Find more info here",
        "url": "https://openwa.dev/"
    };
    if (config.key) {
        swCol.components = Object.assign(Object.assign({}, swCol.components), { "securitySchemes": {
                "api_key": {
                    "type": "apiKey",
                    "name": "api_key",
                    "in": "header"
                }
            } });
        swCol.security = [
            {
                "api_key": []
            }
        ];
    }
    //Sort alphabetically
    const x = {};
    Object.keys(swCol.paths).sort().map(k => x[k] = swCol.paths[k]);
    swCol.paths = x;
    if (!(config === null || config === void 0 ? void 0 : config.skipSavePostmanCollection))
        (0, fs_extra_1.writeJsonSync)("./open-wa-" + config.sessionId + ".sw_col.json", swCol);
    exports.collections['postman'] = pmCol;
    exports.collections['swagger'] = swCol;
    spinner.succeed('API collections (swagger + postman) generated successfully');
    return;
});
exports.generateCollections = generateCollections;
