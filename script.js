const waNumber = "919993636912";

const config = {
    e: { 
        title: "Prewedding", folder: 'e', prefix: 'e', ext: 'webp', 
        totalIntegers: 74, 
        decimals: [8.1, 8.2, 23.1, 23.2, 23.3, 23.4, 23.5, 57.1, 57.2, 57.3] 
    },
    d: { title: "Maternity", folder: 'd', prefix: '', ext: 'webp', total: 33 }, // Updated count and cleared prefix
    a: { title: "Cocktail", folder: 'a', prefix: 'a', ext: 'jpg', total: 49 },
    b: { title: "Saree", folder: 'b', prefix: 'b', ext: 'jpg', total: 11 },
    c: { title: "Mascots", folder: 'c', prefix: 'c', ext: 'webp', total: 60 },
    g: { title: "Convocation", folder: 'g', prefix: 'g', ext: 'webp', total: 42 },
    f: { title: "Fancy Dress", folder: 'f', prefix: 'f', ext: 'webp', total: 988 }
};

const root = document.getElementById('gallery-root');
const navList = document.getElementById('nav-list');
const zoomOverlay = document.getElementById('zoom-overlay');
const zoomTrack = document.getElementById('zoom-track');
const closeBtn = document.getElementById('close-zoom-btn');

let lastTap = 0, pointX = 0, startX = 0, isDragging = false;

function openZoom(currentNum, categoryKey) {
    const cat = config[categoryKey];
    zoomTrack.innerHTML = '';
    
    let allFiles = [];
    if (cat.decimals) {
        for (let i = 1; i <= cat.totalIntegers; i++) allFiles.push(i);
        allFiles = [...allFiles, ...cat.decimals].sort((a, b) => a - b);
    } else {
        for (let i = 1; i <= cat.total; i++) allFiles.push(i);
    }

    const idx = allFiles.indexOf(currentNum);
    const prev = allFiles[idx - 1];
    const next = allFiles[idx + 1];

    const leftBox = document.createElement('div');
    leftBox.className = 'zoom-photo-box';
    if (prev !== undefined) leftBox.innerHTML = `<img src="${cat.folder}/${cat.prefix}${prev}.${cat.ext}" class="zoom-neighbor-photo">`;
    zoomTrack.appendChild(leftBox);

    const centerBox = document.createElement('div');
    centerBox.className = 'zoom-photo-box';
    centerBox.innerHTML = `<img src="${cat.folder}/${cat.prefix}${currentNum}.${cat.ext}" class="zoom-main-photo">`;
    zoomTrack.appendChild(centerBox);

    const rightBox = document.createElement('div');
    rightBox.className = 'zoom-photo-box';
    if (next !== undefined) rightBox.innerHTML = `<img src="${cat.folder}/${cat.prefix}${next}.${cat.ext}" class="zoom-neighbor-photo">`;
    zoomTrack.appendChild(rightBox);

    pointX = -window.innerWidth;
    zoomTrack.style.transition = 'none';
    updateTransform();
    zoomOverlay.style.display = 'block';
    document.body.classList.add('lock-scroll');
}

function updateTransform() { zoomTrack.style.transform = `translateX(${pointX}px)`; }
function closeZoom() { zoomOverlay.style.display = 'none'; document.body.classList.remove('lock-scroll'); }

closeBtn.addEventListener('click', closeZoom);

zoomOverlay.addEventListener('pointerdown', e => {
    if(e.target === closeBtn) return;
    isDragging = true;
    startX = e.clientX - pointX;
    zoomTrack.style.transition = 'none';
    zoomOverlay.setPointerCapture(e.pointerId);
});

zoomOverlay.addEventListener('pointermove', e => {
    if (!isDragging) return;
    pointX = e.clientX - startX;
    updateTransform();
});

zoomOverlay.addEventListener('pointerup', e => {
    isDragging = false;
    const itemWidth = window.innerWidth;
    zoomTrack.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
    const targetIdx = Math.round(Math.abs(pointX) / itemWidth);
    pointX = -(Math.min(Math.max(0, targetIdx), 2) * itemWidth);
    updateTransform();
});

function createCard(folder, prefix, num, key, ext) {
    const url = `${folder}/${prefix}${num}.${ext}`;
    const container = document.createElement('div');
    container.className = 'photo-cover';
    container.onclick = () => {
        const now = Date.now();
        if (now - lastTap < 300) openZoom(num, key);
        else {
            document.querySelectorAll('.photo-cover').forEach(el => el.classList.remove('is-clicked'));
            container.classList.add('is-clicked');
        }
        lastTap = now;
    };
    const frame = document.createElement('div');
    frame.className = 'cover-frame';
    const img = document.createElement('img');
    img.src = url; img.loading = "lazy";
    const btn = document.createElement('button');
    btn.className = 'wa-order-btn';
    btn.innerText = "INQUIRE NOW";
    btn.onclick = (e) => { e.stopPropagation(); window.open(`https://wa.me/${waNumber}?text=Inquiry for image: ${url}`, '_blank'); };
    frame.appendChild(img);
    container.appendChild(frame);
    container.appendChild(btn);
    return container;
}

Object.keys(config).forEach(key => {
    const cat = config[key];
    const li = document.createElement('li');
    li.innerHTML = `<a href="#section-${key}">${cat.title}</a>`;
    navList.appendChild(li);

    const section = document.createElement('section');
    section.className = 'section-wrap';
    section.id = `section-${key}`;
    section.innerHTML = `
        <h2 class="section-title">${cat.title}</h2>
        <div class="nav-arrow arrow-left" onclick="scrollGallery('${key}', -1)">&#10094;</div>
        <div class="nav-arrow arrow-right" onclick="scrollGallery('${key}', 1)">&#10095;</div>
        <div class="slider-viewport" id="pane-${key}"></div>
    `;
    root.appendChild(section);
    const pane = document.getElementById(`pane-${key}`);

    let fileList = [];
    if (cat.decimals) {
        for (let i = 1; i <= cat.totalIntegers; i++) fileList.push(i);
        fileList = [...fileList, ...cat.decimals].sort((a, b) => a - b);
    } else {
        for (let i = 1; i <= cat.total; i++) fileList.push(i);
    }

    fileList.forEach(num => pane.appendChild(createCard(cat.folder, cat.prefix, num, key, cat.ext)));
});

function scrollGallery(id, direction) {
    document.getElementById(`pane-${id}`).scrollBy({ left: direction * 500, behavior: 'smooth' });
}