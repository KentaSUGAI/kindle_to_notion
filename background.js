chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyToNotion",
    title: "Notion にコピーする",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copyToNotion") {
    console.log("[background.js] Context menu clicked. Selected text:", info.selectionText);
    chrome.tabs.sendMessage(tab.id, {
      action: "copyToNotion",
      selectedText: info.selectionText
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "postToNotion") {
    console.log("[background.js] Received postToNotion message with notionData:", message.notionData);
    const notionData = message.notionData;
    chrome.storage.sync.get(["notionApiKey", "databaseId"], (items) => {
      console.log("[background.js] Retrieved storage items:", items);
      const apiKey = items.notionApiKey || "YOUR_NOTION_API_KEY";
      // databaseId を storage から上書きする（あれば）
      if (items.databaseId) {
        notionData.parent.database_id = items.databaseId;
      }
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
