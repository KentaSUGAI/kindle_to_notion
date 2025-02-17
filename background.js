// --- background.js ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
      id: "copyToNotion",
      title: "Notion にコピーする",
      contexts: ["selection"]
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "postToNotion") {
      console.log("[background.js] Received postToNotion message with notionData:", message.notionData);
      const notionData = message.notionData;

      chrome.storage.sync.get(["notionApiKey", "databaseId"], (items) => {
          console.log("[background.js] Retrieved storage items:", items);
          const apiKey = items.notionApiKey;
          const databaseId = items.databaseId;

          if (!apiKey) {
              console.error("[background.js] Notion API Key is not set.");
              sendResponse({ success: false, error: "Notion API Key が設定されていません。" });
              return;
          }
          if (!databaseId) {
              console.error("[background.js] Database ID is not set.");
              sendResponse({ success: false, error: "Notion Database ID が設定されていません。" });
              return;
          }

          notionData.parent = { database_id: databaseId };

          console.log("[background.js] Final notionData to send:", notionData);

          fetch("https://api.notion.com/v1/pages", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + apiKey,
                  "Notion-Version": "2022-06-28"
              },
              body: JSON.stringify(notionData)
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
              sendResponse({ success: true, data: data });
          })
          .catch(error => {
              console.error("[background.js] Error during Notion API request:", error);
              sendResponse({ success: false, error: error.toString() });
          });
      });
      return true;
  }
});