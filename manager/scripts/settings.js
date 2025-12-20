// settings页面专用JavaScript代码

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
    
    // 初始化设置控件
    initializeSettingsControls();
});

// 初始化标签下划线
function initUnderline() {
    const labels = document.getElementById('labels');
    const activeBtn = document.querySelector('.labelsButton.active');
    const underline = document.createElement('span');
    underline.className = 'underline';
    labels.appendChild(underline);
    updateUnderlinePosition(activeBtn);
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

// 初始化设置控件
function initializeSettingsControls() {
    // 同步控件与当前状态 / 本地保存值
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const uiRadios = document.querySelectorAll('input[name="uiStyle"]');
    const fontRange = document.getElementById('fontSizeRange');
    const fontValue = document.getElementById('fontSizeValue');
    const animRange = document.getElementById('animRange');
    const animValue = document.getElementById('animValue');

    // 初始化：从 documentElement 或 localStorage 读取
    const saved = localStorage.getItem('savedTheme');
    if (saved) {
        try {
            const obj = JSON.parse(saved);
            if (obj.htmlClass) document.documentElement.className = obj.htmlClass;
            if (obj.fontSize) {
                document.documentElement.style.setProperty('--font-size', obj.fontSize);
            }
        } catch(e) {
            console.error('读取已保存主题时出错：', e);
        }
    }

    // 设置 theme 控件状态
    const cls = document.documentElement.className || '';
    themeRadios.forEach(r=>{
        r.checked = cls.includes(r.value);
    });
    uiRadios.forEach(r=> r.checked = cls.includes(r.value));

    // 字体
    const curFont = getComputedStyle(document.documentElement).getPropertyValue('--font-size') || '16px';
    const curFontNum = parseInt(curFont,10) || 16;
    fontRange.value = curFontNum;
    fontValue.value = curFontNum;

    // 动画时长
    let animSaved = localStorage.getItem('animationSpeed');
    if (animSaved && /^\d+$/.test(animSaved.trim())) animSaved = parseInt(animSaved,10);
    else animSaved = 350;
    animRange.value = animSaved;
    animValue.value = animSaved;

    // --- 通知设置：初始化与绑定 ---
    const notifEnabled = document.getElementById('notifEnabled');
    const notifRange = document.getElementById('notifVolumeRange');
    const notifValue = document.getElementById('notifVolumeValue');
    const soundStyleSel = document.getElementById('notifSoundStyle');

    // 读取本地设置（默认启用，音量80）
    let enabled = localStorage.getItem('notificationsEnabled');
    enabled = (enabled === null) ? true : (enabled === 'true');
    let vol = localStorage.getItem('notificationVolume');
    vol = (vol === null) ? 0.8 : Math.min(1, Math.max(0, parseFloat(vol)));

    notifEnabled.checked = !!enabled;
    notifRange.value = Math.round(vol * 100);
    notifValue.value = Math.round(vol * 100);

    // 音效风格控件初始化与绑定
    let savedStyle = localStorage.getItem('notificationSoundStyle') || 'default';
    soundStyleSel.value = savedStyle;

    // 应用到主脚本（若存在）
    if (typeof window.setSoundStyle === 'function') {
        window.setSoundStyle(savedStyle);
    }

    // --- 通知绑定 ---
    notifRange.addEventListener('input', function(){
        notifValue.value = this.value;
        const v = Math.round(Number(this.value))/100;
        localStorage.setItem('notificationVolume', String(v));
        if (typeof window.setNotificationVolume === 'function') window.setNotificationVolume(v);
        // 启用保存按钮
        enableSaveButton();
        // 实时应用设置
        checkSettingsChanged();
    });
    
    notifValue.addEventListener('change', function(){
        let v = Math.round(Math.max(0, Math.min(100, Number(this.value)||0)));
        this.value = v;
        notifRange.value = v;
        const vv = v/100;
        localStorage.setItem('notificationVolume', String(vv));
        if (typeof window.setNotificationVolume === 'function') window.setNotificationVolume(vv);
        // 启用保存按钮
        enableSaveButton();
        // 实时应用设置
        checkSettingsChanged();
    });

    notifEnabled.addEventListener('change', function(){
        const on = !!this.checked;
        localStorage.setItem('notificationsEnabled', on ? 'true' : 'false');
        if (typeof window.setNotificationsEnabled === 'function') window.setNotificationsEnabled(on);
        // 启用保存按钮
        enableSaveButton();
        // 实时应用设置
        checkSettingsChanged();
    });

    soundStyleSel.addEventListener('change', function(){
        const style = this.value || 'default';
        localStorage.setItem('notificationSoundStyle', style);
        if (typeof window.setSoundStyle === 'function') {
            window.setSoundStyle(style);
        }
        // 启用保存按钮
        enableSaveButton();
        // 实时应用设置
        checkSettingsChanged();
        // 测试音效是否生效
        const enabled = localStorage.getItem('notificationsEnabled') !== 'false';
        if (enabled && typeof window.playSoundForLevel === 'function') {
            window.playSoundForLevel('info');
        }
    });
    // --- end 通知绑定 ---

    // 绑定事件
    themeRadios.forEach(r=>{
        r.addEventListener('change', ()=> {
            // 移除其它主题类，添加选中
            document.documentElement.classList.remove('theme-light','theme-dark','theme-high-contrast');
            document.documentElement.classList.add(r.value);
            // 实时应用设置
            checkSettingsChanged();
            // 启用保存按钮
            enableSaveButton();
        });
    });
    
    uiRadios.forEach(r=>{
        r.addEventListener('change', ()=> {
            document.documentElement.classList.toggle('ui-modern', r.value === 'ui-modern');
            document.documentElement.classList.toggle('ui-classic', r.value === 'ui-classic');
            // 实时应用设置
            checkSettingsChanged();
            // 启用保存按钮
            enableSaveButton();
        });
    });
    
    fontRange.addEventListener('input', ()=> { 
        fontValue.value = fontRange.value; 
        applyFont(fontRange.value);
        // 实时应用设置
        checkSettingsChanged();
        // 启用保存按钮
        enableSaveButton();
    });
    
    fontValue.addEventListener('change', ()=> { 
        let v = Math.max(12, Math.min(22, Number(fontValue.value)||16)); 
        fontRange.value = v; 
        fontValue.value = v; 
        applyFont(v);
        // 实时应用设置
        checkSettingsChanged();
        // 启用保存按钮
        enableSaveButton();
    });

    animRange.addEventListener('input', ()=> { 
        animValue.value = animRange.value; 
        applyAnim(animRange.value);
        // 实时应用设置
        checkSettingsChanged();
        // 启用保存按钮
        enableSaveButton();
    });
    
    animValue.addEventListener('change', ()=> { 
        let v = Math.max(50, Math.min(2000, Number(animValue.value)||350)); 
        animRange.value = v; 
        animValue.value = v; 
        applyAnim(v);
        // 实时应用设置
        checkSettingsChanged();
        // 启用保存按钮
        enableSaveButton();
    });

    document.getElementById('save-settings').addEventListener('click', ()=> {
        const saveButton = document.getElementById('save-settings');
        
        // 保存 theme 与偏好
        const obj = {
            htmlClass: document.documentElement.className || '',
            fontSize: getComputedStyle(document.documentElement).getPropertyValue('--font-size') || '16px'
        };
        localStorage.setItem('savedTheme', JSON.stringify(obj));
        localStorage.setItem('animationSpeed', String(animValue.value));
        
        // 保存当前设置为新的初始状态
        saveInitialSettings();
        
        // 禁用保存按钮
        saveButton.disabled = true;
        
        // 使用全局通知系统显示带标题和音效的成功通知
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('设置保存成功', '您的设置已成功保存');
        } else if (typeof createNotification === 'function') {
            createNotification('success', '设置保存成功', '您的设置已成功保存');
        } else {
            console.warn('通知系统不可用');
        }
    });
    
    document.getElementById('reset-settings').addEventListener('click', ()=> {
        // 重置外观设置
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        const uiRadios = document.querySelectorAll('input[name="uiStyle"]');
        const fontRange = document.getElementById('fontSizeRange');
        const fontValue = document.getElementById('fontSizeValue');
        const animRange = document.getElementById('animRange');
        const animValue = document.getElementById('animValue');
        
        // 重置主题为默认（浅色主题）
        themeRadios.forEach(radio => {
            if (radio.value === 'theme-light') {
                radio.checked = true;
                document.documentElement.classList.remove('theme-dark', 'theme-high-contrast');
                document.documentElement.classList.add('theme-light');
            } else {
                radio.checked = false;
            }
        });
        
        // 重置UI风格为默认（现代风格）
        uiRadios.forEach(radio => {
            if (radio.value === 'ui-modern') {
                radio.checked = true;
                document.documentElement.classList.add('ui-modern');
                document.documentElement.classList.remove('ui-classic');
            } else {
                radio.checked = false;
            }
        });
        
        // 重置字体大小
        fontRange.value = 16;
        fontValue.value = 16;
        applyFont(16);
        
        // 重置动画时长
        animRange.value = 350;
        animValue.value = 350;
        applyAnim(350);
        
        // 重置偏好设置
        const notifEnabled = document.getElementById('notifEnabled');
        const notifRange = document.getElementById('notifVolumeRange');
        const notifValue = document.getElementById('notifVolumeValue');
        const soundStyleSel = document.getElementById('notifSoundStyle');
        
        // 重置通知设置为默认值
        notifEnabled.checked = true;
        notifRange.value = 80;
        notifValue.value = 80;
        soundStyleSel.value = 'default';
        
        // 更新localStorage中的通知设置
        localStorage.setItem('notificationsEnabled', 'true');
        localStorage.setItem('notificationVolume', '0.8');
        localStorage.setItem('notificationSoundStyle', 'default');
        
        // 调用相关函数更新通知设置
        if (typeof window.setNotificationsEnabled === 'function') {
            window.setNotificationsEnabled(true);
        }
        if (typeof window.setNotificationVolume === 'function') {
            window.setNotificationVolume(0.8);
        }
        if (typeof window.setSoundStyle === 'function') {
            window.setSoundStyle('default');
        }
        
        // 保存当前设置为新的初始状态
        saveInitialSettings();
        
        // 禁用保存按钮（因为设置已重置为默认值）
        const saveButton = document.getElementById('save-settings');
        saveButton.disabled = true;
        
        // 统一使用新的通知系统
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification('设置重置', '已恢复默认设置');
        } else if (typeof createNotification === 'function') {
            createNotification('info', '设置重置', '已恢复默认设置');
        } else {
            console.warn('通知系统不可用');
        }
    });

    // 页面加载完成后保存初始设置状态
    window.addEventListener('DOMContentLoaded', () => {
        // 延迟一点执行，确保所有设置都已初始化
        setTimeout(() => {
            saveInitialSettings();
            // 初始状态下禁用保存按钮
            const saveButton = document.getElementById('save-settings');
            saveButton.disabled = true;
        }, 100);
    });
    
    // Logo点击事件
    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', function() {
            window.toNewWindow('http://120.24.26.164');
        });
    }
}

function applyFont(v){
    document.documentElement.style.setProperty('--font-size', v + 'px');
}

function applyAnim(v){
    if (typeof window.setAnimationSpeed === 'function') {
        window.setAnimationSpeed(Number(v));
    } else {
        document.documentElement.style.setProperty('--transition-duration', v + 'ms');
        localStorage.setItem('animationSpeed', String(v));
    }
}

// 启用保存按钮的函数
function enableSaveButton() {
    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
        saveButton.disabled = false;
    }
}

// 保存初始设置状态的函数
function saveInitialSettings() {
    const themeRadios = document.querySelectorAll('input[name="theme"]:checked');
    const uiRadios = document.querySelectorAll('input[name="uiStyle"]:checked');
    const fontRange = document.getElementById('fontSizeRange');
    const animRange = document.getElementById('animRange');
    const notifEnabled = document.getElementById('notifEnabled');
    const notifRange = document.getElementById('notifVolumeRange');
    const soundStyleSel = document.getElementById('notifSoundStyle');
    
    window.initialSettings = {
        theme: themeRadios.length > 0 ? themeRadios[0].value : 'theme-light',
        uiStyle: uiRadios.length > 0 ? uiRadios[0].value : 'ui-modern',
        fontSize: fontRange ? fontRange.value : '16',
        animSpeed: animRange ? animRange.value : '350',
        notifEnabled: notifEnabled ? notifEnabled.checked : true,
        notifVolume: notifRange ? notifRange.value : '80',
        soundStyle: soundStyleSel ? soundStyleSel.value : 'default'
    };
}

// 检查设置是否发生变化的函数
function checkSettingsChanged() {
    const themeRadios = document.querySelectorAll('input[name="theme"]:checked');
    const uiRadios = document.querySelectorAll('input[name="uiStyle"]:checked');
    const fontRange = document.getElementById('fontSizeRange');
    const animRange = document.getElementById('animRange');
    const notifEnabled = document.getElementById('notifEnabled');
    const notifRange = document.getElementById('notifVolumeRange');
    const soundStyleSel = document.getElementById('notifSoundStyle');
    
    const currentSettings = {
        theme: themeRadios.length > 0 ? themeRadios[0].value : 'theme-light',
        uiStyle: uiRadios.length > 0 ? uiRadios[0].value : 'ui-modern',
        fontSize: fontRange ? fontRange.value : '16',
        animSpeed: animRange ? animRange.value : '350',
        notifEnabled: notifEnabled ? notifEnabled.checked : true,
        notifVolume: notifRange ? notifRange.value : '80',
        soundStyle: soundStyleSel ? soundStyleSel.value : 'default'
    };
    
    // 比较当前设置与初始设置
    const isChanged = JSON.stringify(currentSettings) !== JSON.stringify(window.initialSettings);
    
    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
        saveButton.disabled = !isChanged;
    }
    
    return isChanged;
}