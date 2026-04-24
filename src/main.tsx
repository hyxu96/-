import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// PWA Service Worker 注册和数据持久化
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker 注册成功:', registration.scope);

        // 监听Service Worker更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('📦 新版本已就绪，数据已安全备份');

                // 通知用户有更新可用
                const updateNotification = document.createElement('div');
                updateNotification.style.cssText = `
                  position: fixed;
                  bottom: 20px;
                  right: 20px;
                  background: #4CAF50;
                  color: white;
                  padding: 16px;
                  border-radius: 8px;
                  z-index: 9999;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  max-width: 300px;
                `;
                updateNotification.innerHTML = `
                  <div style="margin-bottom: 12px;">🐾 应用已更新，您的宠物数据已安全保存！</div>
                  <button style="background: white; color: #4CAF50; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;" onclick="window.location.reload()">刷新应用</button>
                `;
                document.body.appendChild(updateNotification);

                // 5秒后自动移除通知
                setTimeout(() => {
                  if (updateNotification.parentNode) {
                    updateNotification.parentNode.removeChild(updateNotification);
                  }
                }, 8000);
              }
            });
          }
        });

        // 定期检查更新（每小时）
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

      })
      .catch((error) => {
        console.error('❌ Service Worker 注册失败:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
