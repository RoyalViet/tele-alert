"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTelegramHTML = void 0;
function generateTelegramHTML(data) {
    let html = "";
    for (const key in data) {
        html += `<b>${key}:</b> ${data[key]}\n`;
    }
    return html.trim();
}
exports.generateTelegramHTML = generateTelegramHTML;
//# sourceMappingURL=common.helper.js.map