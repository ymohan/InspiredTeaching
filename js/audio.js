document.addEventListener('DOMContentLoaded', () => {

    // 1. DATA
    const storiesData = [
        { id: 1, tamil: 'பிரியா வரைந்த சிங்கம்', eng: 'Priya varaindha singam' },
        { id: 2, tamil: 'சிங்கம் உலுக்கிய தென்னை மரம்', eng: 'Singam ulukiya thennai maram' },
        { id: 3, tamil: 'சட்னி ஆன தக்காளி', eng: 'Chatni aana thakkali' },
        { id: 4, tamil: 'குண்டான புழு', eng: 'Kundaana puzhu' },
        { id: 5, tamil: 'என் நண்பன்', eng: 'En Nanban' },
        { id: 6, tamil: 'சிவப்பு நிறம்', eng: 'Sivappu niram' },
        { id: 7, tamil: 'பழகிய வாசம்', eng: 'Pazhagiya vaasam' },
        { id: 8, tamil: 'அம்மாவின் அன்பு', eng: 'Ammavin anbum' },
        { id: 9, tamil: 'சரியான தீர்ப்பு', eng: 'Sariyaana theerpu' },
        { id: 10, tamil: 'கோள்மூட்டி', eng: 'Koalmootti' },
        { id: 11, tamil: 'புலிவாலைப் பிடித்தவன்', eng: 'Puli vaalai pidithavan' },
        { id: 12, tamil: 'உப்பு, புளி, காரம்', eng: 'Uppu, puli, kaaram' },
        { id: 13, tamil: 'ஏமாளி முருகன்', eng: 'Yeamaali murugan' },
        { id: 14, tamil: 'உனக்கு என்ன?', eng: 'Unakku yenna' },
        { id: 15, tamil: 'மழை வருமா?', eng: 'Mazhai varuma?' },
        { id: 16, tamil: 'ஒரே ஒரு கேள்வி', eng: 'Ore oru kealvi' },
        { id: 17, tamil: 'ஒற்றுமைக்கு வழி', eng: 'Ottrumaiku vazhi' },
        { id: 18, tamil: 'மூன்று வரங்கள்', eng: 'Moondru varangal' },
        { id: 19, tamil: 'யார் சொல்வதைக் கேட்பது', eng: 'Yaar sollvadhai keatpadhu' },
        { id: 20, tamil: 'ஏமாந்த கழுகு', eng: 'Yeamandha kazhugu' },
        { id: 21, tamil: 'கொக்கும் குரங்குகளும்', eng: 'Kokkum kurangugalum' }
    ];

    const songsData = [
        { id: 1, tamil: 'கைவீசு', eng: 'Kaiveesu' },
        { id: 2, tamil: 'குள்ள குள்ள வாத்து', eng: 'Kulla Kulla Vaathu' },
        { id: 3, tamil: 'பம்பரம்', eng: 'Bommaram' }
    ];

    // 2. HELPER: Get Duration
    function fetchDuration(audioUrl, elementId) {
        const audio = new Audio(audioUrl);
        audio.addEventListener('loadedmetadata', () => {
            const m = Math.floor(audio.duration / 60);
            const s = Math.floor(audio.duration % 60);
            const el = document.getElementById(elementId);
            if(el) el.innerHTML = `<i class="fa fa-clock-o"></i> ${m}:${s < 10 ? '0' : ''}${s}`;
        });
    }

    // 3. RENDER FUNCTION
    function renderCards(dataArray, containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        const category = type === 'stories' ? 'Story Telling' : 'Kids Songs';

        dataArray.forEach((item, index) => {
            const img = `images/${type}/${item.id}.webp`;
            const audio = `audio/${type}/${item.id}.mp3`;
            const timeId = `time-${type}-${item.id}`;
            
            // Note: We do NOT hide cards here intentionally. 
            // We let the main script (ins1.html) handle the "Show First 8" logic
            // to avoid conflict. We just add the classes.

            html += `
            <article class="story-card card-fade" data-search="${item.tamil} ${item.eng}">
                <div class="story-card-image-wrapper">
                    <img src="${img}" alt="${item.eng}" loading="lazy">
                    <a href="javascript:;" class="story-play-btn track-list" 
                       data-track="${audio}" data-poster="${img}" data-title="${item.eng}">
                        <i class="fa fa-play"></i>
                    </a>
                </div>
                <div class="story-card-content">
                    <span class="story-tag">${category}</span>
                    <h3 class="story-title">${item.eng}</h3>
                    <div class="story-meta">
                        <span id="${timeId}"><i class="fa fa-spinner fa-spin"></i> ...</span>
                        <span class="meta-lang"><i class="fa fa-language"></i> ${item.tamil}</span>
                    </div>
                </div>
            </article>`;
            
            // Fetch time asynchronously
            fetchDuration(audio, timeId);
        });

        container.innerHTML = html;
    }

    // 4. INITIALIZE
    renderCards(storiesData, 'stories-container', 'stories');
    renderCards(songsData, 'songs-container', 'songs');
    
    // Dispatch event so main script knows content is ready
    window.dispatchEvent(new Event('audioCardsRendered'));
});