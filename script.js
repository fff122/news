const API_KEY = '1ca3ea66793216443bc9ffebf8b02022.Hk79hTKuyPgIbz9h';
const API_URL = 'https://api.example.com/v1/chat/completions';
const topics = ['新天规发布', '仙界外交', '记者', '仙界观察员', '玉帝特派员'];
const authors = ['太上老君', '孙悟空', '龙王', '王母娘娘', '哪吒', '二郎神', '牛魔王', '嫦娥'];

// 广告配置数组
const ads = [
  {
    title: '【太上老君】九转大还丹',
    content: '原价999999仙币,限时特惠只要998999!买三送一,送完即止!',
    image: '💊'
  },
  {
    title: '【孙悟空】七十二变速成班',
    content: '学不会包赔!特聘美猴王亲自授课!赠送如意金箍棒模型一根!',
    image: '🐒'
  },
  {
    title: '【龙王】水帘洞豪华套房',
    content: '东海龙宫五星级水帘洞,可办蟠桃会!特价每晚只要88888仙币!',
    image: '🐉'
  },
  {
    title: '【王母娘娘】蟠桃种子',
    content: '正品蟠桃树苗!三千年一开花,三千年一结果,包邮到家!',
    image: '🌱'
  },
  {
    title: '【哪吒】乾坤圈保健器材',
    content: '练就金刚不坏之身!原装进口混天绫赠品!数量有限!',
    image: '⭕'
  },
  {
    title: '【二郎神】天眼开光手术',
    content: '专业开天眼!独家三只眼整形技术!术后赠送墨镜一副!',
    image: '👁️'
  },
  {
    title: '【牛魔王】芭蕉扇团购',
    content: '正版火焰山专用降温神器!送红孩儿签名版!',
    image: '🌴'
  },
  {
    title: '【嫦娥】广寒宫瑜伽课',
    content: '包教包会太阴之力!送玉兔美颜仙丹!报名从速!',
    image: '🌙'
  }
];

// 从 localStorage 加载历史新闻
function loadNewsFromStorage() {
  const savedNews = localStorage.getItem('heavenlyNews');
  if (savedNews) {
    const newsList = JSON.parse(savedNews);
    newsList.forEach(news => {
      if (isValidNews(news.title, news.summary, news.fullText)) {
        addNewsToPage(news.title, news.summary, news.fullText, news.category, news.author, news.timestamp);
      }
    });
  }
}

// 保存新闻到 localStorage
function saveNewsToStorage(title, summary, fullText, category, author, timestamp) {
  const savedNews = localStorage.getItem('heavenlyNews') || '[]';
  const newsList = JSON.parse(savedNews);
  newsList.unshift({ title, summary, fullText, category, author, timestamp });
  localStorage.setItem('heavenlyNews', JSON.stringify(newsList));
}

// 验证新闻内容
function isValidNews(title, summary, fullText) {
  return title && summary && fullText && 
         !title.includes('未提供') && 
         !summary.includes('未提供') && 
         !fullText.includes('未提供');
}

async function generateNews(selectedTopic = '') {
  const topic = selectedTopic || topics[Math.floor(Math.random() * topics.length)];
  const prompt = `你必须严格按照此格式生成，请生成一篇关于${topic}的天庭新闻，模仿现代新闻网站风格，语言为中文。新闻需虚构但符合中国神话背景，总字数（标题+摘要+正文）不超过200字，内容简洁、独特且引人入胜。必须包含以下字段且都有内容：

Title: [标题]
Summary: [简短摘要]
Full Text: [完整正文]`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败，状态码: ${response.status}, 信息: ${errorText}`);
    }

    const data = await response.json();
    const newsText = data.choices[0].message.content;
    console.log('Raw newsText:', newsText);

    const { title, summary, fullText } = parseNews(newsText);
    const timestamp = new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const category = topic;
    const author = authors[Math.floor(Math.random() * authors.length)];

    if (isValidNews(title, summary, fullText)) {
      saveNewsToStorage(title, summary, fullText, category, author, timestamp);
      addNewsToPage(title, summary, fullText, category, author, timestamp);
      addInlineAds(); // 生成新闻后添加内嵌广告
    } else {
      console.warn('新闻格式不正确，未显示:', { title, summary, fullText });
    }
  } catch (error) {
    console.error('生成新闻出错:', error);
  }
}

function parseNews(text) {
  const lines = text.split('\n');
  let title = '', summary = '', fullText = '';
  let inFullText = false;

  for (let line of lines) {
    if (line.startsWith('Title:')) {
      title = line.substring(7).trim() || '未提供标题';
    } else if (line.startsWith('Summary:')) {
      summary = line.substring(9).trim() || '未提供摘要';
    } else if (line.startsWith('Full Text:')) {
      fullText = line.substring(11).trim();
      inFullText = true;
    } else if (inFullText && line.trim()) {
      fullText += '\n' + line.trim();
    }
  }

  fullText = fullText || '未提供正文';
  return { title, summary, fullText };
}

function addNewsToPage(title, summary, fullText, category, author, timestamp) {
  const newsContainer = document.getElementById('newsContainer');
  const newsArticle = document.createElement('div');
  newsArticle.className = 'news-article';

  const categoryElement = document.createElement('div');
  categoryElement.className = 'category';
  categoryElement.innerText = category;

  const titleElement = document.createElement('h2');
  titleElement.innerText = title;

  const summaryElement = document.createElement('p');
  summaryElement.className = 'summary';
  summaryElement.innerText = summary;

  const fullTextElement = document.createElement('div');
  fullTextElement.className = 'full-text';
  fullTextElement.innerText = fullText;

  const metaElement = document.createElement('div');
  metaElement.className = 'meta';
  metaElement.innerHTML = `<span>作者: ${author}</span><span>${timestamp}</span>`;

  newsArticle.appendChild(categoryElement);
  newsArticle.appendChild(titleElement);
  newsArticle.appendChild(summaryElement);
  newsArticle.appendChild(fullTextElement);
  newsArticle.appendChild(metaElement);

  newsContainer.insertBefore(newsArticle, newsContainer.firstChild);
}

// 清除历史新闻
function clearNews() {
  localStorage.removeItem('heavenlyNews');
  document.getElementById('newsContainer').innerHTML = '';
}

// 搜索新闻并高亮
function searchNews() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const articles = document.querySelectorAll('.news-article');
  articles.forEach(article => {
    const text = article.textContent.toLowerCase();
    if (text.includes(query) && query) {
      article.classList.add('highlight');
    } else {
      article.classList.remove('highlight');
    }
    article.style.display = text.includes(query) ? 'block' : 'none';
  });
}

// 添加内嵌广告函数
function addInlineAds() {
  const newsArticles = document.querySelectorAll('.news-article');
  newsArticles.forEach((article, index) => {
    if (index % 3 === 1) { // 每3篇文章插入一条广告
      const ad = ads[Math.floor(Math.random() * ads.length)];
      const inlineAd = document.createElement('div');
      inlineAd.className = 'inline-ad';
      inlineAd.innerHTML = `
        <div class="ad-header">
          <span class="ad-image">${ad.image}</span>
          <h4>${ad.title}</h4>
        </div>
        <p>${ad.content}</p>
        <div class="price-tag">
          <span class="current-price">特惠价: 9999仙币</span>
        </div>
        <button class="ad-button">立即查看</button>
      `;
      article.after(inlineAd);
    }
  });
}

// 添加悬浮广告
function addFloatingAd() {
  const ad = ads[Math.floor(Math.random() * ads.length)];
  const floatingAd = document.createElement('div');
  floatingAd.className = 'floating-ad';
  floatingAd.innerHTML = `
    <div class="ad-content">
      <span class="ad-image">${ad.image}</span>
      <h5>${ad.title}</h5>
      <button class="ad-button">查看详情</button>
    </div>
  `;
  document.body.appendChild(floatingAd);
}

// 删除 showPopupAd 函数和相关的触发事件
document.addEventListener('DOMContentLoaded', () => {
  loadNewsFromStorage();
  addFloatingAd(); // 只添加悬浮广告
  
  // 每次加载新闻后添加内嵌广告
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        addInlineAds();
      }
    });
  });

  // 观察新闻容器的变化
  const newsContainer = document.getElementById('newsContainer');
  observer.observe(newsContainer, { childList: true });
});

document.getElementById('topicSelect').addEventListener('change', () => {
  const selectedTopic = document.getElementById('topicSelect').value;
  generateNews(selectedTopic);
});

document.getElementById('refreshButton').addEventListener('click', () => {
  const selectedTopic = document.getElementById('topicSelect').value;
  generateNews(selectedTopic);
});

document.getElementById('searchInput').addEventListener('input', searchNews);
document.getElementById('clearButton').addEventListener('click', clearNews);

// 页面加载时只加载历史新闻,不自动生成新新闻
document.addEventListener('DOMContentLoaded', () => {
  loadNewsFromStorage();
});
