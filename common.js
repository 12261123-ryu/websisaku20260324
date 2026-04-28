const sideBar = document.getElementById('side-bar');
const fixedLabels = document.querySelector('.fixed-labels');
const menuIconContainer = document.getElementById('menu-icon-toggle');
const menuIcon = menuIconContainer.querySelector('span');
const topLink = document.querySelector('.link-to-Top');



if (topLink) {
  topLink.addEventListener('click', (e) => {
    e.stopPropagation(); 
    sessionStorage.removeItem('lastFilter');
    sessionStorage.removeItem('scrollY');
  });
}

// web図録トップリンクのスクロールリセット（メニュー内）
const menuTopLink = document.querySelector('.linktoTop');
if (menuTopLink) {
  menuTopLink.addEventListener('click', () => {
    sessionStorage.removeItem('lastFilter');
    sessionStorage.removeItem('scrollY');
    // bodyスクロールなのでwindow.scrollToでトップへ
    window.scrollTo(0, 0);
  });
}





//スマホビューでは開く時、web図録とアイコンのみ反応しているが、横幅600px以上の時は卒展26の部分以外のバー部分に開く判定を持たせてみた
//閉じる時は、どのサイズでも、卒展26以外の、元々サイドバーだった部分を触れば閉じる

fixedLabels.addEventListener('click', (e) => {
  // 1. 一番下の「卒展26」エリア（.bar-low）を触った時は開閉処理をスルー
  if (e.target.closest('.bar-low')) return;

  const isOpen = sideBar.classList.contains('is-open');
  const isDesktop = window.innerWidth >= 600;

  if (!isOpen) {
    // 閉じてる時：メニューを開く判定
    if (isDesktop) {
      // 600px以上：.bar-low以外ならバーのどこを押しても開く
      sideBar.classList.add('is-open');
      menuIcon.textContent = '×';
      document.body.classList.add('menu-open');

      const overlay = document.createElement('div');
      overlay.id = 'menu-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:699;';
      document.body.appendChild(overlay);
    } else {
      // スマホ：アイコンか 真ん中の文字(.bar-mid) を直接押した時だけ開く
      if (e.target.closest('#menu-icon-toggle') || e.target.closest('.bar-mid')) {
        sideBar.classList.add('is-open');
        menuIcon.textContent = '×';
        document.body.classList.add('menu-open');
      
        const overlay = document.createElement('div');
        overlay.id = 'menu-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:699;';
        document.body.appendChild(overlay);
      }
    }
  } else {
    // 【開いてる時：メニューを閉じる判定】
    // スマホもデスクトップも共通：.bar-low以外のバーの部分ならどこでも閉じる
    sideBar.classList.remove('is-open');
    menuIcon.textContent = '≡';
    document.body.classList.remove('menu-open');
    sideBar.style.display = ''; // インラインstyleをリセット→CSSのdisplay:noneに戻る

    const overlay = document.getElementById('menu-overlay');
    if (overlay) overlay.remove();
  }
});



//gimmick-btnでサイドバーを開く(play withモード)
//一番上のfixedLabels.addEventListenerの中に、ボタンを閉じた時の挙動も追記している
const gimmickBtn = document.getElementById('gimmick-btn');
if (gimmickBtn) {
  gimmickBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sideBar.classList.add('is-open');
    menuIcon.textContent = '×';
    document.body.classList.add('menu-open');
    // 1180px以上ではCSSでside-barがdisplay:noneのため、インラインstyleで強制表示（インラインスタイルはCSSより優先される）
    sideBar.style.display = 'flex';
    const overlay = document.createElement('div');
    overlay.id = 'menu-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:699;';
    document.body.appendChild(overlay);
  });
}
// メニューを開いている時にウィンドウサイズが変わっても表示を維持
window.addEventListener('resize', () => {
  if (sideBar.classList.contains('is-open')) {
    sideBar.style.display = 'flex';
  }
});

// タッチイベントを有効化する
//一覧などの作品ブロックをタップ時に、ホバーのように一瞬画像は青く文字はマゼンタにする試し
document.addEventListener("touchstart", function() {}, {passive: true});






// サイドバー全体ではなく、ラベル部分だけをクリック対象にする
//fixedLabels.addEventListener('click', (e) => {
  //クリックされたのが「トップへのリンク」だったら、ここで処理を終了する
  //if (e.target.closest('.link-to-Top')) return;
  // closestで中のspan,divのどちらを触っても反応させる

  //const isOpen = sideBar.classList.contains('is-open');

  //if (!isOpen) {
    // 閉じてる時はラベルのどこを押しても開く
    //sideBar.classList.add('is-open');
    //menuIcon.textContent = '×';
  //} else {
    // 開いてる時（is-openがある時）は、アイコンまたはweb図録の文字へのクリックのみ反応
    //if (e.target.closest('#menu-icon-toggle') || e.target.closest('.bar-mid')) {
      //sideBar.classList.remove('is-open');
      //menuIcon.textContent = '≡';
    //}
  //}
//});

