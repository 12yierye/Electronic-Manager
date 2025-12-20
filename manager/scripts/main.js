// 服务器状态信息

const cpuUsage = document.getElementById('cpuUsage');
const processCount = document.getElementById('processCount');

const memoryUsage = document.getElementById('memoryUsage');
const diskUsage = document.getElementById('diskUsage');

const networkTraffic = document.getElementById('networkTraffic');
const uptime = document.getElementById('uptime');

var realCpuUsage = cpuUsage.textContent;
var realProcessCount = processCount.textContent;
var realMemoryUsage = memoryUsage.textContent;
var realDiskUsage = diskUsage.textContent;
var realNetworkTraffic = networkTraffic.textContent;
var realUptime = uptime.textContent;

const SERVER_CONFIG = {
    protocol: 'http',
    ip: '', // Unknown now, keep empty temporarily
    port: 7062
};
const ifGetServerStatus = false;
function getServerStatus(path) {
    fetch(`${SERVER_CONFIG.protocol}://${SERVER_CONFIG.ip}:${SERVER_CONFIG.ip}${path}`)
        .then(response => response.json())
        .then(data => {
            cpuUsage.textContent = data.cpuUsage + '%';
            processCount.textContent = data.processCount;
            memoryUsage.textContent = data.usedMemory + '/' + data.totalMemory + ' GiB';
            diskUsage.textContent = data.usedDisk + '/' + data.totalDisk + ' GiB';
            networkTraffic.textContent = data.upload + '/' + data.download + ' Mbps';
            uptime.textContent = data.uptimeDays + ' 天 ' + data.uptimeHours + ' 小时';
        })
        .catch(error => {
            console.error('Error fetching server status:', error);
            cpuUsage.textContent = realCpuUsage;
            processCount.textContent = realProcessCount;
            memoryUsage.textContent = realMemoryUsage;
            diskUsage.textContent = realDiskUsage;
            networkTraffic.textContent = realNetworkTraffic;
            uptime.textContent = realUptime;
        });
}
if (ifGetServerStatus == true) {
    getServerStatus('/api/status');
    setInterval(() => {
        getServerStatus('/api/status');
    }, 5000);
} else {
    cpuUsage.textContent = realCpuUsage;
    processCount.textContent = realProcessCount;
    memoryUsage.textContent = realMemoryUsage;
    diskUsage.textContent = realDiskUsage;
    networkTraffic.textContent = realNetworkTraffic;
    uptime.textContent = realUptime;
}

var realCpuUsageNum = 42
var realProcessCount = 87

var usedMemory = 0.4
var totalMemory = 1

var usedDisk = 11.4
var totalDisk = 40

var upload = 0.2
var download = 3.6

var uptimeDays = 22
var uptimeHours = 4


cpuUsage.textContent = realCpuUsageNum + '%';
processCount.textContent = realProcessCount;
memoryUsage.textContent = usedMemory + '/' +  totalMemory + ' GiB';
diskUsage.textContent = usedDisk + '/' + totalDisk + ' GiB';
networkTraffic.textContent = upload + '/' + download + ' Mbps';
uptime.textContent = uptimeDays + ' 天 ' + uptimeHours + ' 小时';

// Top Time
const time = document.getElementById('currentTime')

// 创建一个函数来更新时间显示
function updateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeValue = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    time.textContent = timeValue;
}

// 页面加载完成后立即更新时间
document.addEventListener('DOMContentLoaded', function() {
    updateTime();
    // 每秒更新一次时间
    setInterval(updateTime, 1000);
});

// Load
document.addEventListener('DOMContentLoaded', function() {
    initUnderline();
    applyAnimationSettings();

    applyNotificationSettings();
    if (document.body.classList.contains('page-fade-in')) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.remove('page-fade-in');
            });
        });
    }
    
    // 添加Logo点击事件
    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', function() {
            toNewWindow('http://120.24.26.164');
        });
    }
    
    // 添加刷新按钮事件
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            toOriWindow('main.html');
        });
    }
    
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
});

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

window.setAnimationSpeed = function(value) {
    if (typeof value === 'number') {
        value = value + 'ms';
    }
    localStorage.setItem('animationSpeed', String(value));
    applyAnimationSettings();
};

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

function initUnderline() {
    const labels = document.getElementById('labels');
    const activeBtn = document.querySelector('.labelsButton.active');
    const underline = document.createElement('span');
    underline.className = 'underline';
    labels.appendChild(underline);
    updateUnderlinePosition(activeBtn);
}

function updateUnderlinePosition(button) {
    const underline = document.querySelector('.labels .underline');
    const rect = button.getBoundingClientRect();
    const labelsRect = document.getElementById('labels').getBoundingClientRect();
    underline.style.width = `${rect.width}px`;
    underline.style.left = `${rect.left - labelsRect.left}px`;
}

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


if (typeof window.toOriWindow === 'undefined') {
    window.toOriWindow = function(href) {
        navigateWithFade(href, 'restore');
    };
}

if (typeof window.toNewWindow === 'undefined') {
    window.toNewWindow = function(href) {
        try {
            window.open(href, '_blank', 'noopener');
        } catch {
            window.location.href = href;
        }
    };
}

if (typeof window.saveCurrentTheme === 'undefined') {
    window.saveCurrentTheme = function() {
        if (typeof window._saveTheme === 'function') {
            try { return window._saveTheme(); } catch {}
        }
        try {
            const cls = document.documentElement.className || '';
            localStorage.setItem('savedThemeClass', cls);
        } catch {}
    };
}

if (typeof window.restoreOriginalTheme === 'undefined') {
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
}

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

if (typeof window.showNotification === 'undefined') {
    window.showNotification = _fallbackShowNotification;
}

if (typeof window.hideError !== 'function') {
    window.hideError = function() {
        const e = document.getElementById('error');
        if (e) e.classList.remove('show');
    };
}
if (typeof window.hideWarning !== 'function') {
    window.hideWarning = function() {
        const e = document.getElementById('warning');
        if (e) e.classList.remove('show');
    };
}
if (typeof window.hideInfo !== 'function') {
    window.hideInfo = function() {
        const e = document.getElementById('info');
        if (e) e.classList.remove('show');
    };
}

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


		try { 
            playSoundForLevel(type); 
        } catch{
            console.warn('Failed to play notification sound.');
        }
	};

	window.applyNotificationSettings = applyNotificationSettings;
	applyNotificationSettings();
})();