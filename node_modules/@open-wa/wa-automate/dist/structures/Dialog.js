"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationType = void 0;
var ValidationType;
(function (ValidationType) {
    ValidationType["REGEX"] = "regex";
    ValidationType["LENGTH"] = "length";
    ValidationType["CHECK"] = "check";
})(ValidationType = exports.ValidationType || (exports.ValidationType = {}));
// async function processDialog(dialog: DialogTemplate, chatId: ChatId, client: Client){
//     if(dialog.privateOnly && chatId.includes('g')) return;
//     const requiredProperties = Object.keys(dialog.properties);
//     const requiredPropertiesInOrder = requiredProperties.map(prop=>dialog.properties[prop]).sort((a, b) => a.order - b.order);
//     /**
//      * Send start dialog message
//      */
//     await client.sendText(chatId, dialog.startMessage);
//     requiredPropertiesInOrder.map((diaProp: DialogProperty) => {
//         diaProp.type
//     })
// }
