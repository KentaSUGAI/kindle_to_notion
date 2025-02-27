// --- background.js ---

/**
 * 拡張機能のインストール時にコンテキストメニューを作成する
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyToNotion",
    title: "Notion にコピーする",
    contexts: ["selection"]
  });
});

/**
 * メッセージハンドラーを設定する
 * Notionへのデータ送信を処理する
 */
chrome.runtime.onMessage.addListener((message, sender, send_response) => {
  if (message.action === "postToNotion") {
    console.log("[background.js] Received postToNotion message with notionData:", message.notionData);
    const notion_data = message.notionData;

    chrome.storage.sync.get(["notionApiKey", "databaseId"], (items) => {
      console.log("[background.js] Retrieved storage items:", items);
      const api_key = items.notionApiKey;
      const database_id = items.databaseId;

      if (!api_key) {
        console.error("[background.js] Notion API Key is not set.");
        send_response({ success: false, error: "Notion API Key が設定されていません。" });
        return;
      }
      if (!database_id) {
        console.error("[background.js] Database ID is not set.");
        send_response({ success: false, error: "Notion Database ID が設定されていません。" });
        return;
      }

      notion_data.parent = { database_id: database_id };

      console.log("[background.js] Final notionData to send:", notion_data);

      fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + api_key,
          "Notion-Version": "2022-06-28"
        },
        body: JSON.stringify(notion_data)
      })
      .then(response => {
        console.log("[background.js] Raw response:", response);
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Notion API Error: ${response.status} - ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("[background.js] Notion API response data:", data);
        send_response({ success: true, data: data });
      })
      .catch(error => {
        console.error("[background.js] Error during Notion API request:", error);
        send_response({ success: false, error: error.toString() });
      });
    });
    return true;
  }
});