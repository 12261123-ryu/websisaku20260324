async function loadCredit() {
  try {
    const response = await fetch('credit.json');
    const data = await response.json();
    const container = document.getElementById('credit');
    if (!container) return;

    data.forEach(genreItem => {
      const genreBlock = document.createElement('section');
      genreBlock.className = 'genre-block';

      //web図録ブロックと当日ページブロックの上に2重罫線
      if (genreItem.genre === 'web図録' || genreItem.genre === '当日ページ') {
      genreBlock.classList.add('genre-block-double-border'); 
      }

      const genreName = document.createElement('div');
      genreName.className = 'genre-name';
      genreName.textContent = genreItem.genre;
      genreBlock.appendChild(genreName);

      genreItem.groups.forEach(groupItem => {
        const groupBlock = document.createElement('div');
        groupBlock.className = 'group-block';

        const groupName = document.createElement('div');
        groupName.className = 'group-name';
        groupName.textContent = groupItem.group || '';
        groupBlock.appendChild(groupName);

        const groupContent = document.createElement('div');
        groupContent.className = 'group-content';

        groupItem.staffs.forEach(staffItem => {
          const staffRow = document.createElement('div');
          staffRow.className = 'staff-row';

          const staffName = document.createElement('div');
          staffName.className = 'staff-name';
          staffName.textContent = staffItem.staff || '';
          staffRow.appendChild(staffName);

          const namesBlock = document.createElement('div');
          namesBlock.className = 'names';
          staffItem.names.forEach(name => {
            const nameDiv = document.createElement('div');
            nameDiv.textContent = name;
            namesBlock.appendChild(nameDiv);
          });
          staffRow.appendChild(namesBlock);
          groupContent.appendChild(staffRow);
        });

        groupBlock.appendChild(groupContent);
        genreBlock.appendChild(groupBlock);
      });

      container.appendChild(genreBlock);
    });

  } catch (error) {
    console.error('credit.json の読み込みに失敗しました:', error);
  }
}

window.onload = loadCredit;