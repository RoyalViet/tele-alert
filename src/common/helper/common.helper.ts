import fs from "fs";

export function escapeMarkdown(text: string): string {
  return text
    .replace(/_/g, "\\_")
    .replace(/\*/g, "\\*")
    .replace(/~/g, "\\~")
    .replace(/`/g, "\\`")
    .replace(/>/g, "\\>")
    .replace(/</g, "\\<")
    .replace(/&/g, "\\&");
}

function generateTelegramHTML(data: { [key: string]: any }): string {
  let html = "====================\n";

  for (const key in data) {
    html += `<b>${key}:</b> ${data[key]}\n`;
  }

  html += "====================";

  return html.trim();
}

function generateTelegramMarkdown(data: { [key: string]: any }): string {
  let markdown = "====================\n"; // Thêm đường gạch ngang ở trên

  for (const key in data) {
    markdown += `*${key}:* ${data[key]}\n`; // Sử dụng * để in đậm
  }

  markdown += "===================="; // Thêm đường gạch ngang ở dưới

  return markdown.trim();
}
// function generateTelegramMarkdown(data: { [key: string]: any }): string {
//   let markdown = "====================\n"; // Thêm đường gạch ngang ở trên

//   for (const key in data) {
//     const escapedKey = escapeMarkdown(key);
//     const escapedValue = escapeMarkdown(String(data[key])); // Chuyển đổi giá trị thành chuỗi và escape
//     markdown += `*${escapedKey}:* ${escapedValue}\n`; // Sử dụng * để in đậm
//   }

//   markdown += "===================="; // Thêm đường gạch ngang ở dưới

//   return markdown.trim();
// }

function writeFile(name: string, data: any) {
  const jsonData = JSON.stringify(data, null, 2); // Convert the JSON object to a string with indentation
  fs.writeFile(name, jsonData, "utf8", (err) => {
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

export { generateTelegramMarkdown, generateTelegramHTML, writeFile, delay };
