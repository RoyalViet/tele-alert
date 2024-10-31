"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeMarkdown = escapeMarkdown;
exports.generateTelegramMarkdown = generateTelegramMarkdown;
exports.generateTelegramHTML = generateTelegramHTML;
exports.writeFile = writeFile;
exports.delay = delay;
const fs_1 = __importDefault(require("fs"));
function escapeMarkdown(text) {
    return text
        .replace(/_/g, "\\_")
        .replace(/\*/g, "\\*")
        .replace(/~/g, "\\~")
        .replace(/`/g, "\\`")
        .replace(/>/g, "\\>")
        .replace(/</g, "\\<")
        .replace(/&/g, "\\&");
}
function generateTelegramHTML(data) {
    let html = "====================\n";
    for (const key in data) {
        html += `<b>${key}:</b> ${data[key]}\n`;
    }
    html += "====================";
    return html.trim();
}
function generateTelegramMarkdown(data) {
    let markdown = "====================\n";
    for (const key in data) {
        markdown += `*${key}:* ${data[key]}\n`;
    }
    markdown += "====================";
    return markdown.trim();
}
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
async function delay(time = 3000) {
    await new Promise((resolve) => setTimeout(resolve, time));
}
//# sourceMappingURL=common.helper.js.map