    // 读取 goods.json 并渲染推荐文章
    fetch('./goods.json')
        .then(res => res.json())
        .then(goods => {
            const container = document.querySelector('.featured-articles');
            if (!container) return;
            container.innerHTML = '';
            goods.forEach(item => {
                const card = document.createElement('div');
                card.className = 'featured-card';
                card.style.backgroundImage = `url('${item.img}')`;
                card.innerHTML = `<div><h3>${item.title}</h3>${item.desc ? `<p>${item.desc}</p>` : ''}</div>`;
                if(item.link) {
                    card.style.cursor = 'pointer';
                    card.onclick = () => window.open(item.link, '_blank');
                }
                container.appendChild(card);
            });
        });

    // 读取 docs.json 并渲染文章列表
    fetch('./docs.json')
        .then(res => res.json())
        .then(docs => {
            const container = document.querySelector('.article-list');
            if (!container) return;
            container.innerHTML = '';
            docs.forEach(item => {
                const card = document.createElement('div');
                card.className = 'article-card';
                card.innerHTML = `
                    <div class="article-with-image">
                        <div class="article-image">
                            <img src="${item.img}" alt="${item.title}">
                        </div>
                        <div class="article-content">
                            <h3 class="article-title">${item.title}</h3>
                            <div class="article-excerpt">${item.desc || ''}</div>
                        </div>
                    </div>
                `;
                if(item.link) {
                    card.style.cursor = 'pointer';
                    card.onclick = () => window.open(item.link, '_blank');
                }
                container.appendChild(card);
            });
        });
// 深浅色模式切换、title.json和link.csv动态加载

document.addEventListener('DOMContentLoaded', function() {
    // 响应式内容避让侧边栏
    function adjustContentMargin() {
        const container = document.querySelector('.container');
        const sidebar = document.querySelector('.sidebar');
        if (!container || !sidebar) return;
        const winW = window.innerWidth;
        const sidebarW = sidebar.offsetWidth;
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.bottom = '0';
        container.style.height = '100vh';
        if (winW > 900) {
            container.style.left = sidebarW + 'px';
            container.style.right = '0';
        } else if (winW > 600) {
            container.style.left = '0';
            container.style.right = sidebarW + 'px';
        } else {
            container.style.left = '0';
            container.style.right = '0';
        }
    }
    window.addEventListener('resize', adjustContentMargin);
    setTimeout(adjustContentMargin, 0);
    setTimeout(adjustContentMargin, 300);
    const darkModeBtn = document.getElementById('dark-mode');
    const lightModeBtn = document.getElementById('light-mode');
    const systemModeBtn = document.getElementById('system-mode');
    let currentTheme = 'light';
    if (localStorage.getItem('theme')) {
        currentTheme = localStorage.getItem('theme');
        applyTheme(currentTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        currentTheme = 'dark';
        applyTheme(currentTheme);
    }
    darkModeBtn.addEventListener('click', function() {
        currentTheme = 'dark';
        applyTheme(currentTheme);
        updateActiveButton();
        localStorage.setItem('theme', currentTheme);
    });
    lightModeBtn.addEventListener('click', function() {
        currentTheme = 'light';
        applyTheme(currentTheme);
        updateActiveButton();
        localStorage.setItem('theme', currentTheme);
    });
    systemModeBtn.addEventListener('click', function() {
        currentTheme = 'system';
        applyTheme(currentTheme);
        updateActiveButton();
        localStorage.setItem('theme', currentTheme);
    });
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'light') {
            document.body.classList.remove('dark-mode');
        } else if (theme === 'system') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
    }
    function updateActiveButton() {
        darkModeBtn.classList.remove('active');
        lightModeBtn.classList.remove('active');
        systemModeBtn.classList.remove('active');
        if (currentTheme === 'dark') {
            darkModeBtn.classList.add('active');
        } else if (currentTheme === 'light') {
            lightModeBtn.classList.add('active');
        } else if (currentTheme === 'system') {
            systemModeBtn.classList.add('active');
        }
    }
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            if (currentTheme === 'system') {
                if (e.matches) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
            }
        });
    }

    // 读取 config.json 并设置标题、介绍、logo、底部背景
    fetch('./config.json')
        .then(res => res.json())
        .then(data => {
            document.getElementById('site-title').textContent = data.title || '我的博客';
            document.getElementById('site-desc').textContent = data.description || '';
            if (data.logoUrl) {
                document.getElementById('site-logo').src = data.logoUrl;
            }
            if (data.title) {
                document.title = data.title;
            }
            // 网页背景
            if (data.backgroundUrl) {
                document.getElementById('global-bg').style.backgroundImage = `url('${data.backgroundUrl}')`;
            }
            // 遮罩透明度
            let maskAlpha = typeof data.backgroundMaskAlpha === 'number' ? data.backgroundMaskAlpha : 0.5;
            const mask = document.getElementById('global-bg-mask');
            function setMaskColor() {
                if(document.body.classList.contains('dark-mode')) {
                    mask.style.background = `rgba(0,0,0,${maskAlpha})`;
                } else {
                    mask.style.background = `rgba(255,255,255,${maskAlpha})`;
                }
            }
            setMaskColor();
            // 监听模式切换
            const observer = new MutationObserver(setMaskColor);
            observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
            // 模糊效果
            if (data.backgroundBlurEnable) {
                document.body.classList.add('bg-blur');
            } else {
                document.body.classList.remove('bg-blur');
            }
        })
        .catch(() => {
            document.getElementById('site-title').textContent = '我的博客';
            document.getElementById('site-desc').textContent = '';
        });

    // 读取 link.csv 并生成侧边栏导航
    fetch('./link.csv')
        .then(res => res.text())
        .then(text => {
            const lines = text.trim().split('\n');
            const icons = lines.slice(1).map(line => {
                const [icon, title, url] = line.split(',');
                return { icon, title, url };
            });
            const nav = document.getElementById('sidebar-nav');
            nav.innerHTML = '';
            icons.forEach((item, idx) => {
                const div = document.createElement('div');
                div.className = 'nav-item' + (idx === 0 ? ' active' : '');
                div.innerHTML = `<i class="fas fa-${item.icon}"></i> ${item.title}`;
                div.onclick = () => {
                    window.open(item.url, '_blank');
                };
                nav.appendChild(div);
            });
        });

    // 读取 under_link.csv 并生成底部图标链接
    fetch('./under_link.csv')
        .then(res => res.text())
        .then(text => {
            const lines = text.trim().split('\n');
            const icons = lines.slice(1).map(line => {
                const [icon, link] = line.split(',');
                return { icon, link };
            });
            const container = document.getElementById('bottom-icons');
            container.innerHTML = '';
            icons.forEach(item => {
                const a = document.createElement('a');
                a.href = item.link;
                a.target = '_blank';
                a.innerHTML = `<i class="fas fa-${item.icon}"></i>`;
                container.appendChild(a);
            });
        });
});
