// --- content.js ---
function addNotionButtons() {
  const highlightContainers = document.querySelectorAll('div.a-row.a-spacing-base');
  const bookTitleElement = document.querySelector("div.a-column.a-span5 h3.a-spacing-top-small.a-color-base.kp-notebook-selectable.kp-notebook-metadata");
  const bookTitle = bookTitleElement ? bookTitleElement.innerText.trim() : "";
  const authorElement = document.querySelector("div.a-column.a-span5 p.a-spacing-none.a-spacing-top-micro.a-size-base.a-color-secondary.kp-notebook-selectable.kp-notebook-metadata");
  const author = authorElement ? authorElement.innerText.trim() : "";

  highlightContainers.forEach(container => {
    const highlightElement = container.querySelector('span#highlight');
    if (!highlightElement) {
      return;
    }

    if (container.querySelector('.notion-copy-button')) {
      return;
    }

    const highlightText = highlightElement.innerText.trim();

    const button = document.createElement('button');
    button.textContent = 'Notion にコピー';
    button.classList.add('notion-copy-button');
    button.style.cssText = `
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 5px 10px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
            margin-left: 10px;
            cursor: pointer;
            border-radius: 4px;
        `;

    button.addEventListener('click', () => {
      const dbMapping = {
        highlight: "Highlight",
        createdAt: "Created At",
        comment: "Comment",
        bookTitle: "Book Title",
        author: "Author"
      };

      const createdAt = new Date().toISOString();
      const notionData = {
        // parent は background.js で設定
        properties: {
          [dbMapping.highlight]: { title: [{ text: { content: highlightText } }] },
          [dbMapping.createdAt]: { date: { start: createdAt } },
          [dbMapping.comment]: { rich_text: [{ text: { content: "" } }] },
          [dbMapping.bookTitle]: { select: { name: bookTitle } },
          [dbMapping.author]: { select: { name: author } }
        }
      };

      console.log("[content.js] Prepared notionData for DB:", notionData);

      chrome.runtime.sendMessage({ action: "postToNotion", notionData: notionData }, (response) => {
        if (response && response.success) {
          button.textContent = 'コピー済';
          button.disabled = true;
          button.style.backgroundColor = "#888";
        } else {
          console.error("[content.js] Error posting to Notion:", response);
          alert("Notionへの書き込みに失敗しました。詳細はコンソールを確認してください。");
        }
      });
    });

      //highlightの存在するコンテナに追加するように変更。
      const highlightContainer = highlightElement.closest('.a-row.a-spacing-base');
      if (highlightContainer) {
        highlightContainer.appendChild(button);
      }
  });
}

addNotionButtons();
const observer = new MutationObserver(addNotionButtons);
const config = { childList: true, subtree: true };
observer.observe(document.body, config);