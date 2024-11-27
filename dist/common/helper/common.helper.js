"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeMarkdown = escapeMarkdown;
exports.formatBigNumberByUnit = formatBigNumberByUnit;
exports.generateTelegramMarkdown = generateTelegramMarkdown;
exports.generateTelegramHTML = generateTelegramHTML;
exports.writeFile = writeFile;
exports.delay = delay;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const fs_1 = __importDefault(require("fs"));
const bigNumber_1 = require("./bigNumber");
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
function formatBigNumberByUnit(num, options) {
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "K" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "B" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" },
    ];
    const bigNum = (0, bigNumber_1.bigNumber)(num);
    const item = lookup
        .slice()
        .reverse()
        .find(function (item) {
        return bigNum.isGreaterThanOrEqualTo(item.value);
    });
    if (item) {
        const fmt = {
            decimalSeparator: ".",
            groupSeparator: ",",
            groupSize: 3,
        };
        return (bigNum
            .dividedBy(item.value)
            .toFormat(options?.decimal ?? 3, bignumber_js_1.default.ROUND_UP, fmt) + item.symbol);
    }
    return bigNum.toString();
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