"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = exports.generateTelegramHTML = void 0;
const fs_1 = __importDefault(require("fs"));
function generateTelegramHTML(data) {
    let html = "";
    for (const key in data) {
        html += `<b>${key}:</b> ${data[key]}\n`;
    }
    return html.trim();
}
exports.generateTelegramHTML = generateTelegramHTML;
function writeFile(name, data) {
    const jsonData = JSON.stringify(data, null, 2); // Convert the JSON object to a string with indentation
    fs_1.default.writeFile(name, jsonData, "utf8", (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`File ${name} saved successfully.`);
    });
}
exports.writeFile = writeFile;
//# sourceMappingURL=common.helper.js.map