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
