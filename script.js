function shareResult() {
    share('https://x.com/intent/post?text=');
}

function lineShare() {
    share('https://social-plugins.line.me/lineit/share?url=', '&text=');
}

function share(baseURL, textParam = '') {
    const results = document.getElementById('results');
    if (!results) return;

    const resultItems = results.getElementsByClassName('result-item');
    if (!resultItems || resultItems.length === 0) return;

    const firstResult = resultItems[0];
    const titleElement = firstResult.querySelector('p:nth-child(2)');
    const title = titleElement ? titleElement.textContent.replace('タイトル: ', '') : '';
    const authorElement = firstResult.querySelector('p:nth-child(3)');
    const author = authorElement ? authorElement.textContent.replace('製作者: ', '') : '';
    const url = firstResult.querySelector('a').href;

    const siteUrl = 'http://127.0.0.1:5500/';
    const shareText = `Scratchプロジェクト検索${siteUrl}を使用して出てきた結果です。\nタイトル: ${title}\n製作者: ${author}\nURL: ${url}`;
    const shareUrl = `${baseURL}${encodeURIComponent(siteUrl)}${textParam}${encodeURIComponent(shareText)}`;

    window.open(shareUrl, '_blank');
}


async function fetchProjectDetails(projectId) {
    const proxyUrl = `http://localhost:3000/projects/${projectId}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return {
            id: projectId,
            title: data.title,
            author: data.author.username,
            date: new Date(data.history.created).toLocaleDateString(),
            url: `https://scratch.mit.edu/projects/${projectId}/`
        };
    } catch (error) {
        console.error(`Error fetching project details for project ID: ${projectId}`, error);
        return null;
    }
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (!results) {
        resultsContainer.innerHTML = '<p>非共有または存在しない可能性があります。</p>';
        return;
    }

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <p><strong>プロジェクトID:</strong> ${result.id}</p>
            <p><strong>タイトル:</strong> ${result.title}</p>
            <p><strong>製作者:</strong> ${result.author}</p>
            <p><strong>共有日:</strong> ${result.date}</p>
            <p><a href="${result.url}" target="_blank">プロジェクトを見る</a></p>
            <button onclick="shareResult()" style="background-color: white; border: 1px solid #007bff; color: #007bff; padding: 8px 16px; border-radius: 4px; text-align: center;"><svg class="style-1b1cd5z" viewBox="0 0 20 20" width="20" height="20" fill="#007bff">
            <path d="m11.68 8.62 6.55-7.62h-1.55l-5.69 6.62-4.55-6.62h-5.25l6.88 10.01-6.88 7.99h1.55l6.01-6.99 4.8 6.99h5.24l-7.13-10.38zm-2.13 2.47-.7-1-5.54-7.92h2.39l4.47 6.4.7 1 5.82 8.32h-2.39l-4.75-6.79z"></path></svg></button>
            <button onclick="lineShare()" style="background-color: white; border: 1px solid #00b900; color: #00b900; padding: 8px 16px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <img src="https://developers.line.biz/media/line-social-plugins/square-default.png" alt="LINE Share" style="width: 20px; height: 20px;"></button>
        

            `;
        resultsContainer.appendChild(resultItem);
    });
}

async function singleSearch() {
    const loader = document.getElementById('singleLoader');
    loader.style.display = 'inline-block';

    const projectId = document.getElementById('singleSearch').value;
    if (!projectId) {
        loader.style.display = 'none';
        return;
    }

    const result = await fetchProjectDetails(projectId);
    displayResults(result ? [result] : null);

    loader.style.display = 'none';
}

async function rangeSearch() {
    const loader = document.getElementById('rangeLoader');
    loader.style.display = 'inline-block';

    const startId = parseInt(document.getElementById('rangeStart').value);
    const endId = parseInt(document.getElementById('rangeEnd').value);
    if (isNaN(startId) || isNaN(endId) || startId > endId) {
        loader.style.display = 'none';
        return;
    }

    const progressElement = document.getElementById('rangeProgress');
    progressElement.textContent = '検索中...';

    const results = [];
    const total = endId - startId + 1;
    let completed = 0;

    for (let id = startId; id <= endId; id++) {
        const result = await fetchProjectDetails(id);
        if (result) results.push(result);
        completed++;
        progressElement.textContent = `残り${total - completed}項目`;
    }

    progressElement.textContent = '';
    displayResults(results.length ? results : null);
    loader.style.display = 'none';
}

async function randomSearch() {
    const loader = document.getElementById('randomLoader');
    const progressElement = document.getElementById('randomProgress');
    if (loader && progressElement) {
        progressElement.textContent = '検索中...';

        let result = null;
        while (!result) {
            loader.style.display = 'inline-block'; // 検索が開始されたことを示すためにローダーを表示
            const projectId = Math.floor(Math.random() * 1000000000); // Example range, adjust as needed
            result = await fetchProjectDetails(projectId);
        }

        displayResults(result ? [result] : null);
        loader.style.display = 'none';
        progressElement.textContent = '';
    } else {
        console.error('Error: loader or progress element not found');
    }
}