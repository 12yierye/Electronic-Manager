// oxlint-disable no-unused-vars
// 全局设置应用逻辑

// 全局音频元素
let notificationSoundPlayers = {};
let currentNotificationSound = 'default';

// 确保 window.setSoundStyle 函数存在
window.setSoundStyle = function(style) {
    if (!style) return;
    currentNotificationSound = style;
    try { localStorage.setItem('notificationSoundStyle', style); } catch{}
    // 重新初始化音频系统
    initAudio();
};

// 导出originalTheme变量，以便在设置页面中访问
var originalTheme = null;

// 初始化音频系统
function initAudio() {
    try {
        // 清除旧的音频元素
        notificationSoundPlayers = {};
        
        currentNotificationSound = localStorage.getItem('notificationSoundStyle') || 'default';
        
        const priorities = ['high_priority', 'medium_priority', 'low_priority'];
        
        priorities.forEach(priority => {
            notificationSoundPlayers[priority] = new Audio();
            
            let soundPath = '';
            switch(currentNotificationSound) {
                case 'soft':
                    soundPath = `../res/sounds/soft/${priority}.wav`;
                    break;
                case 'electronic':
                    soundPath = `../res/sounds/electronic/${priority}.wav`;
                    break;
                case 'natural':
                    soundPath = `../res/sounds/natural/${priority}.wav`;
                    break;
                case 'none':
                    soundPath = ''; // 无声音
                    break;
                case 'default':
                default:
                    soundPath = `../res/sounds/default/${priority}.wav`;
                    break;
            }
            
            if (soundPath) {
                notificationSoundPlayers[priority].src = soundPath;
                notificationSoundPlayers[priority].onerror = function() {
                    // 忽略文件未找到错误
                    if (this.error && this.error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
                        console.warn('Audio file not found:', soundPath);
                    }
                };
                notificationSoundPlayers[priority].load();
            }
        });
    } catch (e) {
        console.error('初始化音频系统失败:', e);
    }
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'theme-light';
    originalTheme = savedTheme;
    applyTheme(savedTheme);
    
    // 同时更新设置页面的主题下拉菜单显示状态
    if (document.getElementById('theme-select-display')) {
        const themeDisplay = document.getElementById('theme-select-display');
        const themeOptions = document.getElementById('theme-select-options');
        
        // 清除所有选项的选中状态
        if (themeOptions) {
            themeOptions.querySelectorAll('li').forEach(li => {
                li.classList.remove('selected');
            });
        }
        
        // 根据当前主题设置显示文本和选中状态
        if (savedTheme === 'theme-light') {
            if (themeDisplay) themeDisplay.textContent = 'Light';
            if (themeOptions) {
                const lightOption = themeOptions.querySelector('li[data-value="1"]');
                if (lightOption) lightOption.classList.add('selected');
            }
        } else if (savedTheme === 'theme-dark') {
            if (themeDisplay) themeDisplay.textContent = 'Dark';
            if (themeOptions) {
                const darkOption = themeOptions.querySelector('li[data-value="2"]');
                if (darkOption) darkOption.classList.add('selected');
            }
        } else {
            if (themeDisplay) themeDisplay.textContent = 'Follow System Settings';
            if (themeOptions) {
                const systemOption = themeOptions.querySelector('li[data-value="3"]');
                if (systemOption) systemOption.classList.add('selected');
            }
        }
    }
}

// 应用主题
function applyTheme(themeClass) {
    const html = document.documentElement;
    
    // 移除所有主题类
    html.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
    
    // 添加新主题类
    html.classList.add(themeClass);
    
    // 保存到localStorage
    localStorage.setItem('theme', themeClass);
}

// 保存当前主题状态
function saveCurrentTheme() {
    const html = document.documentElement;
    const currentTheme = Array.from(html.classList).find(cls => 
        cls.startsWith('theme-'));
    if (currentTheme) {
        localStorage.setItem('theme', currentTheme);
    }
}

// 恢复原始主题
function restoreOriginalTheme() {
    if (originalTheme) {
        applyTheme(originalTheme);
    }
}

// 初始化字体大小
function initFontSize() {
    const savedFontSize = localStorage.getItem('fontSize') || '16';
    document.documentElement.style.setProperty('--font-size', `${savedFontSize}px`);
    
    const display = document.getElementById('font-size-display');
    const options = document.getElementById('font-size-options');
    
    if (display) display.textContent = `${savedFontSize}px`;
    if (options) {
        options.querySelectorAll('li').forEach(li => {
            li.classList.toggle('selected', li.dataset.value === savedFontSize);
        });
    }
}

// 初始化UI样式
function initUIStyle() {
    const savedUIStyle = localStorage.getItem('uiStyle') || 'modern';
    
    const html = document.documentElement;
    html.classList.remove('ui-modern', 'ui-classic');
    html.classList.add(`ui-${savedUIStyle}`);
    
    const display = document.getElementById('ui-style-display');
    const options = document.getElementById('ui-style-options');
    
    if (display) display.textContent = 
        savedUIStyle === 'modern' ? '现代' :
        savedUIStyle === 'classic' ? '经典' : '现代';
    
    if (options) {
        options.querySelectorAll('li').forEach(li => {
            li.classList.toggle('selected', li.dataset.value === savedUIStyle);
        });
    }
}

// 初始化高对比度
function initHighContrast() {
    const highContrast = localStorage.getItem('highContrast') === 'true';
    
    const checkbox = document.getElementById('high-contrast');
    
    if (checkbox) checkbox.checked = highContrast;
    updateHighContrast(highContrast);
    
    if (checkbox) {
        checkbox.addEventListener('change', function() {
            updateHighContrast(this.checked);
            localStorage.setItem('highContrast', this.checked);
        });
    }
}

function updateHighContrast(enable) {
    const html = document.documentElement;
    if (enable) {
        html.classList.add('theme-high-contrast');
    } else {
        html.classList.remove('theme-high-contrast');
        // 恢复之前的主题
        initTheme();
    }
}

function initNotifications() {
    const enableNotifications = localStorage.getItem('enableNotifications') !== 'false';
    const notificationSound = localStorage.getItem('notificationSoundStyle') || 'default';
    
    const notifyCheckbox = document.getElementById('enable-notifications');
    const soundDisplay = document.getElementById('notification-sound-display');
    const soundOptions = document.getElementById('notification-sound-options');
    
    if (notifyCheckbox) notifyCheckbox.checked = enableNotifications;
    if (soundDisplay) soundDisplay.textContent = 
        notificationSound === 'default' ? '默认' :
        notificationSound === 'soft' ? '柔和' :
        notificationSound === 'electronic' ? '电子' :
        notificationSound === 'natural' ? '自然' : '无';
    
    if (soundOptions) {
        soundOptions.querySelectorAll('li').forEach(li => {
            li.classList.toggle('selected', li.dataset.value === notificationSound);
        });
    }
    
    // 初始化音频系统
    initAudio();
}

// 添加一个新的函数来检查是否应该显示通知
function shouldShowNotification() {
    return localStorage.getItem('notificationsEnabled') !== 'false';
}

// 播放通知声音
function playNotificationSound(priority = 'medium_priority') {
    // 检查是否启用通知
    if (!shouldShowNotification()) {
        return;
    }
    
    // 检查是否选择了"无"声音
    if (currentNotificationSound === 'none') {
        return;
    }
    
    try {
        if (notificationSoundPlayers[priority]) {
            // 重置音频到开头并播放
            notificationSoundPlayers[priority].currentTime = 0;
            const playPromise = notificationSoundPlayers[priority].play();
            
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.warn('播放通知声音失败:', e);
                });
            }
        }
    } catch (e) {
        console.warn('播放通知声音失败:', e);
    }
}

function initPrivacySettings() {
    const autoClearHistory = localStorage.getItem('autoClearHistory') === 'true';
    const clearInterval = localStorage.getItem('clearInterval') || 'weekly';
    
    const clearCheckbox = document.getElementById('auto-clear-history');
    const intervalDisplay = document.getElementById('clear-interval-display');
    const intervalOptions = document.getElementById('clear-interval-options');
    
    if (clearCheckbox) clearCheckbox.checked = autoClearHistory;
    if (intervalDisplay) intervalDisplay.textContent = 
        clearInterval === 'daily' ? '每天' :
        clearInterval === 'weekly' ? '每周' : '每月';
    
    if (intervalOptions) {
        intervalOptions.querySelectorAll('li').forEach(li => {
            li.classList.toggle('selected', li.dataset.value === clearInterval);
        });
    }
}

function saveAllSettings() {
    // 保存主题设置
    const themeOptions = document.getElementById('theme-select-options');
    let theme;
    if (themeOptions) {
        const selectedTheme = themeOptions.querySelector('li.selected').dataset.value;
        switch(selectedTheme) {
            case '1':
                theme = 'theme-light';
                break;
            case '2':
                theme = 'theme-dark';
                break;
            case '3':
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                theme = systemPrefersDark ? 'theme-dark' : 'theme-light';
                break;
            default:
                theme = 'theme-light';
        }
        applyTheme(theme);
        localStorage.setItem('theme', theme);
        // 更新原始主题为当前保存的主题
        originalTheme = theme;
    }
    
    // 保存字体大小
    const fontSizeOptions = document.getElementById('font-size-options');
    if (fontSizeOptions) {
        const selectedFontSize = fontSizeOptions.querySelector('li.selected').dataset.value;
        document.documentElement.style.setProperty('--font-size', `${selectedFontSize}px`);
        localStorage.setItem('fontSize', selectedFontSize);
    }
    
    // 保存UI样式
    const uiStyleOptions = document.getElementById('ui-style-options');
    if (uiStyleOptions) {
        const selectedUIStyle = uiStyleOptions.querySelector('li.selected').dataset.value;
        const html = document.documentElement;
        html.classList.remove('ui-modern', 'ui-classic');
        html.classList.add(`ui-${selectedUIStyle}`);
        localStorage.setItem('uiStyle', selectedUIStyle);
    }
    
    // 保存高对比度
    const highContrastCheckbox = document.getElementById('high-contrast');
    if (highContrastCheckbox) {
        const highContrast = highContrastCheckbox.checked;
        localStorage.setItem('highContrast', highContrast);
        updateHighContrast(highContrast);
    }
    
    // 保存通知设置
    const notifyCheckbox = document.getElementById('enable-notifications');
    const soundOptions = document.getElementById('notification-sound-options');
    
    if (notifyCheckbox) {
        localStorage.setItem('enableNotifications', notifyCheckbox.checked);
    }
    
    if (soundOptions) {
        const selectedSound = soundOptions.querySelector('li.selected').dataset.value;
        localStorage.setItem('notificationSoundStyle', selectedSound);
        currentNotificationSound = selectedSound;
        initAudio();
    }
    
    // 保存隐私设置
    const clearCheckbox = document.getElementById('auto-clear-history');
    const intervalOptions = document.getElementById('clear-interval-options');
    
    if (clearCheckbox) {
        localStorage.setItem('autoClearHistory', clearCheckbox.checked);
    }
    
    if (intervalOptions) {
        const selectedInterval = intervalOptions.querySelector('li.selected').dataset.value;
        localStorage.setItem('clearInterval', selectedInterval);
    }
    
    // 播放成功音效
    playNotificationSound('medium_priority');
    
    // 显示成功信息 - 使用成功通知而不是信息通知
    showSuccessNotification('设置保存', '设置已保存成功！');
}

function resetAllSettings() {
    // 重置主题设置
    applyTheme('theme-light');
    localStorage.setItem('theme', 'theme-light');
    // 不再更新originalTheme，保持用户设置的主题
    
    const themeDisplay = document.getElementById('theme-select-display');
    const themeOptions = document.getElementById('theme-select-options');
    if (themeDisplay) themeDisplay.textContent = 'Light';
    if (themeOptions) {
        themeOptions.querySelectorAll('li').forEach(li => {
            li.classList.toggle('selected', li.dataset.value === '1');
        });
    }
    
    // 重置字体大小
    document.documentElement.style.setProperty('--font-size', '16px');
    localStorage.setItem('fontSize', '16');
    const fontSizeDisplay = document.getElementById('font-size-display');
    const fontSizeOptions = document.getElementById('font-size-options');
    if (fontSizeDisplay) fontSizeDisplay.textContent = '16px';
    if (fontSizeOptions) {
        fontSizeOptions.querySelectorAll('li').forEach(li => {
            li.classList.toggle('selected', li.dataset.value === '16');
        });
    }
    
    // 重置UI样式
    const html = document.documentElement;
    html.classList.remove('ui-classic');
    html.classList.add('ui-modern');
    localStorage.setItem('uiStyle', 'modern');
    const uiStyleDisplay = document.getElementById('ui-style-display');
    const uiStyleOptions = document.getElementById('ui-style-options');
    if (uiStyleDisplay) uiStyleDisplay.textContent = '现代';
    if (uiStyleOptions) {
        uiStyleOptions.querySelectorAll('li').forEach(li => {
            li.classList.toggle('selected', li.dataset.value === 'modern');
        });
    }
    
    // 重置高对比度
    localStorage.setItem('highContrast', false);
    const highContrastCheckbox = document.getElementById('high-contrast');
    if (highContrastCheckbox) highContrastCheckbox.checked = false;
    updateHighContrast(false);
    
    // 重置通知设置
    localStorage.setItem('enableNotifications', true);
    localStorage.setItem('notificationSoundStyle', 'default');
    const notifyCheckbox = document.getElementById('enable-notifications');
    const soundDisplay = document.getElementById('notification-sound-display');
    const soundOptions = document.getElementById('notification-sound-options');
    if (notifyCheckbox) notifyCheckbox.checked = true;
    if (soundDisplay) soundDisplay.textContent = '默认';
    if (soundOptions) {
        soundOptions.querySelectorAll('li').forEach(li => {
            li.classList.toggle('selected', li.dataset.value === 'default');
        });
    }
    initAudio();
    
    // 重置隐私设置
    const clearCheckbox = document.getElementById('auto-clear-history');
    const intervalDisplay = document.getElementById('clear-interval-display');
    const intervalOptions = document.getElementById('clear-interval-options');
    if (clearCheckbox) clearCheckbox.checked = false;
    if (intervalDisplay) intervalDisplay.textContent = '每周';
    if (intervalOptions) {
        intervalOptions.querySelectorAll('li').forEach(li => {
            li.classList.toggle('selected', li.dataset.value === 'weekly');
        });
    }
    
    // 显示成功信息 - 使用成功通知而不是信息通知
    playNotificationSound('medium_priority');
    showSuccessNotification('设置重置', '设置已重置为默认值');
}

// 页面加载时初始化设置
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initFontSize();
    initUIStyle();
    initHighContrast();
    initNotifications();
    initPrivacySettings();
});

// 添加测试函数，用于调试通知
function testNotification() {
    // 使用成功通知而不是信息通知
    showSuccessNotification('测试通知', '这是一条测试通知');
}