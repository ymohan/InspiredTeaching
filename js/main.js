/* =========================================
   1. MOBILE MENU LOGIC
   ========================================= */
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileClose = document.querySelector('.mobile-close');

    if (!mobileToggle || !mobileMenu || !mobileClose) return;

    function toggleMenu() {
        mobileToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    function closeMenu() {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    mobileToggle.addEventListener('click', toggleMenu);
    mobileClose.addEventListener('click', closeMenu);

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    mobileMenu.addEventListener('click', e => {
        if (e.target === mobileMenu) closeMenu();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
});

/* =========================================
   2. DYNAMIC CONTENT (TABS & JSON FETCHING)
   ========================================= */
document.addEventListener('DOMContentLoaded', async () => {
    const tabsContainer = document.getElementById('tabs');
    const contentRoot = document.querySelector('.tab-content');
    if (!tabsContainer || !contentRoot) return;

    // --- Local content cache ---
    const contentCache = new Map(); 

    // --- HELPER: Transform Raw JSON to UI Structure ---
    // This converts your 1.json format (tamil/english) to the UI format (ta/en)
    // --- HELPER: Transform Your JSON to UI Structure ---
    const normalizeEpisodeData = (rawData) => {       

        // 1. Unwrap "story_metadata" if it exists
        // If your JSON is { story_metadata: { ... } }, this grabs the inside part.
        const data = rawData.story_metadata || rawData;

        // 2. define a helper to find keys case-insensitively
        const getField = (key) => data[key] || data[key.toLowerCase()] || {};

        // 3. Map your specific JSON keys to the UI keys
        // Your JSON has "message", but the UI tab is usually "what_we_learn"
        const synopsisObj = getField('synopsis');
        const learnObj = data.what_we_learn || data.message || data.Message || {} 

        return {
            tabs: [
                { id: 'transcript', label: 'Transcript' },
                { id: 'synopsis', label: 'Synopsis' },
                { id: 'what_we_learn', label: 'What We Learn' }
            ],
            content: {
                transcript: () => '', // Handled by HTML/Audio player
                
                // Extract Tamil/English from your structure
                synopsis: { 
                    ta: synopsisObj.tamil || synopsisObj.ta || 'விவரம் இல்லை', 
                    en: synopsisObj.english || synopsisObj.en || 'No synopsis available' 
                },
                
                // Maps your "message" to the "What We Learn" tab
                what_we_learn: { 
                    ta: learnObj.tamil || learnObj.ta || 'தகவல் இல்லை', 
                    en: learnObj.english || learnObj.en || 'No info available' 
                }
            }
        };
    };

    // --- Load from local JSON (assets/data/{id}.json) ---
	const loadEpisode = async (category, filename) => {
        // Create unique cache key like "stories_1"
        const cacheKey = `${category}_${filename}`;
        
        // 1. Check Cache
        if (contentCache.has(cacheKey)) return contentCache.get(cacheKey);

        let data = null;
        // Construct path: assets/data/stories/1.json
        const jsonPath = `assets/data/${category}/${filename}.json`;

        try {
            // 2. Try fetch
            const res = await fetch(`${jsonPath}?t=${Date.now()}`);
            if (res.ok) {
                const raw = await res.json();
                data = normalizeEpisodeData(raw);
            } else {
                console.warn(`Fetch failed for ${jsonPath}: ${res.status}`);
            }
        } catch (e) {
            console.warn('Fetch error', e);
        }

        // 3. Fallback: localStorage (Dev Tools)
        if (!data) {
            const rawLocal = localStorage.getItem(`episode_${cacheKey}`);
            if (rawLocal) {
                data = normalizeEpisodeData(JSON.parse(rawLocal));
            }
        }

        // 4. Fallback default
        if (!data) {
            data = normalizeEpisodeData({
                synopsis: { tamil: 'விவரம் இல்லை', english: 'No description available.' },
                what_we_learn: { tamil: '', english: '' }
            });
        }

        contentCache.set(cacheKey, data);
        return data;
    };

    // --- Save to localStorage (dev tool helper) ---
    window.saveEpisode = (id, data) => {
        localStorage.setItem(`episode_${id}`, JSON.stringify(data));
        // Clear cache so next load picks up the change
        contentCache.delete(id); 
        console.log(`Saved ${id} to localStorage`);
    };

    // --- Language state ---
    const langState = new Proxy({}, {
        get: (obj, key) => obj[key] || 'ta',
        set: (obj, key, val) => { obj[key] = val; return true; }
    });

    // --- Render Tabs ---
    const renderTabs = (tabConfig = []) => {
        tabsContainer.innerHTML = '';
        tabConfig.forEach((t, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'tab-btn';
            btn.dataset.tab = t.id;
            btn.textContent = t.label;
            if (i === 0) btn.classList.add('active'); // Default to first tab
            tabsContainer.appendChild(btn);
        });
    };

    // --- Render Panes + Lang Toggle ---
    const renderPanes = async (episodeKey, contentMap) => {
        // Remove existing panes except transcript (which holds audio logic)
        contentRoot.querySelectorAll('.tab-pane:not(#transcript)').forEach(el => el.remove());

        for (const [id, renderer] of Object.entries(contentMap)) {
            // 1. Handle Transcript (Special Case)
            if (id === 'transcript') {
                // We don't overwrite transcript HTML here, the audio player does that.
                // We just ensure the pane exists.
                continue; 
            }

            // 2. Create Pane
            const pane = document.createElement('div');
            pane.id = id;
            pane.className = 'tab-pane';

            // 3. Handle Bilingual Content (Object with ta/en)
            if (typeof renderer === 'object' && (renderer.ta || renderer.en)) {
                const toggle = document.createElement('div');
                toggle.className = 'lang-toggle';
                
                ['ta', 'en'].forEach(l => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.textContent = l.toUpperCase();
                    b.dataset.lang = l;
                    
                    const key = `${episodeKey}|${id}`;
                    // Set active class based on saved state
                    b.classList.toggle('active', langState[key] === l);
                    
                    toggle.appendChild(b);
                });
                pane.appendChild(toggle);

                const wrapper = document.createElement('div');
                wrapper.className = 'lang-content';
                const key = `${episodeKey}|${id}`;
                
                // Render initial content
                wrapper.innerHTML = renderer[langState[key]] || '';
                pane.appendChild(wrapper);

                // Click Handler
                toggle.addEventListener('click', e => {
                    const btn = e.target.closest('button');
                    if (!btn) return;
                    e.preventDefault();
                    
                    const lang = btn.dataset.lang;
                    const key = `${episodeKey}|${id}`;
                    langState[key] = lang;
                    
                    wrapper.innerHTML = renderer[lang] || '';
                    toggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            } 
            // 4. Handle Static Content (String or Function)
            else {
                pane.innerHTML = typeof renderer === 'function' ? renderer() : renderer;
            }

            contentRoot.appendChild(pane);
        }
    };

    // --- Tab Switcher Logic ---
    let currentTabsContainer = tabsContainer;

    const initTabSwitcher = () => {
        const switchTab = (targetId) => {
            // UI Updates
            currentTabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            contentRoot.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            const btn = currentTabsContainer.querySelector(`[data-tab="${targetId}"]`);
            const pane = document.getElementById(targetId);
            
            if (btn) btn.classList.add('active');
            if (pane) pane.classList.add('active');
        };

        // Replace container to kill old event listeners (clean slate)
        const newContainer = currentTabsContainer.cloneNode(true);
        currentTabsContainer.parentNode.replaceChild(newContainer, currentTabsContainer);
        currentTabsContainer = newContainer;

        // Add Listener
        currentTabsContainer.addEventListener('click', e => {
            const btn = e.target.closest('.tab-btn');
            if (!btn) return;
            e.preventDefault();
            switchTab(btn.dataset.tab);
        });

        // Default: Open first tab found
        const firstBtn = currentTabsContainer.querySelector('.tab-btn');
        if (firstBtn) switchTab(firstBtn.dataset.tab);
    };

    // --- Main Entry Point: loadTrack ---
    // --- Main Entry Point: loadTrack ---
  // --- Main Entry Point: loadTrack ---
    const origLoadTrack = window.loadTrack || (() => {});

    window.loadTrack = async (overrideData) => {
        // 1. Run original player logic to start audio/waveform
        // If overrideData is passed (from player navigation), it might be an ID or object
        origLoadTrack(overrideData);

        let category = 'stories';
        let filename = '1';
		

        // 2. Determine Category and Filename from LocalStorage
        // The player (vtt1.html) updates 'selectedTrack' whenever a track changes.
        try {
            const raw = localStorage.getItem('selectedTrack');
            if (raw) {
                const sel = JSON.parse(raw);
                if (sel.category && sel.filename) {
                    category = sel.category;
                    filename = sel.filename;
                } else if (sel.track) {
                    // Fallback: parse from track path if category missing
                    const parts = sel.track.split('/');
                    const f = parts.pop(); 
                    filename = f.substring(0, f.lastIndexOf('.'));
                    category = parts.pop();
                }
            }
        } catch(e) { console.error(e); }

        console.log(`Loading Data: Category=${category}, File=${filename}`);

        // 3. Load Content
        const episode = await loadEpisode(category, filename);
        if (!episode) return;

        window.__currentEpisodeKey = `${category}_${filename}`;
        renderTabs(episode.tabs);
        await renderPanes(window.__currentEpisodeKey, episode.content);
        initTabSwitcher();
    };
    // --- Init ---
    setTimeout(() => window.loadTrack(), 50);
});