chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "copyToNotion") {
    console.log("[content.js] Received copyToNotion message", message);
    const selectedText = message.selectedText;
    console.log("[content.js] selectedText:", selectedText);

    // Book Title と Author を指定のタグから取得する
    // Book Title は <h3> 内のテキストを取得
    const bookTitleElement = document.querySelector("div.a-column.a-span5 h3.a-spacing-top-small.a-color-base.kp-notebook-selectable.kp-notebook-metadata");
    const bookTitle = bookTitleElement ? bookTitleElement.innerText.trim() : "";
    console.log("[content.js] Extracted Book Title:", bookTitle);

    // Author は <p> タグ（該当するクラスを持つもの）から取得
    const authorElement = document.querySelector("div.a-column.a-span5 p.a-spacing-none.a-spacing-top-micro.a-size-base.a-color-secondary.kp-notebook-selectable.kp-notebook-metadata");
    const author = authorElement ? authorElement.innerText.trim() : "";
    console.log("[content.js] Extracted Author:", author);

    // ユーザーにコメント入力を促す（任意）
    const comment = prompt("コメントを入力してください (任意):", "") || "";
    console.log("[content.js] comment:", comment);

    // 現在時刻（Created At 用）
    const createdAt = new Date().toISOString();
    console.log("[content.js] createdAt:", createdAt);

    // プロパティ名のマッピング（DB の実際のプロパティ名に合わせる）
    const dbMapping = {
      highlight: "Highlight",
      createdAt: "Created At",
      comment: "Comment",
      bookTitle: "Book Title", // セレクト型
      author: "Author"          // セレクト型
      // 必要なら他のプロパティも追加
    };

    // DB に送信する payload を作成（各プロパティは Notion のデータベースのスキーマに合わせる）
    const notionData = {
      parent: { database_id: "YOUR_DATABASE_ID" },
      properties: {
        [dbMapping.highlight]: {
          title: [
            {
              text: { content: selectedText }
            }
          ]
        },
        [dbMapping.createdAt]: {
          date: { start: createdAt }
        },
        [dbMapping.comment]: {
          rich_text: [
            {
              text: { content: comment }
            }
          ]
        },
        // Book Title と Author はセレクト型の場合、既存の選択肢と完全に一致する必要があります
        [dbMapping.bookTitle]: {
          select: { name: bookTitle }
        },
        [dbMapping.author]: {
          select: { name: author }
        }
      }
    };
    console.log("[content.js] Prepared notionData for DB:", notionData);

    // background.js 経由で Notion API へ送信
    chrome.runtime.sendMessage({ action: "postToNotion", notionData: notionData }, (response) => {
      console.log("[content.js] Received response from background:", response);
      if (response && response.success) {
        // alert("Notion DB にデータが入力されました！");
      } else {
        alert("Notion への書き込みに失敗しました。詳細はコンソールを確認してください。");
      }
    });
  }
});