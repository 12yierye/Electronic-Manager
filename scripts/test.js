// 创建音频元素
let soundPlayers = {};

// 初始化音频系统
function initAudio() {
    try {
        // 创建默认音效元素
        soundPlayers['high_priority_default'] = new Audio();
        soundPlayers['high_priority_default'].src = '../res/sounds/default/high_priority.wav';
        
        soundPlayers['medium_priority_default'] = new Audio();
        soundPlayers['medium_priority_default'].src = '../res/sounds/default/medium_priority.wav';
        
        soundPlayers['low_priority_default'] = new Audio();
        soundPlayers['low_priority_default'].src = '../res/sounds/default/low_priority.wav';
        
        // 创建柔和音效元素
        soundPlayers['high_priority_soft'] = new Audio();
        soundPlayers['high_priority_soft'].src = '../res/sounds/soft/high_priority.wav';
        
        soundPlayers['medium_priority_soft'] = new Audio();
        soundPlayers['medium_priority_soft'].src = '../res/sounds/soft/medium_priority.wav';
        
        soundPlayers['low_priority_soft'] = new Audio();
        soundPlayers['low_priority_soft'].src = '../res/sounds/soft/low_priority.wav';
        
        // 创建电子风格音效元素
        soundPlayers['high_priority_electronic'] = new Audio();
        soundPlayers['high_priority_electronic'].src = '../res/sounds/electronic/high_priority.wav';
        
        soundPlayers['medium_priority_electronic'] = new Audio();
        soundPlayers['medium_priority_electronic'].src = '../res/sounds/electronic/medium_priority.wav';
        
        soundPlayers['low_priority_electronic'] = new Audio();
        soundPlayers['low_priority_electronic'].src = '../res/sounds/electronic/low_priority.wav';
        
        // 创建自然风格音效元素
        soundPlayers['high_priority_natural'] = new Audio();
        soundPlayers['high_priority_natural'].src = '../res/sounds/natural/high_priority.wav';
        
        soundPlayers['medium_priority_natural'] = new Audio();
        soundPlayers['medium_priority_natural'].src = '../res/sounds/natural/medium_priority.wav';
        
        soundPlayers['low_priority_natural'] = new Audio();
        soundPlayers['low_priority_natural'].src = '../res/sounds/natural/low_priority.wav';
        
        // 预加载音频
        Object.values(soundPlayers).forEach(player => {
            player.load();
        });
    } catch (e) {
        console.warn('音频初始化失败:', e);
    }
}

// 播放指定音效
function playSound(priority, type) {
    const soundKey = `${priority}_${type}`;
    
    console.log('尝试播放音效:', soundKey); // 调试信息
    
    try {
        if (soundPlayers[soundKey]) {
            // 重置音频到开头并播放
            soundPlayers[soundKey].currentTime = 0;
            const playPromise = soundPlayers[soundKey].play();
            
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.warn('播放声音失败:', e);
                    alert(`播放声音失败: ${e.message}`);
                });
            }
        } else {
            alert(`未找到音效: ${soundKey}`);
        }
    } catch (e) {
        console.warn('播放声音失败:', e);
        alert(`播放声音失败: ${e.message}`);
    }
}

// 显示生成音效的指令说明
function showGenerateInstructions() {
    const instruction = `要在浏览器外重新生成音效文件，请按以下步骤操作：

1. 打开命令提示符（cmd）或 PowerShell
2. 导航到项目根目录（包含 generate-sounds.js 文件的目录）
3. 运行命令：node generate-sounds.js

这将重新生成所有四种风格的音效文件。`;
    
    alert(instruction);
}

// 保存音效风格设置
function saveSoundStyle() {
    const style = document.getElementById('soundStyle').value;
    localStorage.setItem('notificationSoundStyle', style);
    
    // 更新通知系统中的音效风格
    if (typeof window.setSoundStyle === 'function') {
        window.setSoundStyle(style);
    }
    
    logDebugInfo('音效风格已应用: ' + style);
}

// 初始化调试信息
function initDebugInfo() {
    logDebugInfo('综合测试页面已加载');
    updateNotificationCount();
    
    // 从localStorage读取当前音效风格并设置到下拉框
    const savedStyle = localStorage.getItem('notificationSoundStyle') || 'default';
    document.getElementById('soundStyle').value = savedStyle;
}

// 记录调试信息
function logDebugInfo(message) {
    const debugOutput = document.getElementById('debugOutput');
    const timestamp = new Date().toLocaleTimeString();
    debugOutput.textContent += `[${timestamp}] ${message}\n`;
    debugOutput.scrollTop = debugOutput.scrollHeight;
}

// 清空调试输出
function clearDebugOutput() {
    document.getElementById('debugOutput').textContent = '';
}

// 更新通知计数
function updateNotificationCount() {
    const container = document.getElementById('notificationContainer');
    const count = container ? container.querySelectorAll('.notification').length : 0;
    document.getElementById('notificationCount').textContent = count;
    logDebugInfo(`更新通知计数: ${count}`);
}

// 创建测试通知
function createTestNotification() {
    const type = document.getElementById('notificationType').value;
    const title = document.getElementById('notificationTitle').value;
    const message = document.getElementById('notificationMessage').value;
    const duration = parseInt(document.getElementById('notificationDuration').value);
    
    let id;
    switch(type) {
        case 'info':
            id = showInfoNotification(title, message, duration);
            break;
        case 'success':
            id = showSuccessNotification(title, message, duration);
            break;
        case 'warning':
            id = showWarningNotification(title, message, duration);
            break;
        case 'error':
            id = showErrorNotification(title, message, duration);
            break;
    }
    
    logDebugInfo(`创建通知 - ID: ${id}, 类型: ${type}, 标题: ${title}`);
    updateNotificationCount();
    return id;
}

// 预设通知示例
function createSuccessNotification() {
    const id = showSuccessNotification('操作成功', '您的操作已成功完成。', 3000);
    logDebugInfo(`创建成功通知 - ID: ${id}`);
    updateNotificationCount();
    return id;
}

function createWarningNotification() {
    const id = showWarningNotification('注意警告', '请注意，某些操作可能需要额外关注。', 3000);
    logDebugInfo(`创建警告通知 - ID: ${id}`);
    updateNotificationCount();
    return id;
}

function createErrorNotification() {
    const id = showErrorNotification('操作失败', '执行操作时发生错误，请稍后重试。', 3000);
    logDebugInfo(`创建错误通知 - ID: ${id}`);
    updateNotificationCount();
    return id;
}

function createInfoNotification() {
    const id = showInfoNotification('信息提示', '这是系统提供的相关信息。', 3000);
    logDebugInfo(`创建信息通知 - ID: ${id}`);
    updateNotificationCount();
    return id;
}

// 同时创建多个通知
function createSimultaneousNotifications() {
    logDebugInfo('开始同时创建3个通知');
    showInfoNotification('信息通知 1', '这是第一条同时创建的通知', 5000);
    showSuccessNotification('成功通知 2', '这是第二条同时创建的通知', 5000);
    showWarningNotification('警告通知 3', '这是第三条同时创建的通知', 5000);
    updateNotificationCount();
}

// 错开创建多个通知
function createStaggeredNotifications() {
    logDebugInfo('开始错开创建3个通知');
    showInfoNotification('信息通知 1', '这是第一条错开创建的通知', 5000);
    setTimeout(() => {
        showSuccessNotification('成功通知 2', '这是第二条错开创建的通知', 5000);
        updateNotificationCount();
    }, 200);
    setTimeout(() => {
        showWarningNotification('警告通知 3', '这是第三条错开创建的通知', 5000);
        updateNotificationCount();
    }, 400);
}

// 创建多个通知
function createMultipleNotifications(count) {
    logDebugInfo(`开始创建${count}个通知`);
    const types = ['info', 'success', 'warning', 'error'];
    const titles = ['信息通知', '成功通知', '警告通知', '错误通知'];
    const messages = [
        '这是一条信息通知消息。',
        '操作成功完成！',
        '请注意这个警告信息。',
        '发生了一个错误，请检查。'
    ];
    
    for (let i = 0; i < count; i++) {
        const typeIndex = i % types.length;
        // 使用setTimeout来模拟几乎同时创建多个通知
        setTimeout(() => {
            switch(types[typeIndex]) {
                case 'info':
                    showInfoNotification(
                        titles[typeIndex] + ' ' + (Math.floor(i/types.length) + 1), 
                        messages[typeIndex] + ' (编号: ' + (i+1) + ')',
                        5000
                    );
                    break;
                case 'success':
                    showSuccessNotification(
                        titles[typeIndex] + ' ' + (Math.floor(i/types.length) + 1), 
                        messages[typeIndex] + ' (编号: ' + (i+1) + ')',
                        5000
                    );
                    break;
                case 'warning':
                    showWarningNotification(
                        titles[typeIndex] + ' ' + (Math.floor(i/types.length) + 1), 
                        messages[typeIndex] + ' (编号: ' + (i+1) + ')',
                        5000
                    );
                    break;
                case 'error':
                    showErrorNotification(
                        titles[typeIndex] + ' ' + (Math.floor(i/types.length) + 1), 
                        messages[typeIndex] + ' (编号: ' + (i+1) + ')',
                        5000
                    );
                    break;
            }
            updateNotificationCount();
        }, i * 100); // 稍微错开时间以确保正确创建
    }
}

// 重写 clearAllNotifications 函数以添加调试信息
const originalClearAllNotifications = clearAllNotifications;
clearAllNotifications = function() {
    originalClearAllNotifications();
    logDebugInfo('清空所有通知');
    updateNotificationCount();
};

// 标签切换功能
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有活动状态
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // 添加当前活动状态
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initDebugInfo();
    initAudio();
    setupTabs();
    
    // 绑定通知系统按钮事件
    document.getElementById('createTestNotificationBtn').addEventListener('click', createTestNotification);
    document.getElementById('clearAllNotificationsBtn').addEventListener('click', clearAllNotifications);
    document.getElementById('infoNotificationBtn').addEventListener('click', createInfoNotification);
    document.getElementById('successNotificationBtn').addEventListener('click', createSuccessNotification);
    document.getElementById('warningNotificationBtn').addEventListener('click', createWarningNotification);
    document.getElementById('errorNotificationBtn').addEventListener('click', createErrorNotification);
    document.getElementById('simultaneousNotificationsBtn').addEventListener('click', createSimultaneousNotifications);
    document.getElementById('staggeredNotificationsBtn').addEventListener('click', createStaggeredNotifications);
    document.getElementById('create3NotificationsBtn').addEventListener('click', () => createMultipleNotifications(3));
    document.getElementById('create5NotificationsBtn').addEventListener('click', () => createMultipleNotifications(5));
    document.getElementById('create10NotificationsBtn').addEventListener('click', () => createMultipleNotifications(10));
    document.getElementById('clearDebugOutputBtn').addEventListener('click', clearDebugOutput);
    document.getElementById('updateNotificationCountBtn').addEventListener('click', updateNotificationCount);
    
    // 绑定音效系统按钮事件
    document.querySelectorAll('.sound-type-button').forEach(button => {
        button.addEventListener('click', function() {
            const priority = this.getAttribute('data-priority');
            const type = this.getAttribute('data-type');
            playSound(priority, type);
        });
    });
    
    document.getElementById('generateSoundsBtn').addEventListener('click', showGenerateInstructions);
    
    // 绑定音效风格选择事件
    document.getElementById('soundStyle').addEventListener('change', saveSoundStyle);
});