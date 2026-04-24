// 可选：用于高级 Service Worker 管理
// 虽然 vite-plugin-pwa 会自动注册，但您可以使用此文件进行自定义处理

export function registerServiceWorkerWithNotification() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker 注册成功:', registration);

        // 监听 Service Worker 更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新的 Service Worker 已安装
                console.log('新版本已就绪');
                // 可以显示更新通知
                showUpdateNotification();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service Worker 注册失败:', error);
      });
  }
}

function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 16px 24px;
    border-radius: 4px;
    z-index: 1000;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  notification.textContent = '应用已更新，请刷新页面以获取最新版本';
  
  const button = document.createElement('button');
  button.style.cssText = `
    background: white;
    color: #4CAF50;
    border: none;
    padding: 8px 16px;
    margin-left: 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  `;
  button.textContent = '刷新';
  button.onclick = () => window.location.reload();
  
  notification.appendChild(button);
  document.body.appendChild(notification);
}

// 检查更新
export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.update();
      });
  }
}

// 定期检查更新（每5分钟）
export function startPeriodicUpdateCheck() {
  setInterval(() => {
    checkForUpdates();
  }, 5 * 60 * 1000);
}
