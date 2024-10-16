import fs from "fs";

function generateTelegramHTML(data: { [key: string]: any }): string {
  let html = "==========\n"; // Thêm đường gạch ngang ở trên

  for (const key in data) {
    html += `<b>${key}:</b> ${data[key]}\n`;
  }

  html += "=========="; // Thêm đường gạch ngang ở dưới

  return html.trim();
}

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

export { generateTelegramHTML, writeFile };
