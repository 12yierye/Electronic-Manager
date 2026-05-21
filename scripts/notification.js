// 全局通知系统
// 存储通知实例和超时ID
// 防止重复声明变量
if (typeof notifications === 'undefined') {
    var notifications = new Map();
}
if (typeof notificationCounter === 'undefined') {
    var notificationCounter = 0;
}
if (typeof notificationContainer === 'undefined') {
    var notificationContainer = null;
}

// 初始化通知容器
function initNotificationContainer() {
    if (!notificationContainer) {
        notificationContainer = document.getElementById('notificationContainer');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notificationContainer';
            notificationContainer.className = 'notification-container';
            
            // 确保容器添加到body中
            if (document.body) {
                document.body.appendChild(notificationContainer);
            } else {
                // 如果body还不存在，等待DOM加载完成
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(notificationContainer);
                });
            }
        }
    }
}

// 创建通知函数
function createNotification(type, title, message, duration = 3000) {
    // 检查通知是否启用
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    if (!notificationsEnabled) {
        return; // 如果通知被禁用，直接返回不显示通知
    }
    
    // 确保通知容器已初始化
    initNotificationContainer();
    
    const id = ++notificationCounter;
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-header">
            <h4 class="notification-title">${title}</h4>
            <button class="notification-close" onclick="closeNotification(${id})">&times;</button>
        </div>
        <div class="notification-body">
            <p>${message}</p>
        </div>
    `;
    
    // 确保容器存在
    if (!notificationContainer) {
        initNotificationContainer();
    }
    
    // 将通知添加到容器开头，确保新的通知在顶部
    notificationContainer.insertBefore(notification, notificationContainer.firstChild);
    
    // 触发重排动画
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // 播放通知音效
    try {
        if (typeof window.playSoundForLevel === 'function') {
            window.playSoundForLevel(type);
        } else if (typeof window.showNotification === 'function' && !window._notificationSoundPlaying) {
            // 防止循环调用的标记
            window._notificationSoundPlaying = true;
            window.showNotification(message, type, duration);
            // 在下一个事件循环重置标记
            setTimeout(() => {
                window._notificationSoundPlaying = false;
            }, 0);
        }
    } catch (e) {
        console.warn('播放通知音效失败:', e);
        // 确保在出错时重置标记
        window._notificationSoundPlaying = false;
    }
    
    // 设置自动关闭
    const timeoutId = setTimeout(() => {
        closeNotification(id);
    }, duration);
    
    // 存储通知实例
    notifications.set(id, {
        element: notification,
        timeoutId: timeoutId
    });
    
    return id;
}

// 关闭通知函数
function closeNotification(id) {
    const notificationObj = notifications.get(id);
    if (notificationObj) {
        const { element, timeoutId } = notificationObj;
        
        // 清除定时器
        clearTimeout(timeoutId);
        
        // 添加关闭动画
        element.classList.remove('show');
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
                
                // 重新排列剩余的通知
                rearrangeNotifications();
            }
            notifications.delete(id);
        }, 300);
    }
}

// 重新排列通知函数
function rearrangeNotifications() {
    if (!notificationContainer) return;
    
    // 通知已经通过CSS的flex布局自动排列，不需要手动重新排列
    // 这里留空以保持API的一致性
}

// 清空所有通知
function clearAllNotifications() {
    notifications.forEach((notificationObj, id) => {
        closeNotification(id);
    });
}

// 不同类型的通知函数
function showInfoNotification(title, message, duration = 3000) {
    // 检查通知是否启用
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    if (!notificationsEnabled) {
        return; // 如果通知被禁用，直接返回不显示通知
    }
    return createNotification('info', title, message, duration);
}

function showSuccessNotification(title, message, duration = 3000) {
    // 检查通知是否启用
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    if (!notificationsEnabled) {
        return; // 如果通知被禁用，直接返回不显示通知
    }
    return createNotification('success', title, message, duration);
}

function showWarningNotification(title, message, duration = 3000) {
    // 检查通知是否启用
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    if (!notificationsEnabled) {
        return; // 如果通知被禁用，直接返回不显示通知
    }
    return createNotification('warning', title, message, duration);
}

function showErrorNotification(title, message, duration = 3000) {
    // 检查通知是否启用
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    if (!notificationsEnabled) {
        return; // 如果通知被禁用，直接返回不显示通知
    }
    return createNotification('error', title, message, duration);
}

// 向后兼容的函数
function showInfoTimed(message, duration = 3000) {
    return showInfoNotification('信息', message, duration);
}

function showErrorTimed(message, duration = 3000) {
    return showErrorNotification('错误', message, duration);
}

function showWarningTimed(message, duration = 3000) {
    return showWarningNotification('警告', message, duration);
}

function showNotificationTimed(type, message, duration = 3000) {
    switch(type) {
        case 'error':
            return showErrorTimed(message, duration);
        case 'warning':
            return showWarningTimed(message, duration);
        case 'success':
            return showSuccessNotification('成功', message, duration);
        case 'info':
        default:
            return showInfoTimed(message, duration);
    }
}

function showError(message, id) {
    return showErrorTimed(message, 3000);
}

function showWarning(message, id) {
    return showWarningTimed(message, 3000);
}

function showInfo(message, id) {
    return showInfoTimed(message, 3000);
}

function hideError(id) {
    closeNotification(id);
}

function hideWarning(id) {
    closeNotification(id);
}

function hideInfo(id) {
    closeNotification(id);
}

// 页面加载时初始化通知容器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initNotificationContainer();
    });
} else {
    // DOM已经加载完成
    initNotificationContainer();
}

// 通知音效相关功能
(function(){
    const fileNames = {
        low: 'low_priority.wav',
        medium: 'medium_priority.wav',
        high: 'high_priority.wav'
    };

    let enabled = true;
    let volume = 0.8;
    let soundStyle = 'default';

    function applyNotificationSettings() {
        try {
            const en = localStorage.getItem('notificationsEnabled');
            enabled = (en === null) ? true : (en === 'true');
            const v = localStorage.getItem('notificationVolume');
            volume = (v === null) ? 0.8 : Math.min(1, Math.max(0, parseFloat(v)));
            // 使用全局设置的音效风格
            if (typeof window.getSoundStyle === 'function') {
                soundStyle = window.getSoundStyle();
            } else {
                soundStyle = localStorage.getItem('notificationSoundStyle') || 'default';
            }
        } catch {
            enabled = true; volume = 0.8; 
            if (typeof window.getSoundStyle === 'function') {
                soundStyle = window.getSoundStyle();
            } else {
                soundStyle = 'default';
            }
        }
    }

    function playSoundForLevel(level) {
        // 检查通知是否启用
        const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
        if (!notificationsEnabled) return;
        
        let priority = 'low';
        if (level === 'info') priority = 'low';
        else if (level === 'success' || level === 'warning') priority = 'medium';
        else if (level === 'error') priority = 'high';

        // 使用全局设置的音效风格
        let currentStyle = localStorage.getItem('notificationSoundStyle') || 'default';

        // 正确的相对路径应该是 ../res/sounds/...
        const src = `../res/sounds/${currentStyle}/${fileNames[priority]}`;
            
        try {
            const a = new Audio(src);
            a.volume = volume;
            a.play().catch(()=>{/* ignore autoplay policy errors */});
        } catch (e) {
            // 忽略文件不存在的错误
            if (e.name !== 'NotFoundError') {
                console.warn('Failed to play notification sound:', src, e);
            }
        }
    }

    // 对外接口：设置/获取通知开关、音量、风格
    window.setNotificationsEnabled = function(on) {
        enabled = !!on;
        try { localStorage.setItem('notificationsEnabled', enabled ? 'true' : 'false'); } catch{}
    };
    window.setNotificationVolume = function(v) {
        volume = Math.min(1, Math.max(0, Number(v)));
        try { localStorage.setItem('notificationVolume', String(volume)); } catch{}
    };
    window.setSoundStyle = function(style) {
        if (!style) return;
        soundStyle = style;
        try { localStorage.setItem('notificationSoundStyle', style); } catch{}
    };
    window.getSoundStyle = function() { return soundStyle; };

    // 确保playSoundForLevel函数在全局作用域可用
    window.playSoundForLevel = playSoundForLevel;

    // 保留可能存在的原 showNotification（先保存引用）
    const prevShow = (typeof window.showNotification === 'function') ? window.showNotification : null;

    // 覆盖全局 showNotification：调用原显示逻辑（若存在），再播放音效
    window.showNotification = function(message, type = 'info', timeout = 4000) {
        // 检查通知是否启用
        const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
        if (!notificationsEnabled) {
            return; // 如果通知被禁用，直接返回不显示通知
        }
        
        try {
            if (prevShow) prevShow(message, type, timeout);
            else {
                const map = { error:'error', warning:'warning', info:'info', success:'info' };
                const id = map[type] || 'info';
                const el = document.getElementById(id) || document.querySelector('.' + id);
                if (el) {
                    const content = el.querySelector('.' + id + '-content') || el;
                    if (content) content.textContent = message;
                    el.classList.add('show');
                    setTimeout(()=>el.classList.remove('show'), timeout);
                }
            }
        } catch{
            console.warn('Failed to show notification.');
        }
        
        // 播放声音
        try { 
            playSoundForLevel(type); 
        } catch{
            console.warn('Failed to play notification sound.');
        }
    };

    window.applyNotificationSettings = applyNotificationSettings;
    applyNotificationSettings();
})();

// 回退通知显示函数
function _fallbackShowNotification(message, type = 'info', timeout = 5000) {
    // 检查通知是否启用
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    if (!notificationsEnabled) {
        return; // 如果通知被禁用，直接返回不显示通知
    }
    
    // type: 'info' | 'warning' | 'error' | 'success'
    const idMap = { error: 'error', warning: 'warning', info: 'info', success: 'info' };
    const elId = idMap[type] || 'info';
    const el = document.getElementById(elId);
    if (!el) return;

    const content = el.querySelector('.' + elId + '-content') || el.querySelector('.info-content') || el.querySelector('.error-content') || el.querySelector('.warning-content');
    if (content) content.textContent = message;

    el.classList.add('show');

    // 自动隐藏
    setTimeout(() => {
        el.classList.remove('show');
    }, timeout);
}

// 隐藏错误通知
window.hideError = function() {
    const e = document.getElementById('error');
    if (e) e.classList.remove('show');
};

// 隐藏警告通知
window.hideWarning = function() {
    const e = document.getElementById('warning');
    if (e) e.classList.remove('show');
};

// 隐藏信息通知
window.hideInfo = function() {
    const e = document.getElementById('info');
    if (e) e.classList.remove('show');
};

// 处理通知关闭按钮点击事件
document.addEventListener('click', function (e) {
    const target = e.target;
    if (!target) return;

    const isClose =
        target.classList && (
            target.classList.contains('error-close') ||
            target.classList.contains('warning-close') ||
            target.classList.contains('info-close') ||
            target.classList.contains('notification-close')
        );

    if (!isClose) return;

    const container = target.closest('#error, #warning, #info, .notification, .error, .warning, .info');
    if (container) {
        container.classList.remove('show');
        try {
            container.style.opacity = '';
            container.style.transform = '';
            if (container.style.display === 'block' && !container.classList.contains('show')) {
                container.style.display = '';
            }
        } catch {
            console.warn('Failed to clean up notification styles.');
        }
    }
});

// 确保基本的隐藏通知函数存在
if (typeof window.hideError !== 'function') {
    window.hideError = function () {
        const el = document.getElementById('error') || document.querySelector('.error');
        if (el) el.classList.remove('show');
    };
}
if (typeof window.hideWarning !== 'function') {
    window.hideWarning = function () {
        const el = document.getElementById('warning') || document.querySelector('.warning');
        if (el) el.classList.remove('show');
    };
}
if (typeof window.hideInfo !== 'function') {
    window.hideInfo = function () {
        const el = document.getElementById('info') || document.querySelector('.info');
        if (el) el.classList.remove('show');
    };
}