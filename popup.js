// 保存されている設定を読み込む
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

// APIキーの表示/非表示を切り替え
document.getElementById('toggleApiKey').addEventListener('click', () => {
  const apiKeyInput = document.getElementById('notionApiKey');
  const eyeIcon = document.getElementById('toggleApiKey');
  
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    eyeIcon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    `;
  } else {
    apiKeyInput.type = 'password';
    eyeIcon.innerHTML = `
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

// 設定を保存する関数
function saveSettings() {
  const apiKey = document.getElementById('notionApiKey').value;
  const databaseId = document.getElementById('databaseId').value;
  
  // 入力情報を chrome.storage に保存
  chrome.storage.sync.set({ notionApiKey: apiKey, databaseId: databaseId }, () => {
    console.log("APIキーとDatabase IDが保存されました。");
    
    // 保存表示を更新
    if (apiKey) {
      document.getElementById('apiKeySaved').classList.add('show');
      setTimeout(() => {
        document.getElementById('apiKeySaved').classList.remove('show');
      }, 3000);
    }
    
    if (databaseId) {
      document.getElementById('dbIdSaved').classList.add('show');
      setTimeout(() => {
        document.getElementById('dbIdSaved').classList.remove('show');
      }, 3000);
    }
  });
}

// 接続テスト関数
function testConnection() {
  const apiKey = document.getElementById('notionApiKey').value;
  const databaseId = document.getElementById('databaseId').value;
  const resultElement = document.getElementById('result');
  
  // 入力チェック
  if (!apiKey || !databaseId) {
    showMessage('APIキーとDatabase IDの両方を入力してください。', 'error');
    return;
  }

  // メッセージをクリア
  resultElement.classList.remove('success', 'error');
  resultElement.textContent = '接続テスト中...';
  resultElement.classList.add('show');
  
  // 接続テスト：Database の情報を取得
  fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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
      const propertyKeys = Object.keys(properties);
      
      // データベースの項目を表示
      let columnDisplay = '<ul style="margin-top:5px;padding-left:20px">';
      propertyKeys.forEach((key) => {
        columnDisplay += `<li>${key}: ${properties[key].type}</li>`;
      });
      columnDisplay += '</ul>';
      
      showMessage(`
        <strong>接続成功!</strong> 
        <p>データベース「${data.title?.[0]?.plain_text || 'Untitled'}」に接続しました。</p>
        <p>データベース項目:</p>
        ${columnDisplay}
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

// メッセージ表示関数
function showMessage(message, type) {
  const resultElement = document.getElementById('result');
  resultElement.innerHTML = message;
  resultElement.className = `message ${type} show`;
}

// 入力フィールドのイベントリスナー（入力時に保存表示を消す）
document.getElementById('notionApiKey').addEventListener('input', () => {
  document.getElementById('apiKeySaved').classList.remove('show');
});

document.getElementById('databaseId').addEventListener('input', () => {
  document.getElementById('dbIdSaved').classList.remove('show');
});