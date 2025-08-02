import BigNumber from "bignumber.js";
import fs from "fs";
import { bigNumber } from "./bigNumber";

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

export function formatBigNumberByUnit(
  num: number | BigNumber,
  options?: Partial<{ decimal: number }>
) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const bigNum = bigNumber(num);

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

    return (
      bigNum
        .dividedBy(item.value)
        .toFormat(options?.decimal ?? 3, BigNumber.ROUND_UP, fmt) + item.symbol
    );
  }

  return bigNum.toString();
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
  let markdown = "====================\n";

  for (const key in data) {
    markdown += `*${key}:* ${data[key]}\n`;
  }

  markdown += "====================";

  return markdown.trim();
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

async function delay(time = 3000) {
  await new Promise((resolve) => setTimeout(resolve, time));
}

export { generateTelegramMarkdown, generateTelegramHTML, writeFile, delay };
