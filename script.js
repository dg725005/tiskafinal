const waNumber = "919993636912";

// CONFIGURATION PANEL: Dynamic content indexing profiles mapping data/ paths directly
const categoryMeta = {
    cocktail: { title: "Cocktail", folder: 'data/cocktail/webp', prefix: 'cocktail', count: 10 },
    convocation: { title: "Convocation", folder: 'data/convocation/webp', prefix: 'convocation', count: 4 },
    fancy_dress: { title: "Fancy Dress", folder: 'data/fancydress/webp', prefix: 'fancydress', count: 409 },
    mascots: { title: "Mascots", folder: 'data/mascots/webp', prefix: 'mascot', count: 60 },
    maternity: { title: "Maternity", folder: 'data/maternity/webp', prefix: 'maternity', count: 44 },
    prewedding: { title: "Prewedding", folder: 'data/prewedding/webp', prefix: 'prewedding', count: 23 },
    saree: { title: "Saree", folder: 'data/saree/webp', prefix: 'saree', count: 10 }
};

// Global application rendering lifecycles context store
let galleryData = {};

const root = document.getElementById('gallery-root');
const navList = document.getElementById('nav-list');
const zoomOverlay = document.getElementById('zoom-overlay');
const zoomTrack = document.getElementById('zoom-track');
const closeBtn = document.getElementById('close-zoom-btn');

let pointX = 0, startX = 0, isDragging = false;

// PERFORMANCE METRIC CONSTANT: How many images to append per batch on mobile
const BATCH_SIZE = 12;

// SAFE NUMERIC SORT ENGINE
function sortFilesNumerically(filesArray) {
    return filesArray.sort((fileA, fileB) => {
        const matchA = fileA.match(/\d+/);
        const matchB = fileB.match(/\d+/);
        const numA = matchA ? parseInt(matchA[0], 10) : 0;
        const numB = matchB ? parseInt(matchB[0], 10) : 0;
        return numA - numB;
    });
}

// FULL VIEWPORT ZOOM SWIPING AND GESTURES PIPELINE
function openZoom(fileName, categoryKey) {
    zoomTrack.innerHTML = '';
    
    const fileList = galleryData[categoryKey]; 
    if (!fileList || fileList.length === 0) return;

    const idx = fileList.indexOf(fileName);
    const prev = fileList[idx - 1];
    const next = fileList[idx + 1];
    const frames = [prev, fileName, next];
    const folderPath = categoryMeta[categoryKey].folder;

    frames.forEach((file, i) => {
        const box = document.createElement('div');
        box.className = 'zoom-photo-box';
        if (file) {
            const imgClass = (i === 1) ? 'zoom-main-photo' : 'zoom-neighbor-photo';
            box.innerHTML = `<img src="${folderPath}/${file}" class="${imgClass}" alt="Lookbook Zoom View Showcase Item">`;
        }
        zoomTrack.appendChild(box);
    });

    pointX = -window.innerWidth; 
    zoomTrack.style.transition = 'none';
    updateTransform();
    
    zoomOverlay.style.display = 'block';
    document.body.classList.add('lock-scroll');
}

function updateTransform() { zoomTrack.style.transform = `translateX(${pointX}px)`; }
function closeZoom() { 
    zoomOverlay.style.display = 'none'; 
    document.body.classList.remove('lock-scroll'); 
}

// WIRE TOUCH/POINTER EVENTS FOR ZOOM VIEWER SWIPING
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
    zoomTrack.style.transition = 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)';
    const targetIdx = Math.round(Math.abs(pointX) / itemWidth);
    pointX = -(Math.min(Math.max(0, targetIdx), 2) * itemWidth);
    updateTransform();
});

// SINGLE UI GRID ELEMENT FACTORY
function createGridCard(categoryKey, fileName, folderPath) {
    const url = `${folderPath}/${fileName}`;
    const card = document.createElement('div');
    card.className = 'photo-cover';
    
    card.onclick = () => { openZoom(fileName, categoryKey); };

    const frame = document.createElement('div');
    frame.className = 'cover-frame';
    
    const img = document.createElement('img');
    img.src = url; 
    img.loading = "lazy"; /* Native browser lazy loading optimized */
    img.alt = `${categoryKey} gallery catalog choice`;
    
    img.onerror = () => { card.style.display = 'none'; };
    
    const btn = document.createElement('button');
    btn.className = 'wa-order-btn';
    btn.innerText = "INQUIRE ON WHATSAPP";
    btn.onclick = (e) => { 
        e.stopPropagation(); 
        window.open(`https://wa.me/${waNumber}?text=Hello, I would like to check availability status for this design selection: ${window.location.origin}/${url}`, '_blank'); 
    };

    frame.appendChild(img);
    card.appendChild(frame);
    card.appendChild(btn);
    return card;
}

// BATCH RENDERING MODULE: Appends image nodes in steps to preserve UI responsiveness on mobile devices
function renderNextBatch(categoryKey, targetGrid, nextTriggerBtn) {
    const fileList = galleryData[categoryKey];
    const currentRenderedCount = targetGrid.children.length;
    const nextLimit = Math.min(currentRenderedCount + BATCH_SIZE, fileList.length);
    const folderPath = categoryMeta[categoryKey].folder;

    for (let i = currentRenderedCount; i < nextLimit; i++) {
        const card = createGridCard(categoryKey, fileList[i], folderPath);
        targetGrid.appendChild(card);
    }

    // Hide or update the batch button trigger dynamically based on allocation states
    if (nextLimit >= fileList.length) {
        if (nextTriggerBtn) nextTriggerBtn.style.display = 'none';
    } else {
        if (nextTriggerBtn) nextTriggerBtn.innerText = `LOAD MORE (${fileList.length - nextLimit} REMAINING)`;
    }
}

// CENTRAL SYSTEMS DISPLAY APPLICATION LOOPER RENDER
function initializeGallery() {
    Object.keys(categoryMeta).forEach(key => {
        const meta = categoryMeta[key];
        let structuredFiles = [];

        // Structural loop allocation limits mappings patterns setup tracks
        for (let i = 0; i < meta.count; i++) {
            structuredFiles.push(`${meta.prefix}${i}.webp`);
        }

        galleryData[key] = sortFilesNumerically(structuredFiles);

        // 1. Build Mobile Horizontal Navigation targets
        if (meta.count > 0) {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#section-${key}">${meta.title}</a>`;
            navList.appendChild(li);
        }

        // 2. Build Category Container Section blocks
        const section = document.createElement('section');
        section.className = 'section-wrap';
        section.id = `section-${key}`;
        if (meta.count === 0) section.style.display = 'none';

        section.innerHTML = `
            <h2 class="section-title">${meta.title}</h2>
            <div class="grid-container" id="grid-${key}"></div>
            <div class="batch-control-box" style="width:100%; display:flex; justify-content:center; margin-top:20px;">
                <button id="btn-load-${key}" class="wa-order-btn" style="max-width:280px; background-color:#FFF; color:var(--text-dark); border:1px solid var(--text-dark); display:none;"></button>
            </div>
        `;
        root.appendChild(section);

        // 3. Process Batch Allocations to save system threading layout memory overhead
        if (meta.count > 0) {
            const targetGrid = document.getElementById(`grid-${key}`);
            const loadBtn = document.getElementById(`btn-load-${key}`);

            // Initialize the initial view batch allocation sizing frame
            renderNextBatch(key, targetGrid, loadBtn);

            // If the total images list length exceeds initial bounds, show the Load More handler mechanism
            if (meta.count > BATCH_SIZE) {
                loadBtn.style.display = 'flex';
                loadBtn.onclick = () => renderNextBatch(key, targetGrid, loadBtn);
            }
        }
    });
}

// Run deployment system mount execution pipelines loop runtime initialize execution
initializeGallery();