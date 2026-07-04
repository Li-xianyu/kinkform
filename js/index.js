// Trigger deploy 2: KV bindings configured for both production and preview
let inputText = `
#训练方式偏好
-自由重量训练 | 🏋️‍♂️
-器械训练 | 🛠️
-自重训练 | 🤸‍♂️
-HIIT高强间歇 | ⏱️
-长时间有氧 | 🏃‍♀️
-健身团课 | 👯‍♂️
-格斗类训练 | 🥊
-舞蹈健身 | 💃
-功能性训练 | ⚙️
-体操类训练 | 🧗

#饮食控制偏好
-严格控制热量 | 📉
-轻断食 | ⏳
-碳循环 | 🔁
-高蛋白饮食 | 🥩
-低碳水饮食 | 🥑
-增肌餐 | 🍚
-水煮清淡 | 🍲
-偶尔放纵 | 🍕
-完全不控制 | 🤷‍♂️

#训练节奏偏好
-每天训练 | 📅
-隔天训练 | 🔁
-一周三练 | 🧘
-随缘训练 | 🐢
-追求计划感 | 📝
-自由发挥型 | 🎲

#锻炼部位偏好
-胸部训练 | 💪
-腿部训练 | 🦵
-腹肌训练 | 🔥
-背部训练 | 🐍
-手臂训练 | 🏹
-肩部训练 | 🕊️
-全身综合 | 🧱

#健身目标偏好
-增肌 | 📈
-减脂 | 🔥
-塑形 | 🔄
-增强体能 | ⚡
-提升姿态气质 | 👑
-为了健康 | ❤️
-为了颜值 | 😎

#恢复方式偏好
-按摩放松 | 💆‍♂️
-拉伸热身 | 🧘‍♂️
-泡澡桑拿 | ♨️
-睡觉休息 | 🛌
-吃补剂恢复 | 💊
-冥想呼吸 | 🧘‍♀️

#健身场景偏好
-健身房 | 🏢
-家里锻炼 | 🏠
-户外锻炼 | 🌳
-宿舍偷偷练 | 🫣
-办公室活动 | 💼
-操场公园 | 🛝

#健身态度偏好
-打卡型选手 | 📸
-闭门修炼 | 🧙‍♂️
-社交健身型 | 🧑‍🤝‍🧑
-分享型博主 | 📱
-追求极限 | 🧬
-佛系健身 | 🐼

`;


const API_BASE_URL = window.location.origin.startsWith('http') 
  ? window.location.origin 
  : 'https://kinkform.pages.dev';

let userName = '';
let isNameSubmitted = false;
let currentText = inputText;
const controlBtnClickSound = new Audio('mp3/controlbtn.mp3');
const buttonClickSound = new Audio('mp3/button.mp3');


//  初始化








function start() {
	if (!isNameSubmitted) {
	  renderNameInput();
	} else {
	  initApp();
	}
}


function renderNameInput() {
  document.getElementById('name-modal').classList.add('active');
  setTimeout(() => {
    document.getElementById('name-input').focus();
  }, 100);
}



function initApp() {
if(categories.length === 0) {
	categories = parsePreferenceText(currentText);
  }
  const app = document.getElementById('app');
  app.innerHTML = `
    <div id="main-page">
      <h2 id="category-title"></h2>
      <div id="item-list" class="item-list"></div>
      <div class="nav-buttons">
        <button id="prev-btn">← 上一页</button>
        <button id="next-btn">下一页 →</button>
      </div>
      <div id="submit-btn-container" style="display: none;">
        <button id="submit-btn">提交</button>
      </div>
    </div>
    <div id="result-page" style="display: none;"></div>
  `;

  // 重新获取所有DOM引用
  titleEl = document.getElementById('category-title');
  listEl = document.getElementById('item-list');
  prevBtn = document.getElementById('prev-btn');
  nextBtn = document.getElementById('next-btn');
  submitBtn = document.getElementById('submit-btn');

  // 重新绑定事件处理程序
  prevBtn.onclick = () => {
    currentPage--;
    renderPage();
    controlBtnClickSound.play();
  };

  nextBtn.onclick = () => {
    currentPage++;
    renderPage();
    controlBtnClickSound.play();
  };

  submitBtn.onclick = () => {
    controlBtnClickSound.play();
    showResult();
  };

  // 初始化页面
  currentPage = 0; // 重置当前页面
  renderPage();
}


// 脚本解析成表结构
function parsePreferenceText(inputText) {
	let lines = inputText.split('\n');
	let result = [];
	let currentCategory = null;

	for (let line of lines) {
		line = line.trim();
		if (line === '') continue;

		if (line.startsWith('#')) {
			currentCategory = {
				name: line.slice(1).trim(),
				items: []
			};
			result.push(currentCategory);
		} else if (line.startsWith('-')) {
			if (!currentCategory) continue;

			let content = line.slice(1).trim();
			let [label, emoji] = content.split('|');
			label = label.trim();
			emoji = emoji ? emoji.trim() : '';

			currentCategory.items.push({
				label,
				emoji,
				rate: 0
			});
		}
	}
	return result;
}


let currentPage = 0;
let categories = [];
let titleEl = document.getElementById('category-title');
let listEl = document.getElementById('item-list');
let prevBtn = document.getElementById('prev-btn');
let nextBtn = document.getElementById('next-btn');
let submitBtn = document.getElementById('submit-btn');



function renderPage() {
  if (!categories[currentPage]) return;
  const category = categories[currentPage];
  titleEl.innerHTML = `
      ${category.name}
      <div class="operation-hint">
        ← 点击左侧减分 | 点击右侧加分 →
      </div>
    `;
  listEl.innerHTML = '';

  category.items.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'item-split';
    itemEl.dataset.rate = item.rate;
    
    // 简化后的分区（去掉爱心显示）
    itemEl.innerHTML = `
      <div class="left-half">${item.emoji} ${item.label}</div>
      <div class="right-half">${getRateText(item.rate)}</div>
    `;

    // 左半区点击减分
    itemEl.querySelector('.left-half').addEventListener('click', (e) => {
      e.stopPropagation();
      item.rate = Math.max(0, item.rate - 1);
      updateItemState(itemEl, item);
      playClickEffect();
    });

    // 右半区点击加分
    itemEl.querySelector('.right-half').addEventListener('click', (e) => {
      e.stopPropagation();
      item.rate = Math.min(4, item.rate + 1);
      updateItemState(itemEl, item);
      playClickEffect();
    });

    listEl.appendChild(itemEl);
  });

  // 更新导航按钮状态
  prevBtn.style.visibility = currentPage === 0 ? 'hidden' : 'visible';
  nextBtn.style.visibility = currentPage === categories.length - 1 ? 'hidden' : 'visible';
  document.getElementById('submit-btn-container').style.display =
    currentPage === categories.length - 1 ? 'block' : 'none';
}

// 简化后的评分显示（纯文字）
function getRateText(rate) {
  const texts = ['不接受', '无所谓', '一般', '喜欢', '超爱'];
  return texts[rate];
}

// 更新元素状态
function updateItemState(el, item) {
  el.dataset.rate = item.rate;
  el.querySelector('.right-half').textContent = getRateText(item.rate);
  
  // 添加动画效果
  el.classList.add('pop');
  setTimeout(() => el.classList.remove('pop'), 200);
}

function playClickEffect() {
  buttonClickSound.currentTime = 0;
  buttonClickSound.play().catch(e => console.error("音效播放错误: ", e));
}



document.addEventListener('click', function(event) {
  if (event.target.closest('.item-split')) {
    buttonClickSound.currentTime = 0;
    buttonClickSound.play().catch(e => console.error("音效播放错误: ", e));
    event.target.closest('.item-split').classList.add('pop');
    setTimeout(() => {
      event.target.closest('.item-split').classList.remove('pop');
    }, 200);
  }
});




// ====== Result Page Rendering Engine ======

function calcCategoryAvg(category) {
  const sum = category.items.reduce((acc, item) => acc + item.rate, 0);
  return category.items.length ? sum / category.items.length : 0;
}

function calcOverallAvg(categories) {
  const sum = categories.reduce((acc, cat) => acc + calcCategoryAvg(cat), 0);
  return categories.length ? sum / categories.length : 0;
}

function findTopCategory(categories) {
  let best = null, bestAvg = -1;
  categories.forEach(cat => {
    const avg = calcCategoryAvg(cat);
    if (avg > bestAvg) { bestAvg = avg; best = cat; }
  });
  return best;
}

function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function createProfileHeader(userName, categories, timestamp) {
  const header = document.createElement('div');
  header.className = 'result-header';
  const avg = calcOverallAvg(categories);
  const top = findTopCategory(categories);
  const topEmoji = top?.items[0]?.emoji || '🏆';

  header.innerHTML = `
    <div class="result-header-sharer">👤 分享者</div>
    <div class="result-header-main">
      <div class="result-header-avatar">${userName[0]}</div>
      <div class="result-header-info">
        <h2 class="result-header-name">${userName}</h2>
        <div class="result-header-meta">
          <span class="meta-date">${formatDate(timestamp)}</span>
          <span class="meta-divider">·</span>
          <span class="meta-top">${topEmoji} ${top?.name?.replace('偏好', '').trim() || ''}</span>
        </div>
      </div>
    </div>
    <div class="result-header-badge">
      <span class="badge-value">${avg.toFixed(1)}</span>
      <span class="badge-label">综合偏好</span>
    </div>
  `;
  return header;
}

function generatePersonality(categories) {
  const rateCounts = [0, 0, 0, 0, 0];
  let totalItems = 0;
  const allItems = [];

  categories.forEach(cat => {
    const cn = cat.name.replace('偏好', '').trim();
    cat.items.forEach(item => {
      const r = item.rate || 0;
      rateCounts[r]++;
      totalItems++;
      allItems.push({ ...item, cn });
    });
  });

  allItems.sort((a, b) => b.rate - a.rate);

  const topItems = allItems.slice(0, 5);
  const bottomItems = allItems.filter(i => i.rate <= 1).slice(0, 5);

  const bestCat = findTopCategory(categories);

  const p34 = totalItems ? (rateCounts[3] + rateCounts[4]) / totalItems : 0;
  const p01 = totalItems ? (rateCounts[0] + rateCounts[1]) / totalItems : 0;
  const p4 = totalItems ? rateCounts[4] / totalItems : 0;
  const pct = totalItems ? Math.round(allItems.reduce((s, i) => s + i.rate, 0) / (totalItems * 4) * 100) : 0;

  let type, typeEmoji, desc;
  if (p4 > 0.5) {
    type = '狂热型'; typeEmoji = '🔥';
    desc = '你对大多数事物都有强烈的偏好，是个充满热情的人。';
  } else if (p34 > 0.65) {
    type = '热情型'; typeEmoji = '❤️';
    desc = '你偏好广泛，对很多事物都持积极态度。';
  } else if (p01 > 0.6) {
    type = '挑剔型'; typeEmoji = '🔍';
    desc = '你比较挑，只有少数事物能打动你。';
  } else if (p01 > p4 * 2) {
    type = '冷淡型'; typeEmoji = '❄️';
    desc = '你对大多数事物兴趣不高，比较淡然。';
  } else if (p4 > p01 * 2) {
    type = '奔放型'; typeEmoji = '🌊';
    desc = '你很容易对事物产生好感，偏好广泛。';
  } else {
    type = '均衡型'; typeEmoji = '⚖️';
    desc = '你的偏好分布比较均匀，没有特别极端的倾向。';
  }

  return { type, typeEmoji, desc, topItems, bottomItems, bestCat, pct, totalItems };
}

function createPersonalityCard(categories) {
  const p = generatePersonality(categories);
  const section = document.createElement('div');
  section.className = 'result-section';

  const card = document.createElement('div');
  card.className = 'personality-card';

  card.innerHTML = `
    <div class="p-type">${p.typeEmoji} ${p.type}</div>
    <div class="p-summary">${p.desc}</div>
    ${p.bestCat ? `<div class="p-best">🔥 最热衷：<strong>${p.bestCat.items[0]?.emoji || ''} ${p.bestCat.name.replace('偏好', '').trim()}</strong></div>` : ''}
    <div class="p-items">
      <div class="p-items-title">❤️ 最爱</div>
      <div class="p-tags">${p.topItems.map(i => `<span class="p-tag p-tag-love">${i.emoji} ${i.label}</span>`).join('')}</div>
    </div>
    <div class="p-items">
      <div class="p-items-title">❄️ 无感</div>
      <div class="p-tags">${p.bottomItems.map(i => `<span class="p-tag p-tag-meh">${i.emoji} ${i.label}</span>`).join('')}</div>
    </div>
  `;

  section.appendChild(card);
  return section;
}

function createCategoryTags(categories) {
  const section = document.createElement('div');
  section.className = 'result-section';
  const title = document.createElement('h3');
  title.className = 'section-title';
  title.textContent = '📋 分类速览';
  section.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'cat-tags-grid';

  categories.forEach(cat => {
    const avg = calcCategoryAvg(cat);
    const catEmoji = cat.items[0]?.emoji || '';
    const sorted = [...cat.items].sort((a, b) => b.rate - a.rate);
    const topItems = sorted.filter(i => i.rate >= 2).slice(0, 3);

    const card = document.createElement('div');
    card.className = 'cat-tag-card';
    card.innerHTML = `
      <div class="ctc-header">
        <span class="ctc-name">${catEmoji} ${cat.name.replace('偏好', '').trim()}</span>
        <span class="ctc-avg">${avg.toFixed(1)}</span>
      </div>
      <div class="ctc-tags">
        ${topItems.length ? topItems.map(i => {
          const c = ['#ccc', '#8c717c', '#f58cab', '#ec4d7a', '#d7265d'][i.rate] || '#ccc';
          return `<span class="ctc-tag" style="background:${c}15;color:${c}">${i.emoji} ${i.label}</span>`;
        }).join('') : '<span class="ctc-empty">暂无偏好</span>'}
      </div>
    `;
    grid.appendChild(card);
  });

  section.appendChild(grid);
  return section;
}

function createCategoryCard(category) {
  const card = document.createElement('div');
  card.className = 'category-card collapsed';

  const avg = calcCategoryAvg(category);
  const emoji = category.items[0]?.emoji || '';
  const shortName = category.name.replace('偏好', '').trim();

  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <span class="card-name">${emoji} ${shortName}</span>
    <div class="card-avg-bar">
      <div class="avg-bar-track">
        <div class="avg-bar-fill" style="width:${(avg / 4) * 100}%"></div>
      </div>
      <span class="card-avg-score">${avg.toFixed(1)}</span>
    </div>
    <span class="card-toggle">▼</span>
  `;
  header.addEventListener('click', () => {
    card.classList.toggle('collapsed');
    header.querySelector('.card-toggle').textContent = card.classList.contains('collapsed') ? '▼' : '▲';
  });
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'card-body';

  const sorted = [...category.items].sort((a, b) => b.rate - a.rate);
  sorted.forEach(item => {
    const row = document.createElement('div');
    row.className = 'item-bar';
    const pct = (item.rate / 4) * 100;
    row.innerHTML = `
      <span class="item-bar-label">${item.emoji} ${item.label}</span>
      <div class="item-bar-track">
        <div class="item-bar-fill fill-rate-${item.rate}" style="width:${pct}%"></div>
      </div>
      <span class="item-bar-score score-rate-${item.rate}">${getRateText(item.rate)}</span>
    `;
    body.appendChild(row);
  });

  card.appendChild(body);
  return card;
}

function createActionButtons(userName, categories) {
  const container = document.createElement('div');
  container.className = 'result-actions';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'action-btn save-btn';
  saveBtn.innerHTML = '📷 保存结果图片';
  saveBtn.addEventListener('click', async () => {
    try {
      const resultPage = document.querySelector('#result-page');
      const btns = [...resultPage.querySelectorAll('.action-btn, .result-back-btn')];
      btns.forEach(b => b.style.visibility = 'hidden');

      const wm = document.createElement('div');
      wm.textContent = 'KinkForm · 李咸鱼';
      wm.style.cssText = 'position:absolute;bottom:10px;right:10px;font-size:12px;color:rgba(0,0,0,0.2);font-family:sans-serif;z-index:9999;';
      resultPage.appendChild(wm);

      const ld = document.createElement('div');
      ld.textContent = '正在生成图片...';
      ld.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
      document.body.appendChild(ld);

      const canvas = await html2canvas(resultPage, { backgroundColor: '#fff5f7', scale: 2 });
      resultPage.removeChild(wm);
      document.body.removeChild(ld);
      btns.forEach(b => b.style.visibility = '');

      const link = document.createElement('a');
      link.download = `${userName}的KinkForm测评结果.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('生成图片失败:', error);
      alert('图片生成失败，请重试');
    }
  });

  const shareBtn = document.createElement('button');
  shareBtn.className = 'action-btn share-btn';
  shareBtn.innerHTML = '🔗 生成分享链接';
  shareBtn.addEventListener('click', async () => {
    try {
      const ld = document.createElement('div');
      ld.textContent = '正在生成分享链接...';
      ld.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
      document.body.appendChild(ld);

      const response = await fetch(`${API_BASE_URL}/api/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, categories })
      });

      document.body.removeChild(ld);
      if (!response.ok) { const r = await response.json(); throw new Error(r.error || '网络请求失败'); }

      const data = await response.json();
      const shareUrl = `${window.location.origin}${window.location.pathname}?result=${data.key}`;
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(shareUrl);

      const box = document.createElement('div');
      box.className = 'share-link-box-result';
      box.innerHTML = `<div class="share-link-label">✅ 分享链接已生成（已复制）</div><input type="text" class="share-link-input-result" value="${shareUrl}" readonly>`;
      box.querySelector('input').addEventListener('click', (e) => { e.target.select(); if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(shareUrl); });
      shareBtn.insertAdjacentElement('afterend', box);
    } catch (error) {
      console.error('生成分享链接失败:', error);
      alert('失败: ' + error.message);
    }
  });

  container.appendChild(saveBtn);
  container.appendChild(shareBtn);
  return container;
}

function renderFullResult(userName, categories, timestamp, backToHome) {
  const resultPage = document.querySelector('#result-page');
  const mainPage = document.querySelector('#main-page');
  mainPage.style.display = 'none';
  resultPage.style.display = 'block';
  resultPage.innerHTML = '';

  const backBtn = document.createElement('button');
  backBtn.className = 'result-back-btn';
  backBtn.innerHTML = backToHome ? '← 返回首页' : '← 返回修改';
  backBtn.addEventListener('click', () => {
    if (backToHome) {
      document.getElementById('app').style.display = 'none';
      document.getElementById('home-page').style.display = 'block';
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      mainPage.style.display = 'block';
      resultPage.style.display = 'none';
      controlBtnClickSound.currentTime = 0;
      controlBtnClickSound.play();
    }
  });
  resultPage.appendChild(backBtn);
  resultPage.appendChild(createProfileHeader(userName, categories, timestamp));

  resultPage.appendChild(createPersonalityCard(categories));
  resultPage.appendChild(createCategoryTags(categories));

  const cardSec = document.createElement('div');
  cardSec.className = 'result-section';
  cardSec.innerHTML = '<h3 class="section-title">📋 分类详情</h3>';
  const cardGrid = document.createElement('div');
  cardGrid.className = 'category-cards-grid';
  categories.forEach(cat => cardGrid.appendChild(createCategoryCard(cat)));
  cardSec.appendChild(cardGrid);
  resultPage.appendChild(cardSec);

  resultPage.appendChild(createActionButtons(userName, categories));
}

function showResult() {
  renderFullResult(userName, categories, Date.now(), false);
}



function initHomePage() {
  document.getElementById('default-btn').onclick = () => {
    start();
  };

  document.getElementById('custom-btn').onclick = () => {
    document.getElementById('custom-modal').classList.add('active');
    document.getElementById('share-link-container').style.display = 'none';
  };

  document.getElementById('help-btn').onclick = () => {
    document.getElementById('help-modal').classList.add('active');
  };

  document.getElementById('generate-share-btn').onclick = async function() {
    // 检查本地冷却时间
    const lastGenTime = localStorage.getItem('kinkform_last_gen_time');
    if (lastGenTime && Date.now() - parseInt(lastGenTime) < 60000) {
      alert('生成过快！为了防滥用，请等待1分钟后再试。');
      return;
    }

    const customText = document.querySelector('#custom-textarea').value.trim();
    if (!customText) {
      alert('请先粘贴有效的自测表脚本！');
      return;
    }
    
    document.getElementById('loading-overlay').classList.add('active');
    document.getElementById('loading-text').textContent = '正在生成分享链接...';
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: customText })
      });
      
      if (!response.ok) {
          const res = await response.json();
          throw new Error(res.error || '网络请求失败');
      }
      
      const data = await response.json();
      const shareUrl = `${window.location.origin}${window.location.pathname}?key=${data.key}`;
      
      document.getElementById('share-link-container').style.display = 'block';
      const linkInput = document.getElementById('share-link-input');
      linkInput.value = shareUrl;
      
      // 自动复制
      linkInput.select();
      document.execCommand('copy');
      alert('分享链接已生成并复制到剪贴板！');
      
      // 记录本地时间，限制60s
      localStorage.setItem('kinkform_last_gen_time', Date.now().toString());

      // 保存到本地分享记录
      const shares = JSON.parse(localStorage.getItem('kinkform_shares') || '[]');
      const titleLine = customText.split('\n').find(l => l.startsWith('#'));
      shares.push({
        key: data.key,
        text: customText,
        title: titleLine || '未命名表单',
        timestamp: Date.now()
      });
      localStorage.setItem('kinkform_shares', JSON.stringify(shares));

    } catch (error) {
      console.error('生成分享链接失败:', error);
      alert('失败: ' + error.message);
    } finally {
      document.getElementById('loading-overlay').classList.remove('active');
    }
  };

  document.getElementById('share-link-input').onclick = (e) => {
    e.target.select();
    document.execCommand('copy');
    alert('链接已复制！');
  };

  document.getElementById('confirm-btn').onclick = () => {
    const customText = document.querySelector('#custom-textarea').value.trim();
    if (customText) {
      currentText = customText;
      document.getElementById('custom-modal').classList.remove('active');
      start();
    } else {
      alert('请输入有效的自测表内容！');
    }
  };

  document.getElementById('close-custom-btn').onclick = () => {
    document.getElementById('custom-modal').classList.remove('active');
    document.getElementById('share-link-container').style.display = 'none';
  };

  const copyAddon = document.getElementById('copy-link-btn-addon');
  if (copyAddon) {
    copyAddon.onclick = () => {
      const linkInput = document.getElementById('share-link-input');
      linkInput.select();
      document.execCommand('copy');
      alert('分享链接已复制！');
    };
  }

  document.getElementById('my-shares-btn').onclick = () => {
    renderShares();
    document.getElementById('my-shares-modal').classList.add('active');
  };

  document.getElementById('close-shares-btn').onclick = () => {
    document.getElementById('my-shares-modal').classList.remove('active');
  };

  document.getElementById('close-help-btn').onclick = () => {
    document.getElementById('help-modal').classList.remove('active');
  };

  document.getElementById('start-btn').onclick = () => {
    const nameInput = document.getElementById('name-input').value.trim();
    if (nameInput) {
      userName = nameInput;
      isNameSubmitted = true;
      document.getElementById('name-modal').classList.remove('active');
      document.getElementById('home-page').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      initApp();
      controlBtnClickSound.play();
    } else {
      alert('请输入昵称哦~');
    }
  };

  document.getElementById('close-name-btn').onclick = () => {
    document.getElementById('name-modal').classList.remove('active');
  };

  // 轨道顺时针旋转逻辑
  let currentRotation = 0;
  document.getElementById('core-btn').onclick = () => {
    currentRotation += 90;
    controlBtnClickSound.currentTime = 0;
    controlBtnClickSound.play().catch(e => console.error("音效播放错误: ", e));
    
    const wrappers = ['wrapper-default', 'wrapper-custom', 'wrapper-shares', 'wrapper-help'];
    wrappers.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.setProperty('--rot', `${currentRotation}deg`);
        // 同步更新按钮的逆向旋转，确保文字/图标在旋转过程中始终直立
        const btn = el.querySelector('.galaxy-node');
        if (btn) {
          btn.style.setProperty('--rot', `${currentRotation}deg`);
        }
      }
    });
  };
}

function renderShares() {
  const shares = JSON.parse(localStorage.getItem('kinkform_shares') || '[]');
  const listEl = document.getElementById('shares-list');
  if (shares.length === 0) {
    listEl.innerHTML = '<p style="text-align:center; color:#999; margin: 40px 0;">暂无分享记录</p>';
    return;
  }
  
  listEl.innerHTML = '';
  // 按时间倒序
  shares.sort((a,b) => b.timestamp - a.timestamp).forEach((share, index) => {
    const item = document.createElement('div');
    const now = Date.now();
    const expireTime = share.timestamp + 86400 * 1000;
    const isExpired = now > expireTime;
    
    item.className = `share-card ${isExpired ? 'expired' : ''}`;
    
    let statusText = '';
    let statusClass = '';
    let actionBtnHtml = '';
    
    if (isExpired) {
      statusText = '已过期';
      statusClass = 'status-expired';
      actionBtnHtml = `<button class="share-card-action-btn btn-renew" onclick="extendShare(${index})">🔄 续期</button>`;
    } else {
      const hoursLeft = Math.max(1, Math.floor((expireTime - now) / 3600000));
      statusText = `约${hoursLeft}小时后过期`;
      statusClass = 'status-active';
      actionBtnHtml = `<button class="share-card-action-btn btn-copy" onclick="copyShare('${share.key}')">🔗 复制</button>`;
    }
    
    item.innerHTML = `
      <div class="share-card-header">
        <h4 class="share-card-title">${share.title.replace('#','').trim()}</h4>
        <span class="share-card-status ${statusClass}">${statusText}</span>
      </div>
      <div class="share-card-time">Key: <b>${share.key}</b> | 生成时间: ${new Date(share.timestamp).toLocaleString()}</div>
      <div class="share-card-actions">
        ${actionBtnHtml}
        <button class="share-card-action-btn btn-delete" onclick="deleteShare(${index})">🗑️ 删除</button>
      </div>
    `;
    listEl.appendChild(item);
  });
}

window.copyShare = (key) => {
  const url = `${window.location.origin}${window.location.pathname}?key=${key}`;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(() => alert('链接已复制！'));
  } else {
    prompt('请长按或手动复制链接:', url);
  }
};

window.deleteShare = (index) => {
  if(confirm('确定删除本地记录吗？')) {
    const shares = JSON.parse(localStorage.getItem('kinkform_shares') || '[]');
    shares.sort((a,b) => b.timestamp - a.timestamp);
    shares.splice(index, 1);
    localStorage.setItem('kinkform_shares', JSON.stringify(shares));
    renderShares();
  }
};

window.extendShare = async (index) => {
  const shares = JSON.parse(localStorage.getItem('kinkform_shares') || '[]');
  shares.sort((a,b) => b.timestamp - a.timestamp);
  const share = shares[index];
  
  document.getElementById('loading-overlay').classList.add('active');
  document.getElementById('loading-text').textContent = '正在为您续期...';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: share.text, key: share.key })
    });
    if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || '网络请求失败');
    }
    
    share.timestamp = Date.now();
    localStorage.setItem('kinkform_shares', JSON.stringify(shares));
    alert('续期成功，链接已恢复激活！');
    renderShares();
  } catch(e) {
    alert('续期失败: ' + e.message);
  } finally {
    document.getElementById('loading-overlay').classList.remove('active');
  }
};

async function fetchWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function renderResultData(data) {
  const app = document.getElementById('app');
  const homePage = document.getElementById('home-page');
  homePage.style.display = 'none';
  app.style.display = 'block';
  renderFullResult(data.userName, data.categories, data.timestamp, true);
}

async function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const key = urlParams.get('key');
  const resultKey = urlParams.get('result');

  if (resultKey) {
    document.getElementById('loading-overlay').classList.add('active');
    document.getElementById('loading-text').textContent = '正在载入分享结果...';

    let lastError = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (attempt === 2) {
          document.getElementById('loading-text').textContent = '正在重试...';
        }
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/result/${resultKey}`, 12000);
        if (response.ok) {
          const data = await response.json();
          document.getElementById('loading-overlay').classList.remove('active');
          window.history.replaceState({}, document.title, window.location.pathname);
          renderResultData(data);
          return;
        } else if (response.status === 404) {
          alert('该分享结果已失效或不存在。');
          break;
        } else {
          lastError = new Error(`服务器返回 ${response.status}`);
        }
      } catch (error) {
        lastError = error;
        if (error.name === 'AbortError') lastError = new Error('请求超时');
        if (attempt < 2) await new Promise(r => setTimeout(r, 1500));
      }
    }

    if (lastError) {
      const isTimeout = lastError.message === '请求超时';
      const isOffline = !navigator.onLine;
      const ua = navigator.userAgent.toLowerCase();
      const isWeChat = ua.indexOf('micromessenger') !== -1;
      const isQQ = ua.indexOf('mqqbrowser') !== -1 || ua.indexOf('qq/') !== -1;

      if (isOffline) alert('网络连接不可用，请检查网络后刷新重试。');
      else if (isTimeout) {
        if (isWeChat || isQQ) alert('提示：QQ/微信内置浏览器因 workers.dev 域名被国内屏蔽，建议点击右上角选择「在浏览器中打开」。');
        else alert('请求超时，请稍后刷新或更换网络。');
      } else {
        if (isWeChat || isQQ) alert('加载失败。建议点击右上角选择「在浏览器中打开」重试。');
        else alert('网络错误，无法加载分享结果，请稍后刷新重试。');
      }
    }

    document.getElementById('loading-overlay').classList.remove('active');
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  if (key) {
    document.getElementById('loading-overlay').classList.add('active');
    document.getElementById('loading-text').textContent = '正在载入分享的自测表...';
    
    let lastError = null;
    // 最多尝试 2 次（首次 + 1 次重试）
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (attempt === 2) {
          document.getElementById('loading-text').textContent = '正在重试...';
        }
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/share/${key}`, 12000);
        if (response.ok) {
          const text = await response.text();
          currentText = text;
          document.getElementById('loading-overlay').classList.remove('active');
          window.history.replaceState({}, document.title, window.location.pathname);
          start();
          return; // 成功，直接返回
        } else if (response.status === 404) {
          // 链接已失效，无需重试
          alert('加载失败：该分享链接已失效或密钥错误（可能已过期）。');
          break;
        } else {
          lastError = new Error(`服务器返回 ${response.status}`);
        }
      } catch (error) {
        lastError = error;
        if (error.name === 'AbortError') {
          lastError = new Error('请求超时');
        }
        // 如果还有重试机会，稍等再试
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    }

    // 所有尝试均失败
    if (lastError) {
      console.error('加载分享配置失败:', lastError);
      const isTimeout = lastError.message === '请求超时';
      const isOffline = !navigator.onLine;
      
      // 检测微信或QQ内置浏览器
      const ua = navigator.userAgent.toLowerCase();
      const isWeChat = ua.indexOf('micromessenger') !== -1;
      const isQQ = ua.indexOf('mqqbrowser') !== -1 || ua.indexOf('qq/') !== -1;

      if (isOffline) {
        alert('网络连接不可用，请检查网络后刷新重试。');
      } else if (isTimeout) {
        if (isWeChat || isQQ) {
          alert('提示：QQ/微信内置浏览器因 workers.dev 域名被国内屏蔽，可能无法直接加载。\n\n请点击右上角三个点，选择「在浏览器中打开」即可秒进！');
        } else {
          alert('请求超时，服务器响应较慢（workers.dev 域名在国内偶尔访问受限），请稍后刷新或尝试更换网络。');
        }
      } else {
        if (isWeChat || isQQ) {
          alert('加载失败。建议点击右上角三个点，选择「在浏览器中打开」重试。');
        } else {
          alert('网络错误，无法加载分享的自测表，请稍后刷新重试。');
        }
      }
    }

    document.getElementById('loading-overlay').classList.remove('active');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

initHomePage();
checkUrlParams();