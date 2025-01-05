import axios from "axios";

const TOKEN_DISCORD = process.env.TOKEN_DISCORD;
const CHANNEL_ID = process.env.CHANNEL_ID_DISCORD;

export const sendMessageDiscord = async (content: string): Promise<void> => {
  const url: string = `https://discord.com/api/v9/channels/${CHANNEL_ID}/messages`;

  const headers = {
    Accept: "*/*",
    "Content-Type": "application/json",
    Authorization: TOKEN_DISCORD,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "x-debug-options": "bugReporterEnabled",
    "x-discord-locale": "en-US",
    "x-discord-timezone": "Asia/Saigon",
  };

  const body = {
    mobile_network_type: "unknown",
    content: content,
    nonce: Date.now().toString(), // Create a unique nonce
    tts: false,
    flags: 0,
  };

  try {
    const response = await axios.post(url, body, { headers: headers });
    console.log("Message sent successfully:", response?.data?.content);
  } catch (error: any) {
    if (error.response) {
      console.error("Error sending message:", error.response.data);
    } else {
      console.error("Error sending message:", error.message);
    }
  }
};
