

async function loadWorkDetail() {
  const params = new URLSearchParams(window.location.search);
  const targetName = params.get('p');

  if (!targetName) return;

  try {
    const [worksRes, projectRes] = await Promise.all([
      fetch('work.json'),
      fetch('project.json')
    ]);

    const works = await worksRes.json();
    const projectData = await projectRes.json();
    const knownMaterials = projectData.filter_keywords.map(item => item.id);

    const work = works.find(item => item.en_name && item.en_name.trim() === targetName.trim());

    //戻るリンクを書き換える(絞り込み状態を保存する)
    if (work) {
      document.title = `${work.title} / 統合デザイン学科卒業・修了制作展2026 / web図録`;
      renderWorkPage(work, knownMaterials);
      renderRecommendations(work, works, knownMaterials);

      //つぶつぶカラー変更用：作者の所属プロジェクトカラーへ
      if (window.updateTubuColors) {
        window.updateTubuColors(work.project);
      }

      //個別ページを閲覧するたびに初期数を1つずつ最大5まで増やすギミックを試す用
      const visitedWorks = JSON.parse(sessionStorage.getItem('visitedWorks') || '[]');
      if (!visitedWorks.includes(work.en_name)) {
        visitedWorks.push(work.en_name);
        sessionStorage.setItem('visitedWorks', JSON.stringify(visitedWorks));
        const currentPlus = parseInt(sessionStorage.getItem('visitPlus') || '0');
        if (currentPlus < 5) {
          sessionStorage.setItem('visitPlus', String(currentPlus + 1));
        // 粒を即座に追加
        if (window.syncTubuCount) {
          window.syncTubuCount();
        }
      }
      }


      // 戻るリンクにfilterパラメータを付ける
      const lastFilter = sessionStorage.getItem('lastFilter');
      const returnLink = document.querySelector('.return-to-Top a');
      if (returnLink && lastFilter) {
        returnLink.href = `index.html?filter=${lastFilter}`;
      }
    } else {
      // 作品が見つからない場合
      const mainWindow = document.querySelector('.main-window');
      if (mainWindow) {
        mainWindow.innerHTML = '<p style="padding: 40px; color: #888;">作品が見つかりませんでした。<a href="index.html">一覧に戻る</a></p>';
      }
    }
  } catch (error) {
    console.error("エラー:", error);
  }
}



function renderWorkPage(work, knownMaterials = []) {
  // --- 1. 画像・基本テキストの流し込み ---
  // GAS側でパスが完成しているため、そのまま src に流し込む

  //4/17:main_imageをサムネイルのみに使用し、個別ページでの画像順をナンバリングに従う版に一旦変更中
  const mainDisplayImage = (work.image_list && work.image_list.length > 0) ? work.image_list[0] : work.main_image;
  document.getElementById('main-visual').innerHTML = `<img src="${mainDisplayImage}" style="width:100%; height:auto;" decoding="async" alt="" onerror="this.style.background='#f9f9f9'; this.removeAttribute('src'); this.style.display='block'; this.style.width='100%';">`;  document.getElementById('work-title').innerText = work.title;

  document.getElementById('work-designer').innerText = work.name;
  document.getElementById('work-concept').innerText = work.concept;

  // --- 2. 所属（プロジェクト）の判定 ---
  // project 列が "M" なら大学院、それ以外はプロジェクト
  const projectElem = document.getElementById('work-project');
if (work.project === "M") {
    const masterDetail = work.Master_project ? `（${work.Master_project}）` : "";
    // リンク化：?filter=M を送る
    projectElem.innerHTML = `<a href="index.html?filter=M" class="tag-link">#大学院${masterDetail}</a>`;
} else {
    // リンク化：プロジェクトの記号（A, Bなど）をfilterに送る
    projectElem.innerHTML = `<a href="index.html?filter=${work.project}" class="tag-link">#${work.project}プロジェクト</a>`;
}
  
  // --- 3. 素材表記のカスタマイズ ---
  const matElem = document.getElementById('work-materials');
  if (matElem && work.materials && Array.isArray(work.materials)) {
    const knowns = []; // 絞り込みにある主要素材
    const others = []; // その他

    //紙や木材で種類を()で書いているものをその他ではなくその素材扱いで取り出して表記
    work.materials.forEach(m => {
      const trimmedM = m.trim();
      if (!trimmedM) return;
      const baseM = trimmedM.replace(/（.*）|\(.*\)/, '').trim(); // 括弧を除いた素材名
      if (knownMaterials.includes(baseM)) {
      // 主要素材はリンク付きのHTML文字列として保存
      knowns.push(`<a href="index.html?filter=${baseM}" class="tag-link">#${trimmedM}</a>`);
    } else {
      others.push(trimmedM);
    }
  });

    let displayParts = [];
    if (knowns.length > 0) displayParts.push(knowns.join('、'));
    if (others.length > 0) {
  // リンク先を index.html?filter=その他 に統一
  // #その他 から後の（素材名）までを一つのリンク塊として見せる
  displayParts.push(`<a href="index.html?filter=その他" class="tag-link">#その他（${others.join('、')}）</a>`);
}

    matElem.innerHTML = displayParts.join('、');


    // ---  Contact（連絡先）の追加 ---
    const contactArea = document.getElementById('work-contact-area'); //連絡先がない場合項目ごと消すなら必要
    const contactElem = document.getElementById('work-contact');

    // データがあるかチェック (スプシで空欄なら項目ごと表示しない)
    if (work.contact && work.contact.type && work.contact.id) {
    const type = work.contact.type.toLowerCase().trim(); //スプシ上でインスタの先頭がIでもiでも正しく読み込むようにしている
    let id = work.contact.id.toString().trim();
    let linkUrl = "";
    let displayText = "";

    if (type === "instagram") {
        const cleanId = id.replace('@', '');
        linkUrl = `https://www.instagram.com/${cleanId}/`;
        // 「Instagram @ID」の形式にする
        displayText = `Instagram @${cleanId}`;
      } else if (type === "x" || type === "twitter") {
        const cleanId = id.replace('@', '');
        linkUrl = `https://x.com/${cleanId}/`;
        // 「X @ID」の形式にする
        displayText = `X @${cleanId}`;
      } else if (type === "email") {
        //@がなければ@gmail.comを足す
        const fullEmail = id.includes('@') ? id : `${id}@gmail.com`;
        linkUrl = `mailto:${fullEmail}`;
        displayText = fullEmail;
      }

    if (linkUrl && contactArea) {
      contactArea.style.display = 'flex'; // データがある時だけ表示（レイアウトに合わせてblock等に変更可）
      contactElem.innerHTML = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>`;
    }
  } else {
    // contact_typeが空欄なら項目自体を隠す
    if (contactArea) contactArea.style.display = 'none';
  }
  
  // ---個人ウェブを連絡先SNSに改行した下に表示(提出されたlinkが個人サイトウェブ(link_type=web)のとき)---
  if (work.link && work.link_type === 'web') {
    const webLinkElem = document.getElementById('work-contact-area');
    const webLinkContent = document.getElementById('work-contact');
    if (webLinkElem && webLinkContent) {
      webLinkElem.style.display = 'flex';
      const existingContent = webLinkContent.innerHTML;
      const separator = existingContent ? '<br>' : '';
      webLinkContent.innerHTML += `${separator}<a href="${work.link}" target="_blank" rel="noopener noreferrer">個人ウェブサイト</a>`;
    }
  }

  }

  // --- 4. 動画とサブ画像の表示制御 ---
  const subContentContainer = document.getElementById('sub-images');
  if (subContentContainer) {
    subContentContainer.innerHTML = ''; 

    const renderVideos = () => {
    if (work.video_list && work.video_list.length > 0) {
      work.video_list.forEach(url => {
        const trimmedUrl = url.toString().trim();
        let embedHtml = null;
        let isVertical = false;

      // YouTube（ショート判定あり）
      const youtubeMatch = trimmedUrl.match(/(?:v=|shorts\/|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
        if (youtubeMatch) {
          isVertical = trimmedUrl.includes('shorts/') || (work.video_class && work.video_class.includes('vertical'));
          embedHtml = `<iframe src="https://www.youtube.com/embed/${youtubeMatch[1]}" allowfullscreen></iframe>`;
        }

      // Vimeo
      if (!embedHtml) {
      const vimeoMatch = trimmedUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (vimeoMatch) {
        isVertical = work.link_type === 'vimeo' || (work.video_class && work.video_class.includes('vertical'));
        embedHtml = `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" allowfullscreen></iframe>`;
      }
      }

      // Google Drive動画
      if (!embedHtml) {
        const driveMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (driveMatch) {
          embedHtml = `<iframe src="https://drive.google.com/file/d/${driveMatch[1]}/preview" allowfullscreen></iframe>`;
        }
      }

      // Instagram（公式埋め込み）
      if (!embedHtml) {
        const instaMatch = trimmedUrl.match(/instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);
        if (instaMatch) {
        const instaUrl = `https://www.instagram.com/${instaMatch[1]}/${instaMatch[2]}/`;
        subContentContainer.insertAdjacentHTML('beforeend', `
          <div class="content-item video-item vertical">
            <blockquote class="instagram-media" 
              data-instgrm-permalink="${instaUrl}"
              data-instgrm-version="14"
              style="width:100%; max-width:360px;">
            </blockquote>
          </div>
        `);
        // Instagram埋め込みスクリプトを読み込む（未読み込みの場合のみ）
        if (!document.getElementById('instagram-embed-script')) {
          const script = document.createElement('script');
          script.id = 'instagram-embed-script';
          script.src = 'https://www.instagram.com/embed.js';
          script.async = true;
          document.body.appendChild(script);
        } else if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
        return; // embedHtmlは使わないのでここで終了
      }
    }


      if (embedHtml) {
        const verticalClass = isVertical ? ' vertical' : '';
        const videoTag = `
          <div class="content-item video-item${verticalClass}">
            ${embedHtml}
          </div>`;
        subContentContainer.insertAdjacentHTML('beforeend', videoTag);
      }
    });
  }
};

    const renderImages = () => {
      if (work.image_list && work.image_list.length > 0) {
        work.image_list.forEach((item, index) => {
          if (index === 0) return;  //前は一番上に使っていた画像を排除して残りを下に並べていく形式だったのを、上から順にナンバリングに従い並べる形式に試し変更中
            
      // オブジェクト形式と文字列形式の両対応
      const imgPath = typeof item === 'string' ? item : item.path;
      const layout = typeof item === 'object' && item.layout ? item.layout : null;
      const width = typeof item === 'object' && item.width ? item.width : null;

      const layoutClass = layout ? ` image-layout-${layout}` : '';
      const widthStyle = width ? `style="width:${width}%"` : '';

      const imgTag = `
        <div class="content-item sub-image-item${layoutClass}">
          <img src="${imgPath}" loading="lazy" decoding="async" ${widthStyle}
          onerror="this.style.background='#f9f9f9'; this.removeAttribute('src');">
        </div>`;
      subContentContainer.insertAdjacentHTML('beforeend', imgTag);
    });
  }
};

    // video_to_lastフラグで並び順を入れ替え
    if (work.video_to_last) {
      renderImages();
      renderVideos();
    } else {
      renderVideos();
      renderImages();
    }
  }

  // link_type=PDFの表示
  if (work.link && work.link_type === 'pdf') {
    const driveMatch = work.link.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const pdfTag = `
      <div class="content-item pdf-item">
        <iframe src="https://drive.google.com/file/d/${driveMatch[1]}/preview" 
          style="width:100%; height:600px; border:none;">
        </iframe>
      </div>`;
    subContentContainer.insertAdjacentHTML('beforeend', pdfTag);
  }
}
}





//レコメンド機能
// selectedNamesで重複を管理
function renderRecommendations(currentWork, allWorks, knownMaterials) {
  const container = document.getElementById('recommend-list');
  if (!container) return;

  //個別ページに入ったら、レコメンドをSessionStorageに保存して固定し、2回目以降は保存済みのものを表示
  //タブを閉じるとリセット
  const storageKey = `recommend_${currentWork.school_number}`;
  const savedRecommend = sessionStorage.getItem(storageKey);
  if (savedRecommend) {
    const savedWorks = JSON.parse(savedRecommend);
    savedWorks.forEach(work => {
      const html = `
        <div class="work-item">
          <a href="work.html?p=${work.en_name}" class="work-item-link">
            <div class="work-thumbnail">
              <img src="${work.main_image}" alt="${work.title}" loading="lazy" decoding="async">
            </div>
            <div class="work-info">
              <span class="work-title">${work.title}</span>
              <span class="work-designer">${work.name}</span>
            </div>
          </a>
        </div>`;
      container.insertAdjacentHTML('beforeend', html);
    });
    return;
  }

  const selectedNames = new Set([currentWork.en_name]);
  const recommended = [];

  // --- 1. sort_numberによる前後 (ラベルなし) ---
  const currentSortNum = parseInt(currentWork.sort_number);
  const totalCount = allWorks.length;
  const prevNum = currentSortNum === 1 ? totalCount : currentSortNum - 1;
  const nextNum = currentSortNum === totalCount ? 1 : currentSortNum + 1;

  [prevNum, nextNum].forEach(num => {
    const found = allWorks.find(w => parseInt(w.sort_number) === num);
    if (found) {
      found.recLabel = ""; // 前後は空文字
      recommended.push(found);
      selectedNames.add(found.en_name);
    }
  });

  // --- 2. 同じゼミ(project)から1名 ---
  const sameProjectCandidates = allWorks.filter(w => 
    !selectedNames.has(w.en_name) && w.project === currentWork.project
  );
  if (sameProjectCandidates.length > 0) {
    const picked = sameProjectCandidates[Math.floor(Math.random() * sameProjectCandidates.length)];
    // ゼミ名のラベル設定
    picked.recLabel = picked.project === "M" ? "(大学院)" : `(${picked.project}プロジェクト)`;
    recommended.push(picked);
    selectedNames.add(picked.en_name);
  }

  // --- 3. 素材(materials)から1名 ---
  if (currentWork.materials && currentWork.materials.length > 0) {
    const myMat = currentWork.materials[Math.floor(Math.random() * currentWork.materials.length)].trim();
    const isKnown = knownMaterials.includes(myMat);

    const sameMatCandidates = allWorks.filter(w => {
      if (selectedNames.has(w.en_name)) return false;
      return w.materials.some(m => {
        const targetMat = m.trim();
        return isKnown ? targetMat === myMat : !knownMaterials.includes(targetMat);
      });
    });

    if (sameMatCandidates.length > 0) {
      const picked = sameMatCandidates[Math.floor(Math.random() * sameMatCandidates.length)];
      // 素材ラベルの設定（主要素材ならその名前、その他なら「その他」）
      const matLabelName = isKnown ? myMat : "その他";
      picked.recLabel = `(素材：${matLabelName})`;
      recommended.push(picked);
      selectedNames.add(picked.en_name);
    }
  }

  // --- 4. 補充 (ラベルなし) ---
  while (recommended.length < 4) {
    const backup = allWorks.filter(w => !selectedNames.has(w.en_name));
    if (backup.length === 0) break;
    const picked = backup[Math.floor(Math.random() * backup.length)];
    picked.recLabel = ""; 
    recommended.push(picked);
    selectedNames.add(picked.en_name);
  }

  // --- HTMLの描画 ---
  // renderRecommendations 関数内の描画ループ部分

  //レコメンドの固定。sessionStorageに保存
    const saveData = recommended.map(w => ({
      en_name: w.en_name,
      main_image: w.main_image,
      title: w.title,
      name: w.name
    }));
    sessionStorage.setItem(storageKey, JSON.stringify(saveData));

  recommended.forEach(work => {
    // ラベルがある場合のみ表示するHTMLを作成
    const labelHtml = ""; //work.recLabel ? `<div class="rec-reason">${work.recLabel}</div>` : "";
      //レコメンド理由を一旦消去してみている(空文字)。戻したい場合はコメントアウトを戻す

    const html = `
      <div class="work-item">
        <a href="work.html?p=${work.en_name}" class="work-item-link">
          <div class="work-thumbnail">
            <img src="${work.main_image}" alt="${work.title}" loading="lazy" decoding="async">
          </div>
          <div class="work-info">
            <span class="work-title">${work.title}</span>
            <span class="work-designer">${work.name}</span>
            ${labelHtml}
          </div>
        </a>
      </div>`;
    container.insertAdjacentHTML('beforeend', html);
  });
}






window.onload = loadWorkDetail;