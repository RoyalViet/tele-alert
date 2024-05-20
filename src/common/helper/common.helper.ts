function generateTelegramHTML(data: { [key: string]: any }): string {
  let html = "";

  for (const key in data) {
    html += `<b>${key}:</b> ${data[key]}\n`;
  }

  return html.trim();
}

export { generateTelegramHTML };
