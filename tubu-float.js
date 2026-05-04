(function () {
  const stage = document.getElementById("tubu-stage");
  const sideBar = document.getElementById("side-bar");

  if (!stage || !sideBar) return;

  const IMG_SIZE = 30;
  const INITIAL_COUNT = 5;
  //const MAX_COUNT = 30;
  const IMAGE_NAMES = [
    "tubu1.webp", // pink
    "tubu2.webp", // orange
    "tubu3.webp", // vivid-blue
    "tubu4.webp", // green
    "tubu5.webp", // blue
  ];

  //個別ページを閲覧するたびに初期数を1つずつ最大5まで増やすギミックを試す用
  const MAX_VISIT_PLUS = 5;


  //追加
  // ゼミごとのつぶつぶカラーセット定義
//  const PROJECT_RECIPES = {
//    'A': ["tubu1.webp", "tubu1.webp", "tubu3.webp", "tubu3.webp", "tubu5.webp"],
//    'B': ["tubu1.webp", "tubu3.webp", "tubu3.webp", "tubu4.webp", "tubu4.webp"],
//    'C': ["tubu2.webp", "tubu3.webp", "tubu4.webp", "tubu4.webp", "tubu4.webp"],
//    'D': ["tubu1.webp", "tubu1.webp", "tubu1.webp", "tubu1.webp", "tubu4.webp"],
//    'F': ["tubu1.webp", "tubu1.webp", "tubu2.webp", "tubu5.webp", "tubu5.webp"],
//    'Y': ["tubu2.webp", "tubu2.webp", "tubu2.webp", "tubu4.webp", "tubu5.webp"],
//    'M': ["tubu1.webp", "tubu2.webp", "tubu3.webp", "tubu4.webp", "tubu5.webp"],
//    'all': ["tubu1.webp", "tubu2.webp", "tubu3.webp", "tubu4.webp", "tubu5.webp"]
//  };
    const PROJECT_RECIPES = {
  'A': ["tubu5.webp", "tubu1.webp", "tubu3.webp", "tubu3.webp", "tubu1.webp"],
  'B': ["tubu3.webp", "tubu4.webp", "tubu1.webp", "tubu4.webp", "tubu3.webp"],
  'C': ["tubu4.webp", "tubu2.webp", "tubu4.webp", "tubu3.webp", "tubu4.webp"],
  'D': ["tubu1.webp", "tubu4.webp", "tubu1.webp", "tubu1.webp", "tubu1.webp"],
  'F': ["tubu2.webp", "tubu1.webp", "tubu5.webp", "tubu5.webp", "tubu1.webp"],
  'Y': ["tubu5.webp", "tubu4.webp", "tubu2.webp", "tubu2.webp", "tubu2.webp"],
  'M': ["tubu4.webp", "tubu3.webp", "tubu5.webp", "tubu1.webp", "tubu2.webp"],
  'all': ["tubu1.webp", "tubu2.webp", "tubu3.webp", "tubu4.webp", "tubu5.webp"]
};


  let currentRecipeKey = 'all';


    //個別ページを閲覧するたびに初期数を1つずつ最大5まで増やすギミックを試す用
  // 現在のベース数を取得
  function getBaseCount() {
    const plus = Math.min(parseInt(sessionStorage.getItem('visitPlus') || '0'), MAX_VISIT_PLUS);
    return INITIAL_COUNT + plus;
  }

  // 現在のタップ上限を取得
  function getMaxCount() {
    return getBaseCount()*6;
  }

  // 外部（work.jsなど）から色を変えられるようにする関数
  window.updateTubuColors = function(projectKey) {
    const key = PROJECT_RECIPES[projectKey] ? projectKey : 'all';
    currentRecipeKey = key;
    const recipe = PROJECT_RECIPES[key];
    
    floaters.forEach((data, i) => {
      const newImgName = recipe[i % recipe.length];
      data.imgName = newImgName;
      const imgEl = data.el.querySelector('img');
      if (imgEl) {
        imgEl.src = `images/tubu/${newImgName}`;
      }
    });

    //play withアイコンをゼミごとに切り替え
    const iconName = ['A','B','C','D','F','M','Y'].includes(key)
        ? `icon_playwith_${key}.webp`
        : `icon_playwith.webp`; // allやその他はデフォルト
      document.querySelectorAll('.gimmick-icon').forEach(icon => {
        icon.src = `images/tubu/${iconName}`;
      });

  };

  window.syncTubuCount = function() {
  const baseCount = getBaseCount();
  const width = window.innerWidth;
  const height = window.innerHeight;
  const recipe = PROJECT_RECIPES[currentRecipeKey];
  
  while (floaters.length < baseCount) {
    const imgName = recipe[floaters.length % recipe.length];
    const x = randomBetween(IMG_SIZE * 2, Math.max(IMG_SIZE * 2, width - IMG_SIZE * 3));
    const y = randomBetween(IMG_SIZE * 2, Math.max(IMG_SIZE * 2, height - IMG_SIZE * 3));
    createFloater(imgName, x, y, false);
  }
};




  /** @type {{el:HTMLDivElement,imgName:string,x:number,y:number,vx:number,vy:number,rot:number,shimmerTimer:number|null}[]} */
  const floaters = [];

  // 漂うテキスト要素
  const floatingTexts = [];

  function createFloatingText(text, id, startX, startY) {
    const width = window.innerWidth;
    const height = window.innerHeight;
  
    const el = document.createElement("div");
    el.className = "tubu-floating-text";
    el.id = id;
    el.textContent = text;
  
    const x = startX ?? randomBetween(IMG_SIZE * 3, width - 200);
    const y = startY ?? randomBetween(IMG_SIZE * 3, height - 50);
    const rot = randomBetween(-10, 10); //テキスト生成時の傾き範囲
    const speed = randomBetween(0.045, 0.12);
    const angle = randomBetween(0, Math.PI * 2);

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = `translateX(-50%) rotate(${rot}deg)`;

    const data = {
      el,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot,
    };

    stage.appendChild(el);
    floatingTexts.push(data);
    return data;
  }


  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function isMenuOpen() {
    return sideBar.classList.contains("is-open");
  }

  //漂うテキストを追加
  function syncInteractivity() {
  if (isMenuOpen()) {
    stage.classList.add("menu-open");
    // テキストを生成（まだない場合のみ）
    if (floatingTexts.length === 0) {
      //漂うテキストの初期位置を設定
      const cx = window.innerWidth / 2;
      const topY = window.innerHeight * 0.65;
      const lineH = window.innerHeight * 0.018; // line-height 1.8 × font-size 12px相当
      
      createFloatingText("（つぶつぶをさわってみてください。）", "floating-hint", cx, topY);
      createFloatingText(`つぶつぶの数　${floaters.length} / ${getMaxCount()}`, "floating-count", cx, topY + lineH * 1.8);
      createFloatingText("リセット", "floating-reset", cx, topY + lineH * 1.8 * 2);
      
      const resetEl = document.getElementById('floating-reset');
      if (resetEl) {
      resetEl.addEventListener('click', () => {
      //メニューで増やした分を消す
      const baseCount = getBaseCount();
      while (floaters.length > baseCount) {
        const removed = floaters.pop();
        removed.el.remove();
      }
      // リセット時にカウント表示を更新
      const countEl = document.getElementById('floating-count');
      if (countEl) {
        countEl.textContent = `つぶつぶの数　${floaters.length} / ${getMaxCount()}`;
      }
      });
    }

    }
  } else {
    stage.classList.remove("menu-open");
    // テキストを削除
    floatingTexts.forEach(d => d.el.remove());
    floatingTexts.length = 0;
  }
}


  function scheduleShimmer(data) {
    const delay = randomBetween(2000, 10000);
    data.shimmerTimer = window.setTimeout(() => {
      if (!data.el.isConnected) return;
      if (data.el.classList.contains("spawning")) {
        scheduleShimmer(data);
        return;
      }

      const durationSec = randomBetween(0.7, 1.6);
      data.el.style.setProperty("--shimmer-dur", `${durationSec}s`);
      data.el.classList.remove("shimmering");
      void data.el.offsetWidth;
      data.el.classList.add("shimmering");
      data.el.addEventListener(
        "animationend",
        () => {
          data.el.classList.remove("shimmering");
          scheduleShimmer(data);
        },
        { once: true }
      );
    }, delay);
  }

  function createFloater(imgName, startX, startY, isSpawned, burstX, burstY) {
    const el = document.createElement("div");
    el.className = "tubu-floater";

    const rot = randomBetween(-180, 180);
    el.style.setProperty("--rot", `${rot}deg`);

    const img = document.createElement("img");
    img.src = `images/tubu/${imgName}`;
    img.alt = imgName;
    el.appendChild(img);

    const speed = randomBetween(0.06, 0.16);
    const angle = randomBetween(0, Math.PI * 2);

    const data = {
      el,
      imgName,
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot,
      shimmerTimer: null,
    };

    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;

    if (isSpawned && typeof burstX === "number" && typeof burstY === "number") {
      el.style.setProperty("--bx", `${burstX}px`);
      el.style.setProperty("--by", `${burstY}px`);
      el.classList.add("spawning");
      el.addEventListener(
        "animationend",
        () => {
          el.classList.remove("spawning");
          data.x = clamp(startX + burstX, 0, window.innerWidth - IMG_SIZE);
          data.y = clamp(startY + burstY, 0, window.innerHeight - IMG_SIZE);
          el.style.left = `${data.x}px`;
          el.style.top = `${data.y}px`;
          el.style.transform = `rotate(${rot}deg)`;
        },
        { once: true }
      );
    }

    stage.appendChild(el);
    floaters.push(data);
    scheduleShimmer(data);
    return data;
  }

  //個別ページを閲覧するたびに初期数を1つずつ最大5まで増やすギミックのため、書き換えた
  function onFloaterClick(data) {
    const maxCount = getMaxCount();
    if (floaters.length >= maxCount) return;

    const spawnCount = Math.min(2, maxCount - floaters.length);
    for (let i = 0; i < spawnCount; i += 1) {
      const angle = randomBetween(0, Math.PI * 2);
      const dist = randomBetween(30, 82);
      const bx = Math.cos(angle) * dist;
      const by = Math.sin(angle) * dist;
      createFloater(data.imgName, data.x, data.y, true, bx, by);
    }

    //漂うテキストのカウント表示を更新
    const countEl = document.getElementById('floating-count');
    if (countEl) {
      countEl.textContent = `つぶつぶの数　${floaters.length} / ${getMaxCount()}`;
    }
  }


function tick() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  for (const d of floaters) {
    if (d.el.classList.contains("spawning")) continue;

    d.x += d.vx;
    d.y += d.vy;

    //画面内に入ったらenteringフラグを解除
    if (d.entering) {
      if (d.x > 0 && d.x < width - IMG_SIZE && d.y > 0 && d.y < height - IMG_SIZE) {
        const currentSpeed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
        const targetSpeed = d.targetSpeed || (d.targetSpeed = randomBetween(0.06, 0.16));
  
        if (currentSpeed > targetSpeed) {
          const factor = Math.max(targetSpeed, currentSpeed - 0.003) / currentSpeed;
          d.vx *= factor;
          d.vy *= factor;
        } else {
          d.entering = false;
        }
      }
      d.el.style.left = `${d.x}px`;
      d.el.style.top = `${d.y}px`;
      continue; // 壁判定をスキップ
    }

    //ウィンドウ内での反射
    //if (d.x <= 0) { d.x = 0; d.vx = Math.abs(d.vx); }
    //if (d.x >= width - IMG_SIZE) { d.x = width - IMG_SIZE; d.vx = -Math.abs(d.vx); }
    //if (d.y <= 0) { d.y = 0; d.vy = Math.abs(d.vy); }
    //if (d.y >= height - IMG_SIZE) { d.y = height - IMG_SIZE; d.vy = -Math.abs(d.vy); }

    //ウィンドウ内反射+メニュー開時は漂う範囲を罫線内に限定
    //→上記より、スマホ(600px未満)では罫線なしの設定に試し中(それ以上では罫線あり)
    //const margin = isMenuOpen() && window.innerWidth >= 600 ? 40 : 0;
    //if (d.x <= margin) { d.x = margin; d.vx = Math.abs(d.vx); }
    //if (d.x >= width - IMG_SIZE - margin) { d.x = width - IMG_SIZE - margin; d.vx = -Math.abs(d.vx); }
    //if (d.y <= margin) { d.y = margin; d.vy = Math.abs(d.vy); }
    //if (d.y >= height - IMG_SIZE - margin) { d.y = height - IMG_SIZE - margin; d.vy = -Math.abs(d.vy); }
    //以前の壁判定　今は下のものを使用


    //枠外にあるものはそのままに(吸い寄せたりしない)、内側に入ってきたら外に出さない
    const margin = isMenuOpen() && window.innerWidth >= 600 ? 40 : 0;
    if (margin > 0) {
      // 一度枠内に入ったかチェック
      if (!d.insideBox) {
        if (d.x > margin && d.x < width - IMG_SIZE - margin &&
            d.y > margin && d.y < height - IMG_SIZE - margin) {
          d.insideBox = true;
        }
        //二重罫線とウィンドウ端の間にあるつぶがそのままウィンドウ外に消えないようにする
        if (d.x <= 0) { d.x = 0; d.vx = Math.abs(d.vx); }
        if (d.x >= width - IMG_SIZE) { d.x = width - IMG_SIZE; d.vx = -Math.abs(d.vx); }
        if (d.y <= 0) { d.y = 0; d.vy = Math.abs(d.vy); }
        if (d.y >= height - IMG_SIZE) { d.y = height - IMG_SIZE; d.vy = -Math.abs(d.vy); }
      }
      // 枠内に入ったことがある粒だけ壁判定
      if (d.insideBox) {
        if (d.x <= margin) { d.x = margin; d.vx = Math.abs(d.vx); }
        if (d.x >= width - IMG_SIZE - margin) { d.x = width - IMG_SIZE - margin; d.vx = -Math.abs(d.vx); }
        if (d.y <= margin) { d.y = margin; d.vy = Math.abs(d.vy); }
        if (d.y >= height - IMG_SIZE - margin) { d.y = height - IMG_SIZE - margin; d.vy = -Math.abs(d.vy); }
      }
    } else {
      // メニュー閉じたらフラグをリセット
      d.insideBox = false;
      if (d.x <= 0) { d.x = 0; d.vx = Math.abs(d.vx); }
      if (d.x >= width - IMG_SIZE) { d.x = width - IMG_SIZE; d.vx = -Math.abs(d.vx); }
      if (d.y <= 0) { d.y = 0; d.vy = Math.abs(d.vy); }
      if (d.y >= height - IMG_SIZE) { d.y = height - IMG_SIZE; d.vy = -Math.abs(d.vy); }
    }


    d.el.style.left = `${d.x}px`;
    d.el.style.top = `${d.y}px`;
  }

  // 漂うテキストの動き
    for (const d of floatingTexts) {
      d.x += d.vx;
      d.y += d.vy;

      const textWidth = d.el.offsetWidth;
      const textHeight = d.el.offsetHeight;
      
      //スマホ(600px未満)では罫線なしの設定に試し中(それ以上では罫線あり)
      const textMargin = isMenuOpen() && window.innerWidth >= 600 ? 40 : 0; // ←marginからtextMarginに変更
      //中央揃えでずらしている分を調整する
      const halfW = textWidth / 2;

      if (d.x - halfW <= textMargin) { d.x = textMargin + halfW; d.vx = Math.abs(d.vx); }
      if (d.x + halfW >= width - textMargin) { d.x = width - textMargin - halfW; d.vx = -Math.abs(d.vx); }
      if (d.y <= textMargin) { d.y = textMargin; d.vy = Math.abs(d.vy); }
      if (d.y >= height - textHeight - textMargin) { d.y = height - textHeight - textMargin; d.vy = -Math.abs(d.vy); }

      d.el.style.left = `${d.x}px`;
      d.el.style.top = `${d.y}px`;
    }

    requestAnimationFrame(tick);
  }


  function handleDocumentPointerDown(event) {
    if (!isMenuOpen()) return;

    const target = event.target;
    // メニュー内の「操作対象」（リンク等）は優先して、つぶつぶは増殖しない
    if (
      target &&
      (target.closest("a") ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("#menu-icon-toggle"))
    ) {
      return;
    }

    const clientX = event.clientX;
    const clientY = event.clientY;
    if (typeof clientX !== "number" || typeof clientY !== "number") return;

    // クリック位置がどの粒に重なっているか（座標判定）を当てに行く
    // （pointer-events:none にしているため、要素の click イベントは飛んでこない）
    for (let i = floaters.length - 1; i >= 0; i -= 1) {
      const d = floaters[i];
      const rect = d.el.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        // 粒をクリックした意図として扱い、メニュー操作を奪わない範囲で伝播を止める
        event.stopPropagation();
        event.preventDefault();
        onFloaterClick(d);
        break;
      }
    }
  }

//  function createInitialFloaters() {
//    const width = window.innerWidth;
//    const height = window.innerHeight;

//    const params = new URLSearchParams(window.location.search);
//    const filter = params.get('filter');
//    const recipeKey = PROJECT_RECIPES[filter] ? filter : 'all';
//    const recipe = PROJECT_RECIPES[recipeKey];

//    for (let i = 0; i < INITIAL_COUNT; i += 1) {
//      const imgName = recipe[i % recipe.length]; // IMAGE_NAMESではなくレシピから選ぶ
//      const x = randomBetween(IMG_SIZE * 2, Math.max(IMG_SIZE * 2, width - IMG_SIZE * 3));
//      const y = randomBetween(IMG_SIZE * 2, Math.max(IMG_SIZE * 2, height - IMG_SIZE * 3));
//      createFloater(imgName, x, y, false);
//    }
//  }
//個別ページを閲覧するたびに初期数を1つずつ最大5まで増やすギミックを試す用
// + ウェブに入った時、画面外からつぶが入ってくる
function createInitialFloaters(isFirstVisit) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const baseCount = getBaseCount();

  const params = new URLSearchParams(window.location.search);
  const filter = params.get('filter');
  const recipeKey = PROJECT_RECIPES[filter] ? filter : 'all';
  const recipe = PROJECT_RECIPES[recipeKey];

  for (let i = 0; i < baseCount; i += 1) {
    const imgName = recipe[i % recipe.length];

    
    if (isFirstVisit) {
      // 通常の漂う速度
      const speed = randomBetween(0.25, 0.25);
      const angle = randomBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // 画面外からその方向の逆向きにスタート地点を決める
      // 画面端から20px以内に入るまでの距離分だけ外に出す
      const targetX = randomBetween(IMG_SIZE * 2, width - IMG_SIZE * 3);
      const targetY = randomBetween(IMG_SIZE * 2, height - IMG_SIZE * 3);

      // 画面端20px以内の地点からさらに外に向かってスタート
      const side = Math.floor(Math.random() * 4);
      let startX, startY;

      if (side === 0) { // 上から
        startX = randomBetween(0, width);
        startY = -IMG_SIZE;
      } else if (side === 1) { // 右から
        startX = width + IMG_SIZE;
        startY = randomBetween(0, height);
      } else if (side === 2) { // 下から
        startX = randomBetween(0, width);
        startY = height + IMG_SIZE;
      } else { // 左から
        startX = -IMG_SIZE;
        startY = randomBetween(0, height);
      }

      // 入ってくる方向ベクトルを計算
      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const enterVx = (dx / dist) * speed;
      const enterVy = (dy / dist) * speed;

      const data = createFloater(imgName, startX, startY, false);
      data.vx = enterVx;
      data.vy = enterVy;
      data.entering = true;

    } else {
      const x = randomBetween(IMG_SIZE * 2, Math.max(IMG_SIZE * 2, width - IMG_SIZE * 3));
      const y = randomBetween(IMG_SIZE * 2, Math.max(IMG_SIZE * 2, height - IMG_SIZE * 3));
      createFloater(imgName, x, y, false);
    }
  }
}




  function watchMenuState() {
    const observer = new MutationObserver(syncInteractivity);
    observer.observe(sideBar, { attributes: true, attributeFilter: ["class"] });
    syncInteractivity();
  }

  // 追加：戻るボタンへの対応
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter');
    if (window.updateTubuColors) window.updateTubuColors(filter || 'all');
  });

  function init() {

  // アイコン画像のプリロード
  const preloadKeys = ['A','B','C','D','F','M','Y'];
  preloadKeys.forEach(key => {
    const img = new Image();
    img.src = `images/tubu/icon_playwith_${key}.webp`;
  });

  const isFirstVisit = !sessionStorage.getItem('hasVisited');
  sessionStorage.setItem('hasVisited', '1'); // すぐにセット
  createInitialFloaters(isFirstVisit);
  watchMenuState();
  document.addEventListener("pointerdown", handleDocumentPointerDown, {
      passive: false, //元々trueだがメニュー画面でつぶタップすると警告が出るので、falseに変更中
    });
    requestAnimationFrame(tick);
  }

  init();
})();




