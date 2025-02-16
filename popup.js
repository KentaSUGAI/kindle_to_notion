document.getElementById("testConnection").addEventListener("click", () => {
  const apiKey = document.getElementById("notionApiKey").value;
  const databaseId = document.getElementById("databaseId").value;

  // 入力情報を chrome.storage に保存
  chrome.storage.sync.set({ notionApiKey: apiKey, databaseId: databaseId }, () => {
    console.log("APIキーとDatabase IDが保存されました。");
  });

  // 接続テスト：Database の情報を取得
  fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey,
      "Notion-Version": "2022-06-28"
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log("Database info:", data);
    if (data.object === "database") {
      // 例として最初のカラム名を取得して表示
      const properties = data.properties;
      const propertyKeys = Object.keys(properties);
      let columnDisplay = "";
      if (propertyKeys.length > 0) {
        const firstKey = propertyKeys[0];
        columnDisplay = `${firstKey}: ${properties[firstKey].type}`;
      }
      document.getElementById("result").innerText = 
        "接続成功: Database 情報を取得しました。\n例: " + (columnDisplay || "カラム情報なし");
    } else {
      document.getElementById("result").innerText = "接続失敗: Database 情報を取得できませんでした。";
    }
  })
  .catch(error => {
    console.error("Error:", error);
    document.getElementById("result").innerText = "接続エラー: " + error;
  });
});
