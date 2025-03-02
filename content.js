// --- content.js ---

/**
 * トースト通知のスタイルをページに注入する
 */
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

/**
 * トースト通知を管理するクラス
 */
class NotionToast {
  constructor() {
    this.createContainer();
  }

  /**
   * トースト通知を表示するためのコンテナを作成する
   */
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

  /**
   * トースト通知を表示する
   * @param {Object} options - トースト通知のオプション
   * @param {string} options.title - トーストのタイトル
   * @param {string} options.message - トーストのメッセージ
   * @param {string} options.type - トーストの種類 ('success' | 'error')
   * @param {number} options.duration - 表示時間（ミリ秒）
   * @returns {HTMLElement} 作成されたトースト要素
   */
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

/**
 * タグ選択用のモーダルを作成する
 * @param {string[]} tags - 利用可能なタグのリスト
 * @param {Function} onConfirm - 確認時のコールバック関数
 * @returns {HTMLElement} モーダル要素
 */
function createTagModal(tags, onConfirm) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    max-width: 500px;
    width: 90%;
  `;

  const title = document.createElement('h3');
  title.textContent = 'タグを選択';
  title.style.marginTop = '0';

  // 新規タグ作成フォーム
  const newTagForm = document.createElement('div');
  newTagForm.style.cssText = `
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  `;

  const newTagInput = document.createElement('input');
  newTagInput.type = 'text';
  newTagInput.placeholder = '新しいタグを入力';
  newTagInput.style.cssText = `
    flex: 1;
    padding: 8px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 14px;
  `;

  const addTagButton = document.createElement('button');
  addTagButton.textContent = '追加';
  addTagButton.style.cssText = `
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #2383e2;
    color: white;
    cursor: pointer;
  `;

  const tagContainer = document.createElement('div');
  tagContainer.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 16px 0;
    max-height: 200px;
    overflow-y: auto;
    padding: 4px;
  `;

  const selectedTags = new Set();
  const allTags = new Set(tags);

  function createTagButton(tag) {
    const tagButton = document.createElement('button');
    tagButton.textContent = tag;
    tagButton.style.cssText = `
      padding: 4px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 16px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    `;

    if (selectedTags.has(tag)) {
      tagButton.style.background = '#2383e2';
      tagButton.style.color = 'white';
    }

    tagButton.addEventListener('click', () => {
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        tagButton.style.background = 'white';
        tagButton.style.color = 'black';
      } else {
        selectedTags.add(tag);
        tagButton.style.background = '#2383e2';
        tagButton.style.color = 'white';
      }
    });

    return tagButton;
  }

  function refreshTagButtons() {
    tagContainer.innerHTML = '';
    Array.from(allTags).sort().forEach(tag => {
      tagContainer.appendChild(createTagButton(tag));
    });
  }

  addTagButton.addEventListener('click', () => {
    const newTag = newTagInput.value.trim();
    if (newTag && !allTags.has(newTag)) {
      allTags.add(newTag);
      selectedTags.add(newTag);
      newTagInput.value = '';
      refreshTagButtons();

      // 新しいタグをストレージに保存
      chrome.storage.sync.get(['tagOptions'], (items) => {
        const tag_options = new Set(items.tagOptions || []);
        tag_options.add(newTag);
        chrome.storage.sync.set({ tagOptions: Array.from(tag_options) }, () => {
          console.log("新しいタグが保存されました:", newTag);
        });
      });
    }
  });

  // Enterキーでも新規タグを追加できるように
  newTagInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTagButton.click();
    }
  });

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  `;

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'キャンセル';
  cancelButton.style.cssText = `
    padding: 8px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  `;

  const confirmButton = document.createElement('button');
  confirmButton.textContent = '確認';
  confirmButton.style.cssText = `
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #2383e2;
    color: white;
    cursor: pointer;
  `;

  cancelButton.addEventListener('click', () => {
    modal.remove();
    onConfirm(null);
  });

  confirmButton.addEventListener('click', () => {
    modal.remove();
    onConfirm(Array.from(selectedTags));
  });

  newTagForm.appendChild(newTagInput);
  newTagForm.appendChild(addTagButton);

  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(confirmButton);

  modal.appendChild(title);
  modal.appendChild(newTagForm);
  modal.appendChild(tagContainer);
  modal.appendChild(buttonContainer);

  refreshTagButtons();

  return modal;
}

/**
 * Kindleのハイライトに対してNotionへのコピーボタンを追加する
 */
function addNotionButtons() {
  const highlight_containers = document.querySelectorAll('div.a-row.a-spacing-base');
  const book_title_element = document.querySelector(
    "div.a-column.a-span5 h3.a-spacing-top-small.a-color-base.kp-notebook-selectable.kp-notebook-metadata"
  );
  const book_title = book_title_element ? book_title_element.innerText.trim() : "";
  const author_element = document.querySelector(
    "div.a-column.a-span5 p.a-spacing-none.a-spacing-top-micro.a-size-base" + 
    ".a-color-secondary.kp-notebook-selectable.kp-notebook-metadata"
  );
  const author = author_element ? author_element.innerText.trim() : "";

  highlight_containers.forEach(container => {
    const highlight_element = container.querySelector('span#highlight');
    if (!highlight_element) {
      return;
    }

    if (container.querySelector('.notion-copy-button')) {
      return;
    }

    const highlight_text = highlight_element.innerText.trim();

    // メモの取得 (存在する場合)
    const note_element = container.querySelector('.kp-notebook-note span#note');
    const existing_note = note_element ? note_element.innerText.trim() : "";

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
      const db_mapping = {
        highlight: "Highlight",
        createdAt: "Created At",
        comment: "Comment",
        bookTitle: "Book Title",
        author: "Author",
        tags: "Tags"
      };

      // ユーザーにコメント入力を促す（既存メモがあれば初期値として設定）
      const user_comment = prompt(
        "コメントを入力してください (任意)\n「キャンセル」を押すと Notion に送信しません",
        existing_note
      );
      
      // キャンセルが押された場合は処理を中止
      if (user_comment === null) {
        return;
      }

      // 保存されているタグオプションを取得
      chrome.storage.sync.get(['tagOptions'], (items) => {
        const tag_options = items.tagOptions || [];
        
        // タグ選択モーダルを表示
        const modal = createTagModal(tag_options, (selected_tags) => {
          if (selected_tags === null) {
            // タグ選択がキャンセルされた場合
            return;
          }

          const comment = user_comment || "";
          const created_at = new Date().toISOString();
          const notion_data = {
            properties: {
              [db_mapping.highlight]: { title: [{ text: { content: highlight_text } }] },
              [db_mapping.createdAt]: { date: { start: created_at } },
              [db_mapping.comment]: { rich_text: [{ text: { content: comment } }] },
              [db_mapping.bookTitle]: { select: { name: book_title } },
              [db_mapping.author]: { select: { name: author } },
              [db_mapping.tags]: { multi_select: selected_tags.map(tag => ({ name: tag })) }
            }
          };

          console.log("[content.js] Prepared notionData for DB:", notion_data);

          // 送信中の状態表示
          button.textContent = '送信中...';
          button.disabled = true;
          button.style.backgroundColor = "#a0a0a0";

          chrome.runtime.sendMessage({ action: "postToNotion", notionData: notion_data }, (response) => {
            if (response && response.success) {
              button.textContent = 'コピー済';
              button.disabled = true;
              button.style.backgroundColor = "#888";
              
              // 成功通知を表示
              const toast = new NotionToast();
              toast.show({
                title: 'Notionに保存しました',
                message: book_title ? 
                  `『${book_title}』からの引用をNotionに保存しました` : 
                  '引用をNotionに保存しました',
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

        document.body.appendChild(modal);
      });
    });

    // highlightの存在するコンテナに追加するように変更。
    const highlight_container = highlight_element.closest('.a-row.a-spacing-base');
    if (highlight_container) {
      highlight_container.appendChild(button);
    }
  });
}

addNotionButtons();
const observer = new MutationObserver(addNotionButtons);
const config = { childList: true, subtree: true };
observer.observe(document.body, config);
