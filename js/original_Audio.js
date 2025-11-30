document.addEventListener('DOMContentLoaded', () => {

    // --- DATA CONFIGURATION ---
    
    // 1. Stories Data
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

    // 2. Songs Data (Add more here in future)
    const songsData = [
        { id: 1, tamil: 'கைவீசு', eng: 'Kaiveesu' },
        { id: 2, tamil: 'குள்ள குள்ள வாத்து', eng: 'Kulla Kulla Vaathu' },
        { id: 3, tamil: 'பம்பரம்', eng: 'Bommaram' }
    ];

    // --- RENDER FUNCTION ---
    
    // type = 'stories' or 'songs' (matches your folder names)
    function renderCards(dataArray, containerId, type) {
        const container = document.getElementById(containerId);
        const imageBasePath = `images/${type}/`; // e.g., vtt/images/stories/
        const audioBasePath = `audio/${type}/`;      // e.g., audio/stories/

        let html = '';

        dataArray.forEach(item => {
            // Assume image is 1.webp, 2.webp etc.
            // If you use png, change extension below.
            const imgPath = `${imageBasePath}${item.id}.webp`; 
            const audioPath = `${audioBasePath}${item.id}.mp3`;

            html += `
            <div class="popular-song-container card-fade" 
                 style="background-image: url('${imgPath}');" 
                 data-search="${item.tamil} ${item.eng}">
                 
                <div class="top-pill">
                    ${item.tamil}
                </div>

                <div class="bottom-glass">
					<div>
						<p class="subtitle marquee">${item.eng}</p>
					</div>
                    <a href="javascript:;" 
                       class="play-btn track-list" 
                       data-track="${audioPath}" 
                       data-poster="${imgPath}" 
                       data-title="${item.eng}">
                       <i class="fas fa-play"></i>
                    </a>
                </div>
            </div>`;
        });

        container.innerHTML = html;
    }

    // --- INITIALIZATION ---
    
    // Render Stories
    renderCards(storiesData, 'stories-container', 'stories');
    
    // Render Songs
    renderCards(songsData, 'songs-container', 'songs');
    
});