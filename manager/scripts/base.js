// oxlint-disable no-unused-vars

// 全局基础功能函数
// 跳转到新窗口
function toNewWindow(url) {
    window.open(url, '_blank');
}

// 跳转到原窗口
function toOriWindow(url) {
    window.location.href = url;
}

// 页面跳转函数
function navigateTo(page) {
    window.location.href = page;
}

// 获取当前时间并格式化
function getCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 生成随机ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 深拷贝对象
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const clonedObj = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

// 验证邮箱格式
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 验证手机号格式
function validatePhone(phone) {
    const re = /^1[3-9]\d{9}$/;
    return re.test(phone);
}

// 设置本地存储
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('设置本地存储失败:', e);
        return false;
    }
}

// 获取本地存储
function getLocalStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
        console.error('获取本地存储失败:', e);
        return defaultValue;
    }
}

// 删除本地存储
function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('删除本地存储失败:', e);
        return false;
    }
}

// 通用导航函数（带淡入淡出效果）
function navigateWithFade(href, themeAction) {
    document.body.classList.add('page-fade-out');
    const durationMs = getTransitionDurationMs();

    const safeTimeout = durationMs + 120;

    let finished = false;
    const done = () => {
        if (finished) return;
        finished = true;

        if (themeAction === 'save' && typeof window.saveCurrentTheme === 'function') {
            try { window.saveCurrentTheme(); } catch {}
        } else if (themeAction === 'restore' && typeof window.restoreOriginalTheme === 'function') {
            try { window.restoreOriginalTheme(); } catch {}
        }
        window.location.href = href;
    };

    const onTransitionEnd = (e) => {
        if (e.target !== document.body) return;
        done();
    };

    document.body.addEventListener('transitionend', onTransitionEnd, { once: true });

    setTimeout(() => {
        done();
    }, safeTimeout);
}

// 获取过渡动画时长
function getTransitionDurationMs() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--transition-duration').trim() || '350ms';
    
    if (raw.endsWith('ms')) {
        return parseFloat(raw);
    } else if (raw.endsWith('s')) {
        return parseFloat(raw) * 1000;
    } else if (/^\d+$/.test(raw)) {
        return parseFloat(raw);
    }
    return 350;
}

// 应用动画设置
function applyAnimationSettings() {
    const raw = localStorage.getItem('animationSpeed');
    let val = raw;
    if (!val) {
        return;
    }
    if (/^\d+$/.test(val)) {
        val = val + 'ms';
    }
    document.documentElement.style.setProperty('--transition-duration', val);
}

// 设置动画速度
window.setAnimationSpeed = function(value) {
    if (typeof value === 'number') {
        value = value + 'ms';
    }
    localStorage.setItem('animationSpeed', String(value));
    applyAnimationSettings();
};

// 保存当前主题
window.saveCurrentTheme = function() {
    if (typeof window._saveTheme === 'function') {
        try { return window._saveTheme(); } catch {}
    }
    try {
        const cls = document.documentElement.className || '';
        localStorage.setItem('savedThemeClass', cls);
    } catch {}
};

// 恢复原始主题
window.restoreOriginalTheme = function() {
    if (typeof window._restoreTheme === 'function') {
        try { return window._restoreTheme(); } catch {}
    }
    try {
        const cls = localStorage.getItem('savedThemeClass');
        if (cls !== null) {
            document.documentElement.className = cls;
        }
    } catch {}
};

// 导航栏功能
function setupNavigation() {
    const nav = document.querySelector('.nav');
    const toggleBtn = document.getElementById('toggleNav');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    function updateNavState(expanded) {
        nav.classList.toggle('expanded', expanded);
        document.body.classList.toggle('nav-expanded', expanded);
        toggleBtn.textContent = expanded ? '折叠' : '展开';
        localStorage.setItem('navExpanded', expanded);
    }
    
    // 检查本地存储的导航栏状态
    const savedState = localStorage.getItem('navExpanded') === 'true';
    updateNavState(savedState);
    
    // 切换导航栏展开/折叠状态
    toggleBtn.addEventListener('click', function() {
        const isExpanded = nav.classList.contains('expanded');
        updateNavState(!isExpanded);
    });
    
    // 导航按钮点击事件
    navButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            // 只有在导航栏展开时才收起它
            if (nav.classList.contains('expanded')) {
                updateNavState(false);
            }

            const href = this.getAttribute('data-href');
            const themeAction = this.getAttribute('data-theme-action');
            if (href) {
                event.preventDefault();
                navigateWithFade(href, themeAction);
            }
        });
    });
    
    // 点击导航栏外区域收起导航栏
    document.addEventListener('click', function(e) {
        if (nav && nav.classList.contains('expanded') && 
            !nav.contains(e.target)) {
            updateNavState(false);
        }
    });
}

// 全局通知系统
// 存储通知实例和超时ID
const notifications = new Map();
let notificationCounter = 0;
let notificationContainer = null;

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
    
    const notificationElements = notificationContainer.querySelectorAll('.notification');
    // 由于通知是绝对定位的，我们不需要手动重新排列
    // 容器的默认行为会自动处理新通知的位置
}

// 清空所有通知
function clearAllNotifications() {
    notifications.forEach((notificationObj, id) => {
        closeNotification(id);
    });
}

// 不同类型的通知函数
function showInfoNotification(title, message, duration = 3000) {
    return createNotification('info', title, message, duration);
}

function showSuccessNotification(title, message, duration = 3000) {
    return createNotification('success', title, message, duration);
}

function showWarningNotification(title, message, duration = 3000) {
    return createNotification('warning', title, message, duration);
}

function showErrorNotification(title, message, duration = 3000) {
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

// 为所有select元素添加change事件监听器，选择后自动失去焦点
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initSelectBlurHandler();
    });
} else {
    initSelectBlurHandler();
}

// 初始化标签下划线
function initUnderline() {
    const labels = document.getElementById('labels');
    const activeBtn = document.querySelector('.labelsButton.active');
    const underline = document.createElement('span');
    underline.className = 'underline';
    labels.appendChild(underline);
    updateUnderlinePosition(activeBtn);
}

// 初始化下拉菜单失去焦点处理器
function initSelectBlurHandler() {
    // 为所有select元素添加change事件监听器
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            // 在下一个事件循环中失去焦点，确保选项选择完成
            setTimeout(() => {
                this.blur();
            }, 0);
        });
    });
}

// 更新标签下划线位置
function updateUnderlinePosition(button) {
    const underline = document.querySelector('.labels .underline');
    const rect = button.getBoundingClientRect();
    const labelsRect = document.getElementById('labels').getBoundingClientRect();
    underline.style.width = `${rect.width}px`;
    underline.style.left = `${rect.left - labelsRect.left}px`;
}

// 切换面板显示
function switchPanel(category) {
    const target = document.getElementById(`${category}-panel`);
    if (!target) return;

    const panels = Array.from(document.querySelectorAll('.content-panel'));
    const current = panels.find(p => window.getComputedStyle(p).display !== 'none');

    if (current === target) return;

    const duration = getTransitionDurationMs();
    const safeTimeout = duration + 100;

    const hideCurrent = () => {
        return new Promise(resolve => {
            if (!current) return resolve();

            current.classList.remove('fade-in', 'fade-in-active');
            current.classList.add('fade-out');

            const done = () => {
                current.classList.remove('fade-out');
                current.style.display = 'none';
                current.removeEventListener('transitionend', onEnd);
                resolve();
            };

            const onEnd = (e) => {
                if (e.target !== current) return;
                done();
            };

            current.addEventListener('transitionend', onEnd, { once: true });

            // 回退
            setTimeout(() => {
                if (window.getComputedStyle(current).display !== 'none') {
                    done();
                }
            }, safeTimeout);
        });
    };

    const showTarget = () => {
        return new Promise(resolve => {
            target.classList.remove('fade-out', 'fade-in-active');
            target.classList.add('fade-in');
            target.style.display = 'block';

            // 强制重绘
            // eslint-disable-next-line no-unused-expressions
            target.offsetHeight;

            target.classList.add('fade-in-active');

            const done = () => {
                target.classList.remove('fade-in', 'fade-in-active');
                target.removeEventListener('transitionend', onEnd);
                resolve();
            };

            const onEnd = (e) => {
                if (e.target !== target) return;
                done();
            };

            target.addEventListener('transitionend', onEnd, { once: true });

            // 回退
            setTimeout(() => {
                if (target.classList.contains('fade-in') || target.classList.contains('fade-in-active')) {
                    done();
                }
            }, safeTimeout);
        });
    };

    hideCurrent().then(() => showTarget());
}

// 应用通知设置
function applyNotificationSettings() {
    try {
        const raw = localStorage.getItem('animationSpeed');
        let val = raw;
        if (!val) {
            return;
        }
        if (/^\d+$/.test(val)) {
            val = val + 'ms';
        }
        document.documentElement.style.setProperty('--transition-duration', val);
    } catch {
        console.warn('Failed to apply notification settings.');
    }
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
    let soundStyle = localStorage.getItem('notificationSoundStyle') || 'default';

    function applyNotificationSettings() {
        try {
            const en = localStorage.getItem('notificationsEnabled');
            enabled = (en === null) ? true : (en === 'true');
            const v = localStorage.getItem('notificationVolume');
            volume = (v === null) ? 0.8 : Math.min(1, Math.max(0, parseFloat(v)));
            soundStyle = localStorage.getItem('notificationSoundStyle') || soundStyle;
        } catch {
            enabled = true; volume = 0.8; soundStyle = soundStyle || 'default';
        }
        ['low','medium','high'].forEach(level => {
            const path = `../res/sounds/${soundStyle}/${fileNames[level]}`;
            const a = new Audio(path);
            a.preload = 'auto';
            a.volume = volume;
        });
    }

    function playSoundForLevel(level) {
        // 检查通知是否启用
        const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
        if (!notificationsEnabled) return;
        
        // 检查音效是否启用
        if (!enabled) return;
        
        let priority = 'low';
        if (level === 'info') priority = 'low';
        else if (level === 'success' || level === 'warning') priority = 'medium';
        else if (level === 'error') priority = 'high';

        // 使用全局设置的音效风格
        let currentStyle = localStorage.getItem('notificationSoundStyle') || 'default';

        const src = `../res/sounds/${currentStyle}/${fileNames[priority]}`;
        try {
            const a = new Audio(src);
            a.volume = volume;
            a.play().catch(()=>{/* ignore autoplay policy errors */});
        } catch  {
            console.warn('Failed to play notification sound:', src);
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
        // 预加载新风格的样本
        ['low','medium','high'].forEach(level => {
            const p = `../res/sounds/${soundStyle}/${fileNames[level]}`;
            const a = new Audio(p); a.preload = 'auto'; a.volume = volume;
        });
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化下划线
    initUnderline();
    
    // 应用动画设置
    applyAnimationSettings();

    // 应用通知设置
    applyNotificationSettings();
    
    // 处理页面淡入效果
    if (document.body.classList.contains('page-fade-in')) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.remove('page-fade-in');
            });
        });
    }
    
    // 为标签按钮添加点击事件监听器
    document.querySelectorAll('.labelsButton').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.labelsButton').forEach(btn => {
                btn.classList.remove('active');
            });
            
            this.classList.add('active');
            
            updateUnderlinePosition(this);
            
            const category = this.getAttribute('data-category');
            switchPanel(category);
        });
    });
    
    // 设置导航栏
    setupNavigation();
});