// --- content.js ---

// トースト通知のスタイルを注入
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
  .notion-toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .notion-toast {
    min-width: 250px;
    max-width: 350px;
    background-color: #fff;
    color: #37352f;
    box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, 
                rgba(15, 15, 15, 0.1) 0px 2px 4px;
    border-radius: 4px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    animation: toast-in-right 0.3s ease, toast-out 0.3s ease 2.7s forwards;
    pointer-events: auto;
  }
  
  .notion-toast.success {
    border-left: 4px solid #2ecc71;
  }
  
  .notion-toast.error {
    border-left: 4px solid #e74c3c;
  }
  
  .notion-toast-icon {
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .notion-toast-icon.success {
    color: #2ecc71;
  }
  
  .notion-toast-icon.error {
    color: #e74c3c;
  }
  
  .notion-toast-content {
    flex: 1;
  }
  
  .notion-toast-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .notion-toast-message {
    font-size: 13px;
    color: #454545;
  }
  
  .notion-toast-close {
    color: #999;
    font-size: 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    margin-left: 8px;
  }
  
  @keyframes toast-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes toast-out {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  `;
  document.head.appendChild(style);
}

// トースト通知クラス
class NotionToast {
  constructor() {
    this.createContainer();
  }

  createContainer() {
    // 既存のコンテナがあれば削除
    const existingContainer = document.querySelector('.notion-toast-container');
    if (existingContainer) {
      return;
    }

    // 新しいコンテナを作成
    this.container = document.createElement('div');
    this.container.className = 'notion-toast-container';
    document.body.appendChild(this.container);
  }

  show(options = {}) {
    const { title, message, type = 'success', duration = 3000 } = options;
    
    // コンテナがなければ作成
    if (!document.querySelector('.notion-toast-container')) {
      this.createContainer();
    }
    
    // コンテナを取得
    this.container = document.querySelector('.notion-toast-container');

    // トースト要素を作成
    const toast = document.createElement('div');
    toast.className = `notion-toast ${type}`;
    
    // アイコン
    let iconSvg;
    if (type === 'success') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    } else {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    }
    
    const iconDiv = document.createElement('div');
    iconDiv.className = `notion-toast-icon ${type}`;
    iconDiv.innerHTML = iconSvg;
    
    // コンテンツ
    const content = document.createElement('div');
    content.className = 'notion-toast-content';
    
    // タイトル
    if (title) {
      const titleElement = document.createElement('div');
      titleElement.className = 'notion-toast-title';
      titleElement.textContent = title;
      content.appendChild(titleElement);
    }
    
    // メッセージ
    if (message) {
      const messageElement = document.createElement('div');
      messageElement.className = 'notion-toast-message';
      messageElement.textContent = message;
      content.appendChild(messageElement);
    }
    
    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.className = 'notion-toast-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      this.container.removeChild(toast);
    });
    
    // 要素の追加
    toast.appendChild(iconDiv);
    toast.appendChild(content);
    toast.appendChild(closeButton);
    
    // トーストをコンテナに追加
    this.container.appendChild(toast);
    
    // 自動削除のタイマーを設定
    setTimeout(() => {
      if (this.container.contains(toast)) {
        this.container.removeChild(toast);
      }
    }, duration);
    
    return toast;
  }
}

// スタイルを注入
injectStyles();

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

    // メモの取得 (存在する場合)
    const noteElement = container.querySelector('.kp-notebook-note span#note');
    const existingNote = noteElement ? noteElement.innerText.trim() : "";


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

      // ユーザーにコメント入力を促す（既存メモがあれば初期値として設定）
      // Cancel を押すと Notion に送信しない
      const userComment = prompt("コメントを入力してください (任意)\n「キャンセル」を押すと Notion に送信しません", existingNote);
      
      // キャンセルが押された場合は処理を中止
      if (userComment === null) {
        button.textContent = 'Notion にコピー';
        button.disabled = false;
        button.style.backgroundColor = "#4CAF50";
        return;
      }
      
      const comment = userComment || "";
      const createdAt = new Date().toISOString();
      const notionData = {
        // parent は background.js で設定
        properties: {
          [dbMapping.highlight]: { title: [{ text: { content: highlightText } }] },
          [dbMapping.createdAt]: { date: { start: createdAt } },
          [dbMapping.comment]: { rich_text: [{ text: { content: comment } }] },
          [dbMapping.bookTitle]: { select: { name: bookTitle } },
          [dbMapping.author]: { select: { name: author } }
        }
      };

      console.log("[content.js] Prepared notionData for DB:", notionData);

      // 送信中の状態表示
      button.textContent = '送信中...';
      button.disabled = true;
      button.style.backgroundColor = "#a0a0a0";

      chrome.runtime.sendMessage({ action: "postToNotion", notionData: notionData }, (response) => {
        if (response && response.success) {
          button.textContent = 'コピー済';
          button.disabled = true;
          button.style.backgroundColor = "#888";
          
          // 成功通知を表示
          const toast = new NotionToast();
          toast.show({
            title: 'Notionに保存しました',
            message: bookTitle ? `『${bookTitle}』からの引用をNotionに保存しました` : '引用をNotionに保存しました',
            type: 'success',
            duration: 3000
          });
        } else {
          console.error("[content.js] Error posting to Notion:", response);
          
          // エラー時はボタンを元に戻す
          button.textContent = 'Notion にコピー';
          button.disabled = false;
          button.style.backgroundColor = "#4CAF50";
          
          // エラー通知
          const toast = new NotionToast();
          toast.show({
            title: 'エラーが発生しました',
            message: response?.error || 'Notionへの書き込みに失敗しました',
            type: 'error',
            duration: 4000
          });
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
