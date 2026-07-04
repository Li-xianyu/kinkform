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




function showResult() {
	const resultPage = document.querySelector('#result-page');
	const mainPage = document.querySelector('#main-page');

	mainPage.style.display = 'none';
	resultPage.style.display = 'block';
	resultPage.innerHTML = `
	    <div class="user-header">
	      <h2>${userName}的偏好自测</h2>
	    </div>
	  `;
	
	
	

	const rateLabels = [
		'不接受 🈲',
		'无所谓 😐',
		'一般 🙂',
		'喜欢 😍',
		'超爱 🥰'
	];

	const backBtn = document.createElement('button');
	backBtn.textContent = '← 返回修改';
	backBtn.style.position = 'absolute';  // 新增
	backBtn.style.left = '0';             // 新增
	backBtn.style.top = '0';              // 新增
	backBtn.style.margin = '10px';        // 修改
	backBtn.style.padding = '10px 12px';   // 调整
	backBtn.style.borderRadius = '8px';
	backBtn.style.cursor = 'pointer';
	backBtn.style.border = 'none';
	backBtn.style.backgroundColor = '#f8c8d0';
	backBtn.style.fontWeight = 'bold';
	backBtn.style.zIndex = '1';  

	backBtn.onclick = () => {
		mainPage.style.display = 'block';
		resultPage.style.display = 'none';
		controlBtnClickSound.currentTime = 0;
		controlBtnClickSound.play();
	};

	resultPage.appendChild(backBtn);

	categories.forEach((category) => {
		const title = document.createElement('h3');
		title.textContent = `【${category.name}】`;
		title.style.color = '#5a2a41';
		resultPage.appendChild(title);

		category.items.forEach((item) => {
			const rate = item.rate || 0;
			const line = document.createElement('p');
			line.textContent = `${item.emoji ? item.emoji + ' ' : ''}${item.label}：${rateLabels[rate]}`;
			line.style.margin = '6px 0';
			resultPage.appendChild(line);
		});
	});
	
	const shareContainer = document.createElement('div');
	  shareContainer.style.margin = '20px 0';
	  shareContainer.style.display = 'flex';
	  shareContainer.style.justifyContent = 'center';
	  shareContainer.style.gap = '10px';
	
	  // 创建分享按钮
	  const shareBtn = document.createElement('button');
	  shareBtn.innerHTML = '📷 保存结果图片';
	  shareBtn.style.padding = '10px 20px';
	  shareBtn.style.background = 'linear-gradient(135deg, #f8c8d0, #ec4d7a)';
	  shareBtn.style.color = 'white';
	  shareBtn.style.border = 'none';
	  shareBtn.style.borderRadius = '20px';
	  shareBtn.style.cursor = 'pointer';
	
	  shareBtn.addEventListener('click', async () => {
	    try {
	      // 1. 隐藏所有按钮
	      const buttons = [...resultPage.querySelectorAll('button')];
	      buttons.forEach(btn => btn.style.visibility = 'hidden');
	      
	      // 2. 添加水印元素
	      const watermark = document.createElement('div');
	      watermark.innerHTML = 'KinkForm · 李咸鱼';
	      watermark.style.position = 'absolute';
	      watermark.style.bottom = '10px';
	      watermark.style.right = '10px';
	      watermark.style.fontSize = '12px';
	      watermark.style.color = 'rgba(0,0,0,0.2)';
	      watermark.style.fontFamily = 'sans-serif';
	      watermark.style.zIndex = '9999';
	      resultPage.appendChild(watermark);
	      
	      // 3. 添加加载提示
	      const loading = document.createElement('div');
	      loading.textContent = '正在生成图片...';
	      loading.style.position = 'fixed';
	      loading.style.top = '50%';
	      loading.style.left = '50%';
	      loading.style.transform = 'translate(-50%, -50%)';
	      loading.style.background = 'rgba(0,0,0,0.7)';
	      loading.style.color = 'white';
	      loading.style.padding = '10px 20px';
	      loading.style.borderRadius = '5px';
	      loading.style.zIndex = '1000';
	      document.body.appendChild(loading);
	      
	      // 4. 生成图片
	      const canvas = await html2canvas(resultPage, {
	        backgroundColor: '#fff5f7', // 使用你的主题色
	        scale: 2 // 提高生成质量
	      });
	      
	      // 5. 清理元素
	      resultPage.removeChild(watermark);
	      document.body.removeChild(loading);
	      buttons.forEach(btn => btn.style.visibility = '');
	      
	      // 6. 下载图片
	      const link = document.createElement('a');
	      link.download = `${userName}的KinkForm测评结果.png`;
	      link.href = canvas.toDataURL('image/png', 1.0);
	      link.click();
	      
	    } catch (error) {
	      console.error('生成图片失败:', error);
	      alert('图片生成失败，请重试');
	    }
	  });
	
	  // 其他原有代码...
	  shareContainer.appendChild(shareBtn);
	  resultPage.appendChild(shareContainer);
	
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

async function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const key = urlParams.get('key');
  
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