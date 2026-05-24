document.addEventListener('DOMContentLoaded', function() {
    initUnderline();
    applyAnimationSettings();
    applyNotificationSettings();

    if (document.body.classList.contains('page-fade-in')) {
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                document.body.classList.remove('page-fade-in');
            });
        });
    }

    document.querySelectorAll('.labelsButton').forEach(function(button) {
        button.addEventListener('click', function() {
            document.querySelectorAll('.labelsButton').forEach(function(btn) {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            updateUnderlinePosition(this);
            var category = this.getAttribute('data-category');
            switchPanel(category);
        });
    });

    setupNavigation();

    var logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', function() {
            toNewWindow('http://120.24.26.164');
        });
    }

    var addAccountBtn = document.getElementById('addAccountBtn');
    if (addAccountBtn) {
        addAccountBtn.addEventListener('click', function() {
            if (!authToken) return;
            if (!checkWritePermission()) return;
            openAccountModal(true);
        });
    }

    var modal = document.getElementById('accountModal');
    var modalCancel = document.getElementById('modalCancel');
    var modalSave = document.getElementById('modalSave');

    if (modalCancel) {
        modalCancel.addEventListener('click', closeAccountModal);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAccountModal();
            }
        });
    }

    if (modalSave) {
        modalSave.addEventListener('click', saveAccount);
    }

    var refreshBtn = document.getElementById('refreshAccountsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!authToken) return;
            refreshAccounts();
        });
    }

    var retryBtn = document.getElementById('retryLoadBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', function() {
            if (!authToken) return;
            refreshAccounts();
        });
    }

    var accountSearch = document.getElementById('accountSearch');
    if (accountSearch) {
        accountSearch.addEventListener('input', function() {
            if (window.accountSearchTimer) clearTimeout(window.accountSearchTimer);
            window.accountSearchTimer = setTimeout(function() {
                accountsPage = 1;
                refreshAccountList(true);
            }, 400);
        });
    }

    var loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            if (!authToken) return;
            accountsPage++;
            refreshAccountList(false);
        });
    }

    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            doLogout();
        });
    }

    window.addEventListener('online', function() {
        if (authToken) {
            processOfflineQueue();
        }
    });

    initAuth();
});

// ========== 认证管理 ==========

var authToken = null;
var authUsername = null;
var authRole = null;

function initAuth() {
    var stored = localStorage.getItem('manager_auth');
    if (stored) {
        try {
            var data = JSON.parse(stored);
            authToken = data.token;
            authUsername = data.username;
            authRole = data.role || null;
            var server = getServerConfig();
            fetch(server.protocol + '://' + server.ip + ':' + server.port + '/credential/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: authUsername, token: authToken })
            })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data.success) {
                        onAuthSuccess(authUsername, authToken, authRole);
                        applyRoleBasedUI();
                        refreshAccounts();
                    } else {
                        clearAuth();
                        window.location.href = './login.html';
                    }
                })
                .catch(function() {
                    onAuthSuccess(authUsername, authToken, authRole);
                    applyRoleBasedUI();
                    refreshAccounts();
                });
        } catch (e) {
            clearAuth();
            window.location.href = './login.html';
        }
    } else {
        window.location.href = './login.html';
    }
}

function doLogout() {
    clearAuth();
    document.getElementById('accountsTableBody').innerHTML = '';
    document.getElementById('totalUsers').textContent = '--';
    document.getElementById('onlineUsers').textContent = '--';
    document.getElementById('loginStatus').style.display = 'none';
    window.location.href = './login.html';
}

function clearAuth() {
    authToken = null;
    authUsername = null;
    authRole = null;
    localStorage.removeItem('manager_auth');
}

function onAuthSuccess(username, token, role) {
    var statusEl = document.getElementById('loginStatus');
    var displayEl = document.getElementById('loginUserDisplay');
    var badgeEl = document.getElementById('roleBadge');
    if (statusEl) statusEl.style.display = 'flex';
    if (displayEl) {
        displayEl.textContent = '已登录: ' + username;
    }
    if (badgeEl) {
        var isAdmin = (role === 'admin');
        badgeEl.textContent = isAdmin ? '管理员' : '访客';
        badgeEl.className = 'role-badge ' + (isAdmin ? 'role-admin' : 'role-guest');
    }
}

function applyRoleBasedUI() {
    var isAdmin = (authRole === 'admin');
    var addBtn = document.getElementById('addAccountBtn');
    if (addBtn) {
        addBtn.disabled = !isAdmin;
        addBtn.title = isAdmin ? '' : '仅管理员可执行此操作';
    }
    var saveBtn = document.getElementById('modalSave');
    if (saveBtn) {
        saveBtn.disabled = !isAdmin;
    }
}

function checkWritePermission() {
    if (authRole !== 'admin') {
        showNotification('权限不足，仅管理员可执行此操作', 'error');
        return false;
    }
    return true;
}

// ========== 离线队列 ==========

function getOfflineQueue() {
    try {
        return JSON.parse(localStorage.getItem('offline_queue') || '[]');
    } catch (e) { return []; }
}

function saveOfflineQueue(queue) {
    localStorage.setItem('offline_queue', JSON.stringify(queue));
    updateOfflineStatus();
}

function addToOfflineQueue(operation) {
    var queue = getOfflineQueue();
    queue.push({ op: operation.op, data: operation.data, time: Date.now() });
    saveOfflineQueue(queue);
    showNotification('操作已缓存，网络恢复后将自动重试', 'warning');
}

function updateOfflineStatus() {
    var queue = getOfflineQueue();
    var el = document.getElementById('offlineStatus');
    var countEl = document.getElementById('offlineCount');
    if (queue.length > 0) {
        if (el) el.style.display = 'block';
        if (countEl) countEl.textContent = queue.length + ' 个操作等待网络恢复后重试';
    } else {
        if (el) el.style.display = 'none';
    }
}

function processOfflineQueue() {
    var queue = getOfflineQueue();
    if (queue.length === 0) return;
    if (!navigator.onLine) return;

    var remaining = [];
    var processed = 0;

    function next() {
        if (queue.length === 0) {
            saveOfflineQueue(remaining);
            if (processed > 0) {
                showNotification('已自动重试 ' + processed + ' 个缓存操作', 'success');
                refreshAccounts();
            }
            return;
        }
        var item = queue.shift();
        var reqData = item.data;

        var server = getServerConfig();
        var url, options;
        if (item.op === 'add') {
            url = server.protocol + '://' + server.ip + ':' + server.port + '/api/accounts';
            options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
                body: JSON.stringify(reqData)
            };
        } else if (item.op === 'delete') {
            url = server.protocol + '://' + server.ip + ':' + server.port + '/api/accounts/' + encodeURIComponent(reqData.username);
            options = {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + authToken }
            };
        } else {
            remaining.push(item);
            next();
            return;
        }

        fetch(url, options)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.success) {
                    processed++;
                } else {
                    remaining.push(item);
                }
                next();
            })
            .catch(function() {
                remaining.push(item);
                next();
            });
    }

    next();
}

// ========== 数据获取 ==========

var accountsCache = {
    stats: null,
    statsTime: 0,
    list: null,
    listTime: 0,
    listSearch: ''
};

var CACHE_TTL = 30000;
var accountsPage = 1;

function refreshAccounts() {
    hideError();
    refreshAccountStats();
    accountsPage = 1;
    refreshAccountList(true);
}

function authFetch(url, options) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + authToken;
    return fetch(url, options);
}

function refreshAccountStats() {
    var now = Date.now();
    if (accountsCache.stats && now - accountsCache.statsTime < CACHE_TTL) {
        renderStats(accountsCache.stats);
        return;
    }

    var server = getServerConfig();
    authFetch(server.protocol + '://' + server.ip + ':' + server.port + '/api/accounts/stats')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                accountsCache.stats = data;
                accountsCache.statsTime = Date.now();
                renderStats(data);
            }
        })
        .catch(function(err) {
            console.error('获取账户统计失败:', err);
        });
}

function refreshAccountList(replace) {
    showLoading();

    var now = Date.now();
    var search = document.getElementById('accountSearch').value.trim();

    if (accountsCache.list && now - accountsCache.listTime < CACHE_TTL
        && accountsCache.listSearch === search && replace) {
        hideLoading();
        renderList(accountsCache.list, true);
        return;
    }

    var server = getServerConfig();
    var url = server.protocol + '://' + server.ip + ':' + server.port + '/api/accounts?page=' + accountsPage + '&limit=20';
    if (search) {
        url += '&search=' + encodeURIComponent(search);
    }

    authFetch(url)
        .then(function(res) {
            if (res.status === 401) {
                clearAuth();
                window.location.href = './login.html';
                throw new Error('登录已过期');
            }
            return res.json();
        })
        .then(function(data) {
            hideLoading();
            if (data.success) {
                if (replace) {
                    accountsCache.list = data;
                    accountsCache.listTime = Date.now();
                    accountsCache.listSearch = search;
                    renderList(data, true);
                } else {
                    appendToList(data);
                }
                hideError();
            } else {
                showError('获取账户列表失败');
            }
        })
        .catch(function(err) {
            hideLoading();
            if (err.message === '登录已过期') return;
            console.error('获取账户列表失败:', err);
            showError('网络错误，请检查服务端连接后重试');
        });
}

// ========== 渲染 ==========

function renderStats(data) {
    var totalEl = document.getElementById('totalUsers');
    var onlineEl = document.getElementById('onlineUsers');
    if (totalEl) {
        totalEl.textContent = data.totalUsers.toLocaleString();
        totalEl.classList.remove('value-updated');
        void totalEl.offsetWidth;
        totalEl.classList.add('value-updated');
    }
    if (onlineEl) {
        onlineEl.textContent = data.onlineUsers.toLocaleString();
        onlineEl.classList.remove('value-updated');
        void onlineEl.offsetWidth;
        onlineEl.classList.add('value-updated');
    }
}

function renderList(data, replace) {
    var tbody = document.getElementById('accountsTableBody');
    if (!tbody) return;

    if (replace) {
        tbody.innerHTML = '';
    }

    var isAdmin = (authRole === 'admin');
    var users = data.users || [];
    users.forEach(function(user) {
        var tr = document.createElement('tr');
        tr.className = 'user-item';

        var statusClass, statusText;
        if (user.username === 'admin') {
            if (authUsername === 'admin') {
                statusClass = 'online';
                statusText = '（管理员）';
            } else {
                statusClass = 'busy';
                statusText = '忙碌';
            }
        } else if (user.online) {
            statusClass = 'online';
            statusText = '在线';
        } else {
            statusClass = 'offline';
            statusText = '离线';
        }

        var disabledAttr = isAdmin ? '' : ' disabled title="仅管理员可执行此操作"';
        tr.innerHTML = '<td>' + escapeHtml(user.username) + '</td>'
            + '<td>' + escapeHtml(getRoleDisplayName(user.role)) + '</td>'
            + '<td><span class="status ' + statusClass + '">' + statusText + '</span></td>'
            + '<td><button class="delete-btn" data-username="' + escapeHtml(user.username) + '"' + disabledAttr + '>删除</button></td>';
        tbody.appendChild(tr);
    });

    var loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) {
        loadMoreContainer.style.display = data.hasMore ? 'block' : 'none';
    }

    if (users.length === 0 && replace) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-secondary)">暂无账户数据</td></tr>';
    }

    document.querySelectorAll('#accountsTableBody .delete-btn:not([disabled])').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var username = this.getAttribute('data-username');
            if (username === 'admin') {
                showNotification('不能删除管理员账户', 'error');
                return;
            }
            if (confirm('确定要删除账户 "' + username + '" 吗？')) {
                deleteAccount(username);
            }
        });
    });
}

function appendToList(data) {
    var tbody = document.getElementById('accountsTableBody');
    if (!tbody) return;

    var isAdmin = (authRole === 'admin');
    var users = data.users || [];
    users.forEach(function(user) {
        var tr = document.createElement('tr');
        tr.className = 'user-item';

        var statusClass, statusText;
        if (user.username === 'admin') {
            if (authUsername === 'admin') {
                statusClass = 'online';
                statusText = '（管理员）';
            } else {
                statusClass = 'busy';
                statusText = '忙碌';
            }
        } else if (user.online) {
            statusClass = 'online';
            statusText = '在线';
        } else {
            statusClass = 'offline';
            statusText = '离线';
        }

        var disabledAttr = isAdmin ? '' : ' disabled title="仅管理员可执行此操作"';
        tr.innerHTML = '<td>' + escapeHtml(user.username) + '</td>'
            + '<td>' + escapeHtml(getRoleDisplayName(user.role)) + '</td>'
            + '<td><span class="status ' + statusClass + '">' + statusText + '</span></td>'
            + '<td><button class="delete-btn" data-username="' + escapeHtml(user.username) + '"' + disabledAttr + '>删除</button></td>';
        tbody.appendChild(tr);
    });

    var loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) {
        loadMoreContainer.style.display = data.hasMore ? 'block' : 'none';
    }

    document.querySelectorAll('#accountsTableBody .delete-btn:not([disabled])').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var username = this.getAttribute('data-username');
            if (username === 'admin') {
                showNotification('不能删除管理员账户', 'error');
                return;
            }
            if (confirm('确定要删除账户 "' + username + '" 吗？')) {
                deleteAccount(username);
            }
        });
    });
}

// ========== UI 状态 ==========

function showLoading() {
    var indicator = document.getElementById('loadingIndicator');
    if (indicator) indicator.classList.add('active');
}

function hideLoading() {
    var indicator = document.getElementById('loadingIndicator');
    if (indicator) indicator.classList.remove('active');
}

function showError(msg) {
    var error = document.getElementById('accountError');
    var text = document.getElementById('accountErrorText');
    if (text) text.textContent = msg || '获取账户列表失败';
    if (error) error.classList.add('active');
}

function hideError() {
    var error = document.getElementById('accountError');
    if (error) error.classList.remove('active');
}

// ========== 操作 ==========

function saveAccount() {
    if (!checkWritePermission()) return;

    var modalUsername = document.getElementById('modalUsername');
    var modalPassword = document.getElementById('modalPassword');
    var modalRole = document.getElementById('modalRole');
    var modalStatus = document.getElementById('modalStatus');

    var username = modalUsername.value.trim();
    var password = modalPassword.value;
    var role = modalRole.value;

    if (!username) {
        showNotification('用户名不能为空', 'error');
        return;
    }

    if (!password) {
        showNotification('密码不能为空', 'error');
        return;
    }

    var saveBtn = document.getElementById('modalSave');
    saveBtn.disabled = true;
    saveBtn.textContent = '保存中...';

    var server = getServerConfig();
    authFetch(server.protocol + '://' + server.ip + ':' + server.port + '/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: username,
            password: password,
            role: role
        })
    })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                showNotification('账户 "' + username + '" 已创建', 'success');
                closeAccountModal();
                accountsCache.list = null;
                accountsCache.listTime = 0;
                accountsCache.stats = null;
                accountsCache.statsTime = 0;
                refreshAccounts();
            } else {
                showNotification('创建失败: ' + (data.message || '未知错误'), 'error');
            }
        })
        .catch(function() {
            addToOfflineQueue({ op: 'add', data: { username: username, password: password, role: role } });
            closeAccountModal();
        })
        .finally(function() {
            saveBtn.disabled = false;
            saveBtn.textContent = '保存';
            modalPassword.value = '';
        });
}

function deleteAccount(username) {
    if (!checkWritePermission()) return;

    var server = getServerConfig();
    authFetch(server.protocol + '://' + server.ip + ':' + server.port + '/api/accounts/' + encodeURIComponent(username), {
        method: 'DELETE'
    })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                showNotification('账户 "' + username + '" 已删除', 'success');
                accountsCache.list = null;
                accountsCache.listTime = 0;
                accountsCache.stats = null;
                accountsCache.statsTime = 0;
                accountsPage = 1;
                refreshAccounts();
            } else {
                showNotification(data.message || '删除失败', 'error');
            }
        })
        .catch(function() {
            addToOfflineQueue({ op: 'delete', data: { username: username } });
        });
}

// ========== 工具函数 ==========

function getServerConfig() {
    return {
        protocol: location.protocol === 'https:' ? 'https' : 'http',
        ip: location.hostname || 'localhost',
        port: 3001
    };
}

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function getRoleDisplayName(role) {
    var map = {
        'admin': 'Administrator',
        'user': 'User',
        'guest': 'Guest'
    };
    return map[role] || role || 'User';
}

// ========== 原有函数 ==========

function initUnderline() {
    var labels = document.getElementById('labels');
    if (!labels) return;
    var activeBtn = document.querySelector('.labelsButton.active');
    if (!activeBtn) return;
    var underline = document.createElement('span');
    underline.className = 'underline';
    labels.appendChild(underline);
    updateUnderlinePosition(activeBtn);
}

function updateUnderlinePosition(button) {
    var underline = document.querySelector('.labels .underline');
    if (!underline) return;
    var labels = document.getElementById('labels');
    if (!labels) return;
    var rect = button.getBoundingClientRect();
    var labelsRect = labels.getBoundingClientRect();
    underline.style.width = rect.width + 'px';
    underline.style.left = (rect.left - labelsRect.left) + 'px';
}

function switchPanel(category) {
    var target = document.getElementById(category + '-panel');
    if (!target) return;

    var panels = Array.from(document.querySelectorAll('.content-panel'));
    var current = null;
    for (var i = 0; i < panels.length; i++) {
        if (window.getComputedStyle(panels[i]).display !== 'none') {
            current = panels[i];
            break;
        }
    }

    if (current === target) return;

    var duration = getTransitionDurationMs();
    var safeTimeout = duration + 100;

    var hideCurrent = function() {
        return new Promise(function(resolve) {
            if (!current) return resolve();

            current.classList.remove('fade-in', 'fade-in-active');
            current.classList.add('fade-out');

            var done = function() {
                current.classList.remove('fade-out');
                current.style.display = 'none';
                current.removeEventListener('transitionend', onEnd);
                resolve();
            };

            var onEnd = function(e) {
                if (e.target !== current) return;
                done();
            };

            current.addEventListener('transitionend', onEnd, { once: true });

            setTimeout(function() {
                if (window.getComputedStyle(current).display !== 'none') {
                    done();
                }
            }, safeTimeout);
        });
    };

    var showTarget = function() {
        return new Promise(function(resolve) {
            target.classList.remove('fade-out', 'fade-in-active');
            target.classList.add('fade-in');
            target.style.display = 'block';

            // eslint-disable-next-line no-unused-expressions
            target.offsetHeight;

            target.classList.add('fade-in-active');

            var done = function() {
                target.classList.remove('fade-in', 'fade-in-active');
                target.removeEventListener('transitionend', onEnd);
                resolve();
            };

            var onEnd = function(e) {
                if (e.target !== target) return;
                done();
            };

            target.addEventListener('transitionend', onEnd, { once: true });

            setTimeout(function() {
                if (target.classList.contains('fade-in') || target.classList.contains('fade-in-active')) {
                    done();
                }
            }, safeTimeout);
        });
    };

    hideCurrent().then(function() { showTarget(); });
}

function getTransitionDurationMs() {
    var raw = getComputedStyle(document.documentElement).getPropertyValue('--transition-duration').trim() || '350ms';
    if (raw.endsWith('ms')) {
        return parseFloat(raw);
    } else if (raw.endsWith('s')) {
        return parseFloat(raw) * 1000;
    } else if (/^\d+$/.test(raw)) {
        return parseFloat(raw);
    }
    return 350;
}

function openAccountModal(isAddMode, accountData) {
    var modal = document.getElementById('accountModal');
    var modalTitle = document.getElementById('modalTitle');
    var modalUsername = document.getElementById('modalUsername');
    var modalPassword = document.getElementById('modalPassword');
    var modalRole = document.getElementById('modalRole');
    var modalStatus = document.getElementById('modalStatus');

    if (isAddMode) {
        modalTitle.textContent = '添加账户';
        modalUsername.value = '';
        modalPassword.value = '';
        modalPassword.style.display = '';
        modalRole.value = 'user';
        modalStatus.value = 'offline';
        modalUsername.disabled = false;
    } else {
        modalTitle.textContent = '编辑账户';
        if (accountData) {
            modalUsername.value = accountData.username || '';
            modalRole.value = accountData.role || 'user';
            modalStatus.value = accountData.status || 'offline';
        }
        modalPassword.style.display = 'none';
        modalUsername.disabled = true;
    }

    modal.classList.add('show');
}

function closeAccountModal() {
    var modal = document.getElementById('accountModal');
    modal.classList.remove('show');
}