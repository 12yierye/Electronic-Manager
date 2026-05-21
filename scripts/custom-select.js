class CustomSelect {
    constructor(selectElement) {
        this.selectElement = selectElement;
        this.init();
        // Listen for changes on the original select element
        this.selectElement.addEventListener('change', () => {
            this.updateDisplay();
        });
    }

    init() {
        // 隐藏原生select
        this.selectElement.style.display = 'none';
        
        // 创建自定义select容器
        this.customSelect = document.createElement('div');
        this.customSelect.className = 'custom-select';
        
        // 创建显示选中项的元素
        this.selectDisplay = document.createElement('div');
        this.selectDisplay.className = 'custom-select-display';
        this.selectDisplay.tabIndex = 0;
        
        // 创建选项容器
        this.selectOptions = document.createElement('div');
        this.selectOptions.className = 'custom-select-options';
        
        // 设置初始值
        this.updateDisplay();
        
        // 添加选项
        Array.from(this.selectElement.options).forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'custom-select-option';
            optionElement.textContent = option.textContent;
            optionElement.dataset.value = option.value;
            
            if (option.selected) {
                optionElement.classList.add('selected');
            }
            
            // 添加动画延迟
            optionElement.style.transitionDelay = `${index * 0.05}s`;
            
            optionElement.addEventListener('click', () => {
                this.selectOption(optionElement, option.value);
            });
            
            this.selectOptions.appendChild(optionElement);
        });
        
        // 组装元素
        this.customSelect.appendChild(this.selectDisplay);
        this.customSelect.appendChild(this.selectOptions);
        
        // 插入到原生select后面
        this.selectElement.parentNode.insertBefore(this.customSelect, this.selectElement.nextSibling);
        
        // 绑定事件
        this.bindEvents();
    }
    
    bindEvents() {
        // 点击显示/隐藏选项
        this.selectDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleOptions();
        });
        
        // 失去焦点时隐藏选项
        this.selectDisplay.addEventListener('blur', () => {
            this.hideOptions();
        });
        
        // 点击其他地方隐藏选项
        document.addEventListener('click', () => {
            this.hideOptions();
        });
        
        // 键盘支持
        this.selectDisplay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleOptions();
            } else if (e.key === 'Escape') {
                this.hideOptions();
            }
        });
    }
    
    toggleOptions() {
        if (this.selectOptions.classList.contains('show')) {
            this.hideOptions();
        } else {
            this.showOptions();
        }
    }
    
    showOptions() {
        // 先显示容器
        this.selectOptions.classList.add('show');
        this.selectDisplay.classList.add('open');
        
        // 强制重绘以确保动画效果
        this.selectOptions.offsetHeight;
        
        // 添加动画类
        this.selectOptions.classList.add('animate');
    }
    
    hideOptions() {
        this.selectOptions.classList.remove('animate');
        this.selectDisplay.classList.remove('open');
        
        // 减少延迟时间让收起动画更迅速
        setTimeout(() => {
            this.selectOptions.classList.remove('show');
        }, 150);
    }
    
    selectOption(optionElement, value) {
        // 更新UI
        this.selectOptions.querySelectorAll('.custom-select-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        optionElement.classList.add('selected');
        this.selectDisplay.textContent = optionElement.textContent;
        
        // 更新原生select以保持数据同步
        this.selectElement.value = value;
        
        // 触发change事件
        this.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        
        // 隐藏选项
        this.hideOptions();
    }
    
    // 新增方法：根据原生select的值更新显示
    updateDisplay() {
        const selectedOption = this.selectElement.querySelector('option:checked') || this.selectElement.querySelector('option');
        if (selectedOption) {
            this.selectDisplay.textContent = selectedOption.textContent;
            
            // 更新选项的选中状态
            const options = this.customSelect.querySelectorAll('.custom-select-option');
            options.forEach(option => {
                if (option.dataset.value === selectedOption.value) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }
    }
}

// 自动初始化所有带有custom-select类的select元素
document.addEventListener('DOMContentLoaded', () => {
    const selectElements = document.querySelectorAll('select[data-custom]');
    selectElements.forEach(select => {
        new CustomSelect(select);
    });
});