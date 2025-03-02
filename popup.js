// --- popup.js ---

/**
 * 保存されている設定を読み込む
 */
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['notionApiKey', 'databaseId'], (items) => {
    if (items.notionApiKey) {
      document.getElementById('notionApiKey').value = items.notionApiKey;
      document.getElementById('apiKeySaved').classList.add('show');
    }
    
    if (items.databaseId) {
      document.getElementById('databaseId').value = items.databaseId;
      document.getElementById('dbIdSaved').classList.add('show');
    }
  });
});

/**
 * APIキーの表示/非表示を切り替える
 */
document.getElementById('toggleApiKey').addEventListener('click', () => {
  const api_key_input = document.getElementById('notionApiKey');
  const eye_icon = document.getElementById('toggleApiKey');
  
  if (api_key_input.type === 'password') {
    api_key_input.type = 'text';
    eye_icon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    `;
  } else {
    api_key_input.type = 'password';
    eye_icon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    `;
  }
});

// 保存ボタンのイベントリスナー
document.getElementById('saveButton').addEventListener('click', () => {
  saveSettings();
});

// 接続テストボタンのイベントリスナー
document.getElementById('testConnection').addEventListener('click', () => {
  saveSettings();
  testConnection();
});

/**
 * 設定を保存する
 */
function saveSettings() {
  const api_key = document.getElementById('notionApiKey').value;
  const database_id = document.getElementById('databaseId').value;
  
  // 入力情報を chrome.storage に保存
  chrome.storage.sync.set({ notionApiKey: api_key, databaseId: database_id }, () => {
    console.log("APIキーとDatabase IDが保存されました。");
    
    // 保存表示を更新
    if (api_key) {
      document.getElementById('apiKeySaved').classList.add('show');
      setTimeout(() => {
        document.getElementById('apiKeySaved').classList.remove('show');
      }, 3000);
    }
    
    if (database_id) {
      document.getElementById('dbIdSaved').classList.add('show');
      setTimeout(() => {
        document.getElementById('dbIdSaved').classList.remove('show');
      }, 3000);
    }
  });
}

/**
 * メッセージを表示する
 * @param {string} message - 表示するメッセージ
 * @param {string} type - メッセージの種類 ('success' | 'error')
 */
function showMessage(message, type) {
  const result_element = document.getElementById('result');
  result_element.innerHTML = message;
  result_element.className = `message ${type} show`;
}

/**
 * Notion APIとの接続をテストする
 */
function testConnection() {
  const api_key = document.getElementById('notionApiKey').value;
  const database_id = document.getElementById('databaseId').value;
  const result_element = document.getElementById('result');
  
  // 入力チェック
  if (!api_key || !database_id) {
    showMessage('APIキーとDatabase IDの両方を入力してください。', 'error');
    return;
  }

  // メッセージをクリア
  result_element.classList.remove('success', 'error');
  result_element.textContent = '接続テスト中...';
  result_element.classList.add('show');
  
  // 接続テスト：Database の情報を取得
  fetch(`https://api.notion.com/v1/databases/${database_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${api_key}`,
      'Notion-Version': '2022-06-28'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`エラー: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Database info:', data);
    if (data.object === 'database') {
      // データベース接続成功
      const properties = data.properties;
      const property_keys = Object.keys(properties);
      
      // タグ情報の取得と保存
      if (properties.Tags && properties.Tags.type === 'multi_select') {
        const tag_options = properties.Tags.multi_select.options.map(option => option.name);
        chrome.storage.sync.set({ tagOptions: tag_options }, () => {
          console.log("タグオプションが保存されました:", tag_options);
        });
      }
      
      // データベースの項目を表示
      let column_display = '<ul style="margin-top:5px;padding-left:20px">';
      property_keys.forEach((key) => {
        column_display += `<li>${key}: ${properties[key].type}</li>`;
      });
      column_display += '</ul>';
      
      showMessage(`
        <strong>接続成功!</strong> 
        <p>データベース「${data.title?.[0]?.plain_text || 'Untitled'}」に接続しました。</p>
        <p>データベース項目:</p>
        ${column_display}
      `, 'success');
    } else {
      showMessage('接続失敗: Database 情報を取得できませんでした。', 'error');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showMessage(`接続エラー: ${error.message}`, 'error');
  });
}

// 入力フィールドのイベントリスナー（入力時に保存表示を消す）
document.getElementById('notionApiKey').addEventListener('input', () => {
  document.getElementById('apiKeySaved').classList.remove('show');
});

document.getElementById('databaseId').addEventListener('input', () => {
  document.getElementById('dbIdSaved').classList.remove('show');
});