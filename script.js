
/* 1. PARTICLES & CANVAS INTERACTION */

        const canvasElement = document.getElementById('fxCanvas');
        const fxCanvas = canvasElement || document.createElement('canvas');
        const ctx = fxCanvas.getContext('2d');
        let particles = [];

        function resizeCanvas() {
            fxCanvas.width = window.innerWidth;
            fxCanvas.height = window.innerHeight;
            if (canvasElement) {
                canvasElement.width = fxCanvas.width;
                canvasElement.height = fxCanvas.height;
            }
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const SYMBOLS = ['✨', '💀', '🩷', '⚡', '🖤',];
		class Particle {
		constructor(x, y) {
		
        // The center point where the 'bouquet' begins
        this.x = x;
        this.y = y;
        
        // Pick from your SYMBOLS (or we can specialize them later)
        this.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        
        // Particles start small and bloom larger
        this.baseSize = Math.random() * 8 + 8; // Subtle starting size (e.g., 8-16px)
        this.size = 2; // Initial size 
        this.bloomSpeed = Math.random() * 0.5 + 0.3; // How fast it grows

        // BOUQUET MECHANICS: Radial Burst Velocity
        const angle = Math.random() * Math.PI * 2; // Any direction in 360 degrees
        const burstSpeed = Math.random() * 4 + 2; // Initial push (faster burst)
        
        this.vx = Math.cos(angle) * burstSpeed;
        this.vy = Math.sin(angle) * burstSpeed;
        
        // Add a gentle "gravity" or float upward so they drift after the burst
        this.gravity = 0.05; 
        
        this.alpha = 1;
        this.fadeSpeed = Math.random() * 0.015 + 0.01; // Smooth fade-out

        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1; // Gentle spin
    }

    update() {
        // 1. Move the particle
        this.x += this.vx;
        this.y += this.vy;
        
        // 2. Apply gentle gravity/drift
        this.vy += this.gravity; 
        
        // 3. Bloom effect (Size increases up to baseSize)
        if (this.size < this.baseSize) {
            this.size += this.bloomSpeed;
        }

        // 4. Spin and Fade
        this.rotation += this.rotationSpeed;
        this.alpha -= this.fadeSpeed;
    }

    draw() {
        if (this.alpha <= 0) return; // Don't draw invisible particles

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Scale the drawing based on the current 'bloomed' size
        const currentSize = Math.max(0, this.size);
        ctx.font = `${currentSize}px "Press Start 2P"`; // Use your pixel font or emoji font
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Set color if needed, otherwise just draw the emoji
        ctx.fillText(this.symbol, 0, 0);
        ctx.restore();
    }
}

        function triggerBouquetBloom(e) {
    // If e is passed (e.g., mouse click event), use that position.
    // Otherwise, default to the exact center of the screen.
    const startX = e ? (e.clientX || e.touches?.[0]?.clientX) : window.innerWidth / 2;
    const startY = e ? (e.clientY || e.touches?.[0]?.clientY) : window.innerHeight / 2;

    const totalFlowers = 30; // Number of blooming elements in the bouquet burst

    // Spawn all particles simultaneously for a sudden burst effect
    for (let i = 0; i < totalFlowers; i++) {
        // Pass the calculated start coordinates
        particles.push(new Particle(startX, startY));
    }
}

// *** OPTIONAL: If you want specialized bouquet emojis only ***
// const BOUQUET_SYMBOLS = ['🌸', '✨', '💖', '💐', '🌹', '🎀', '💎'];
// If using the specialized deck above, update the symbol line in the Particle constructor to:
// this.symbol = BOUQUET_SYMBOLS[Math.floor(Math.random() * BOUQUET_SYMBOLS.length)];

        function animateParticles() {
            ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].alpha <= 0) particles.splice(i, 1);
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        /* 2. DRAGGABLE WINDOW SYSTEM LOGIC */
        let activeZIndex = 100;

        function openWindow(winId) {
            const win = document.getElementById(winId);
            if (!win) return;
            win.classList.remove('hidden');
            activeZIndex++;
            win.style.zIndex = activeZIndex;
            makeWindowDraggable(win);
            updateTaskbar();
        }

        function closeWindow(winId) {
            const win = document.getElementById(winId);
            if (win) win.classList.add('hidden');
            updateTaskbar();
        }

        function minimizeWindow(winId) {
            closeWindow(winId);
        }

        function makeWindowDraggable(win) {
            const header = win.querySelector('.window-header');
            if (!header) return;

            let isDragging = false;
            let offsetX = 0, offsetY = 0;

            function onMouseDown(e) {
                isDragging = true;
                activeZIndex++;
                win.style.zIndex = activeZIndex;
                const clientX = e.clientX || e.touches?.[0]?.clientX;
                const clientY = e.clientY || e.touches?.[0]?.clientY;
                offsetX = clientX - win.offsetLeft;
                offsetY = clientY - win.offsetTop;

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                document.addEventListener('touchmove', onMouseMove);
                document.addEventListener('touchend', onMouseUp);
            }

            function onMouseMove(e) {
                if (!isDragging) return;
                const clientX = e.clientX || e.touches?.[0]?.clientX;
                const clientY = e.clientY || e.touches?.[0]?.clientY;
                win.style.left = `${Math.max(0, clientX - offsetX)}px`;
                win.style.top = `${Math.max(0, clientY - offsetY)}px`;
            }

            function onMouseUp() {
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('touchmove', onMouseMove);
                document.removeEventListener('touchend', onMouseUp);
            }

            header.onmousedown = onMouseDown;
            header.ontouchstart = onMouseDown;
        }

        function updateTaskbar() {
            const taskbarApps = document.getElementById('taskbarApps');
            taskbarApps.innerHTML = '';
            const allWindows = document.querySelectorAll('.os-window');

            allWindows.forEach(win => {
                if (!win.classList.contains('hidden')) {
                    const title = win.querySelector('.window-header span')?.innerText || 'App';
                    const btn = document.createElement('button');
                    btn.className = "px-2.5 py-1 bg-gothPurple border border-bubblePink/40 rounded text-[10px] font-mono text-bubblePink truncate max-w-[120px]";
                    btn.innerText = title;
                    btn.onclick = () => {
                        activeZIndex++;
                        win.style.zIndex = activeZIndex;
                    };
                    taskbarApps.appendChild(btn);
                }
            });
        }

        /* 3. START MENU & HYPNO SPIRAL TOGGLE */
        function toggleStartMenu() {
            const menu = document.getElementById('startMenu');
            menu.classList.toggle('hidden');
        }

        let spiralEnabled = true;
        function toggleSpiral() {
            const spiral = document.getElementById('spiralOverlay');
            spiralEnabled = !spiralEnabled;
            spiral.style.opacity = spiralEnabled ? '0.08' : '0';
        }

        /* 4. ARK BREEDING CALCULATOR LOGIC */
        function calculateBreeding() {
            const mat = parseInt(document.getElementById('matMut').value) || 0;
            const pat = parseInt(document.getElementById('patMut').value) || 0;
            const res = document.getElementById('breedResult');

            const total = mat + pat;
            const chance = total < 40 ? "7.31% (High Mutation Chance!)" : "3.56% (Patriarch Line Capped)";

            res.innerHTML = `🧬 Total Mutations: <strong class="text-bubblePink">${total}</strong> • Hatch Odds: <strong class="text-slimeGreen">${chance}</strong>`;
            triggerMagic();
        }

        /* 5. MEDIA PLAYER LOGIC */
        let isPlaying = false;
        function toggleOSPlayer() {
            isPlaying = !isPlaying;
            const btn = document.getElementById('playerPlayBtn');
            btn.innerText = isPlaying ? "⏸ PAUSE MUSIC" : "▶ PLAY MUSIC";
            btn.className = isPlaying ? "flex-1 py-2.5 bg-bubblePink text-black font-pixel text-xs rounded-xl transition font-bold" : "flex-1 py-2.5 bg-slimeGreen text-black font-pixel text-xs rounded-xl transition font-bold";
        }

        function playSpecificTrack(idx) {
            isPlaying = true;
            toggleOSPlayer();
        }

        function nextOSTrack() {
            triggerMagic();
        }

        /* 6. TAROT CARD DRAWER */
const TAROT_DECK = [
    // --- MAJOR ARCANA (22) ---
    { name: "0. The Fool", desc: "Forgetting to check the tame's stamina before flying over the redwoods 🍃" },
    { name: "I. The Magician", desc: "Matte Black soul, rolling a fat joint with high intuition 🔮" },
    { name: "II. The High Priestess", desc: "Whimsigoth wisdom, iced coffee, & unbothered dark aura 🌙" },
    { name: "III. The Empress", desc: "Abundance, 100% mutation line odds, & cozy oversized hoodies ✨" },
    { name: "IV. The Emperor", desc: "G59 till the grave & controlling the server's trade market 💀" },
    { name: "V. The Hierophant", desc: "Consulting the weed strain guide instead of authority 🌿" },
    { name: "VI. The Lovers", desc: "Ruby & $crim level chemistry & matching dark aesthetics 🖤" },
    { name: "VII. The Chariot", desc: "Full speed ahead off 3 espresso shots & zero sleep ☕" },
    { name: "VIII. Strength", desc: "Taming a Giga solo while high as a kite 🦕" },
    { name: "IX. The Hermit", desc: "Rotting in bed listening to Burgundy on loop 🎧" },
    { name: "X. Wheel of Fortune", desc: "100% hatch rate luck & finding a lost mutation 🥚" },
    { name: "XI. Justice", desc: "Calling out server griefers & instant karma ⚖️" },
    { name: "XII. The Hanged Man", desc: "Stuck in a lag loop but enlightened by the session 🍃" },
    { name: "XIII. Death", desc: "Self-Inflicted plot armor; ending bad vibes for a total glow-up 🥀" },
    { name: "XIV. Temperance", desc: "Balancing caffeine intake with cold bong rips 🧪" },
    { name: "XV. The Devil", desc: "One more bowl at 3 AM when you have work tomorrow 😈" },
    { name: "XVI. The Tower", desc: "Server crash right as the baby dino hatches... absolute chaos 💥" },
    { name: "XVII. The Star", desc: "Cute hope, pink diamond vibrations, & shadow beats 💖" },
    { name: "XVIII. The Moon", desc: "Spooky midnight paranoia & late-night craving runs 🌕" },
    { name: "XIX. The Sun", desc: "Pure euphoria, freshly cleaned glass, & glowing mutations ☀️" },
    { name: "XX. Judgement", desc: "Realizing your ex was trash & listening to $B louder 📣" },
    { name: "XXI. The World", desc: "100% map exploration & complete peace of mind 🌍" },

    // --- SUIT OF CUPS (14) ---
    { name: "Ace of Cups", desc: "An overflowing cup of iced caramel coffee & pure joy 🧋" },
    { name: "Two of Cups", desc: "Shared blunts & co-op gaming soulmates 👯‍♀️" },
    { name: "Three of Cups", desc: "Girls night, true crime breakdowns, & gossip 🍷" },
    { name: "Four of Cups", desc: "Bored of standard colors, waiting for a neon mutation 🥱" },
    { name: "Five of Cups", desc: "Crying over spilled coffee & lost loot drops 😭" },
    { name: "Six of Cups", desc: "Nostalgic 2010s playlists & comfort food 🧸" },
    { name: "Seven of Cups", desc: "Too many open tabs & 50 unread Discord messages 🌀" },
    { name: "Eight of Cups", desc: "Leaving toxic servers & bad energy in the dust 🚶‍♀️" },
    { name: "Nine of Cups", desc: "Wish granted: maximum carry weight & infinite snacks 🍕" },
    { name: "Ten of Cups", desc: "Perfect base setup, cute tames, & zero drama 🏡" },
    { name: "Page of Cups", desc: "A random cute message from your long-distance favorite 💌" },
    { name: "Knight of Cups", desc: "Riding in with a hot coffee & new Spotify tracks 🎧" },
    { name: "Queen of Cups", desc: "Gurokawaii empathy & deep intuitive intuition 🔮" },
    { name: "King of Cups", desc: "Master of emotional chill, even through severe server lag 🌊" },

    // --- SUIT OF SWORDS (14) ---
    { name: "Ace of Swords", desc: "Instant breakthrough while debugging code at 2 AM 💡" },
    { name: "Two of Swords", desc: "Can't decide between toxic green or hot pink theme ⚔️" },
    { name: "Three of Swords", desc: "Heartbreak, but the shadow rap bass heals all 💔" },
    { name: "Four of Swords", desc: "Bed rot break time; do not disturb 🛌" },
    { name: "Five of Swords", desc: "Winning the argument but feeling petty as hell 😈" },
    { name: "Six of Swords", desc: "Sailing away from chaos into peaceful streams ⛵" },
    { name: "Seven of Swords", desc: "Sneaking into the redwoods base unnoticed 🥷" },
    { name: "Eight of Swords", desc: "Trapped in your own head overthinking text responses 🧠" },
    { name: "Nine of Swords", desc: "3 AM existential dread & nightmare fuel 👻" },
    { name: "Ten of Swords", desc: "Getting sniped out of nowhere... RIP inventory 🗡️" },
    { name: "Page of Swords", desc: "Curious lurking & reading server drama logs 🧐" },
    { name: "Knight of Swords", desc: "Charging into battle without a backup plan 🐎" },
    { name: "Queen of Swords", desc: "Sharp tongue, direct call-outs, zero fluff allowed ✂️" },
    { name: "King of Swords", desc: "Cold, calculated strategy & master builder energy 👑" },

    // --- SUIT OF WANDS (14) ---
    { name: "Ace of Wands", desc: "Sudden urge to completely redesign your entire OS layout 🪄" },
    { name: "Two of Wands", desc: "Planning your next map move while smoking on the roof 🌅" },
    { name: "Three of Wands", desc: "Your custom line tames are growing... success is near 🚢" },
    { name: "Four of Wands", desc: "Base celebration party with glow sticks & high FPS 🎉" },
    { name: "Five of Wands", desc: "Petty arguments in global chat 🥊" },
    { name: "Six of Wands", desc: "Unlocking the rarest achievement on server 🏆" },
    { name: "Seven of Wands", desc: "Defending your redwood shop against haters 🛡️" },
    { name: "Eight of Wands", desc: "Fast-paced Discord messages & instant replies ⚡" },
    { name: "Nine of Wands", desc: "One health point left but still standing tall 🩹" },
    { name: "Ten of Wands", desc: "Carrying 800 lbs of metal stone back to base alone 🎒" },
    { name: "Page of Wands", desc: "New hyperfixation unlocked! 🌟" },
    { name: "Knight of Wands", desc: "Unstoppable chaos gremlin energy 🏇" },
    { name: "Queen of Wands", desc: "Main character energy, hot pink aesthetic, absolute icon 💅" },
    { name: "King of Wands", desc: "Bold creative vision & absolute boss mentality 🔥" },

    // --- SUIT OF PENTACLES (14) ---
    { name: "Ace of Pentacles", desc: "Finding a high-tier blueprint in a white drop 🪙" },
    { name: "Two of Pentacles", desc: "Juggling 4 side projects, coffee, & a gaming session 🤹‍♀️" },
    { name: "Three of Pentacles", desc: "Clean collaboration & build masterclass 🏗️" },
    { name: "Four of Pentacles", desc: "Hoarding element & rare crystals like a dragon 🐉" },
    { name: "Five of Pentacles", desc: "Out of weed & out of coffee syrup... tragic 🥶" },
    { name: "Six of Pentacles", desc: "Gifting free starter packs to new server players 🎁" },
    { name: "Seven of Pentacles", desc: "Waiting patiently for eggs to hatch ⏳" },
    { name: "Eight of Pentacles", desc: "Grinding CSS variables until the pixel alignment is perfect 🛠️" },
    { name: "Nine of Pentacles", desc: "Living lavish in a custom pink fortress 🏰" },
    { name: "Ten of Pentacles", desc: "Generational wealth in mutated stats & aesthetic bases 💎" },
    { name: "Page of Pentacles", desc: "Learning a new code frame or building blueprint 📜" },
    { name: "Knight of Pentacles", desc: "Slow, steady, & reliable resource farming 🚜" },
    { name: "Queen of Pentacles", desc: "Cozy home, abundant snacks, & warm vibes 🕯️" },
    { name: "King of Pentacles", desc: "Trading company mogul & master of the economy 💵" }
];

        function drawTarotCard(slotIdx) {
            const container = document.getElementById('tarotCardsContainer');
            const card = container.children[slotIdx];
            const drawn = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];

            card.innerHTML = `
                <span class="text-2xl">✨</span>
                <span class="font-pixel text-[9px] text-bubblePink mt-1">${drawn.name}</span>
                <span class="font-cute text-[9px] text-gray-300 mt-0.5">${drawn.desc}</span>
            `;
            triggerMagic();
        }

        function drawAllTarot() {
            for (let i = 0; i < 3; i++) drawTarotCard(i);
        }

        /* 7. FELINE FAMILIARS CLICKER SIMULATOR */
        let currentPet = 'lucifer';
        let loveScore = 85;
        let treatScore = 60;

        function switchPet(petKey) {
            currentPet = petKey;
            const emote = document.getElementById('petEmote');
            const title = document.getElementById('petNameTitle');

            if (petKey === 'lucifer') {
                emote.innerText = '🐈‍⬛';
                title.innerText = 'Lucifer (Tuxedo)';
            } else {
                emote.innerText = '🖤';
                title.innerText = 'Ozzie (Void Cat)';
            }
        }

        function patPet(e) {
            loveScore = Math.min(100, loveScore + 5);
            document.getElementById('loveVal').innerText = `${loveScore}%`;
            document.getElementById('loveBar').style.width = `${loveScore}%`;
            triggerMagic(e);
        }

        function feedPet() {
            treatScore = Math.min(100, treatScore + 15);
            document.getElementById('treatVal').innerText = `${treatScore}%`;
            document.getElementById('treatBar').style.width = `${treatScore}%`;
            triggerMagic();
        }

        /* 8. OBSIDIAN PAD THEME LOGIC */
        function changeNoteTheme() {
            const val = document.getElementById('noteThemeSelect').value;
            const area = document.getElementById('notePadArea');

            if (val === 'pink') {
                area.className = "w-full flex-1 bg-gothPurple/90 border-2 border-bubblePink p-3 rounded-xl font-mono text-xs text-bubblePink outline-none resize-none";
            } else if (val === 'toxic') {
                area.className = "w-full flex-1 bg-black border-2 border-slimeGreen p-3 rounded-xl font-mono text-xs text-slimeGreen outline-none resize-none";
            } else {
                area.className = "w-full flex-1 bg-black/80 border border-darkBorder p-3 rounded-xl font-mono text-xs text-gray-200 outline-none resize-none";
            }
        }

        function clearNotes() {
            document.getElementById('notePadArea').value = '';
        }

        /* 9. TERMINAL COMMAND HANDLER */
        function handleTerminalKey(e) {
            if (e.key === 'Enter') {
                const input = document.getElementById('termInput');
                const cmd = input.value.trim().toLowerCase();
                const out = document.getElementById('termOutput');

                const pCmd = document.createElement('p');
                pCmd.className = "text-white";
                pCmd.innerText = `bloomie@vault:~$ ${input.value}`;
                out.appendChild(pCmd);

                const pRes = document.createElement('p');
                if (cmd === 'help') {
                    pRes.className = "text-lavender";
                    pRes.innerText = "Commands: 'g59', 'dinos', 'caffeine', 'spells', 'clear'";
                } else if (cmd === 'g59') {
                    pRes.className = "text-bubblePink";
                    pRes.innerText = "💀 GREY FIVE NINE UNTIL THE GRAVE 💀";
                } else if (cmd === 'dinos') {
                    pRes.className = "text-slimeGreen";
                    pRes.innerText = "🦖 Pink Thorn Trading Co. Status: 254 Health Rex Line Breeding active.";
                } else if (cmd === 'caffeine') {
                    pRes.className = "text-acidGreen";
                    pRes.innerText = "☕ Iced Coffee Level at 98%. System operational.";
                } else if (cmd === 'clear') {
                    out.innerHTML = '';
                    input.value = '';
                    return;
                } else {
                    pRes.className = "text-red-400";
                    pRes.innerText = `Command not recognized: '${cmd}'. Type 'help' for options.`;
                }

                out.appendChild(pRes);
                out.scrollTop = out.scrollHeight;
                input.value = '';
            }
        }

        /* 10. REAL-TIME SYSTEM CLOCK */
        function updateClock() {
            const now = new Date();
            document.getElementById('systemClock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        setInterval(updateClock, 1000);
        updateClock();

        // Open default window on launch
        window.onload = () => {
            openWindow('win-dinos');
        }
		
		
		
		
		
		
		/* 1. PARTICLES & CANVAS INTERACTION */
function triggerMagic(e) {
    const startX = e ? (e.clientX || e.touches?.[0]?.clientX) : window.innerWidth / 2;
    const startY = e ? (e.clientY || e.touches?.[0]?.clientY) : window.innerHeight / 2;

    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(startX, startY));
    }
}

/* 2. DRAGGABLE WINDOW SYSTEM LOGIC */
function openWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    win.classList.remove('hidden');
    activeZIndex++;
    win.style.zIndex = activeZIndex;
    makeWindowDraggable(win);
    updateTaskbar();
}

function closeWindow(winId) {
    const win = document.getElementById(winId);
    if (win) win.classList.add('hidden');
    updateTaskbar();
}

function minimizeWindow(winId) {
    closeWindow(winId);
}

function makeWindowDraggable(win) {
    const header = win.querySelector('.window-header');
    if (!header) return;

    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    function onMouseDown(e) {
        isDragging = true;
        activeZIndex++;
        win.style.zIndex = activeZIndex;
        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;
        offsetX = clientX - win.offsetLeft;
        offsetY = clientY - win.offsetTop;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', onMouseUp);
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;
        win.style.left = `${Math.max(0, clientX - offsetX)}px`;
        win.style.top = `${Math.max(0, clientY - offsetY)}px`;
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('touchmove', onMouseMove);
        document.removeEventListener('touchend', onMouseUp);
    }

    header.onmousedown = onMouseDown;
    header.ontouchstart = onMouseDown;
}

function updateTaskbar() {
    const taskbarApps = document.getElementById('taskbarApps');
    taskbarApps.innerHTML = '';
    const allWindows = document.querySelectorAll('.os-window');

    allWindows.forEach(win => {
        if (!win.classList.contains('hidden')) {
            const title = win.querySelector('.window-header span')?.innerText || 'App';
            const btn = document.createElement('button');
            btn.className = "px-2.5 py-1 bg-gothPurple border border-bubblePink/40 rounded text-[10px] font-mono text-bubblePink truncate max-w-[120px]";
            btn.innerText = title;
            btn.onclick = () => {
                activeZIndex++;
                win.style.zIndex = activeZIndex;
            };
            taskbarApps.appendChild(btn);
        }
    });
}

/* 3. START MENU, CRT & HYPNO SPIRAL TOGGLES */
function toggleStartMenu() {
    const menu = document.getElementById('startMenu');
    menu.classList.toggle('hidden');
}

function toggleSpiral() {
    const spiral = document.getElementById('hypnoBg');
    const btn = document.getElementById('hypnoBtn');
    spiralEnabled = !spiralEnabled;
    if (spiral) spiral.style.opacity = spiralEnabled ? '0.1' : '0';
    if (btn) {
        btn.style.opacity = spiralEnabled ? '1' : '0.4';
    }
}

let crtEnabled = true;
function toggleCRT() {
    const body = document.getElementById('osBody');
    const btn = document.getElementById('crtBtn');
    crtEnabled = !crtEnabled;
    if (crtEnabled) {
        body.classList.add('crt-overlay');
        if (btn) btn.style.opacity = '1';
    } else {
        body.classList.remove('crt-overlay');
        if (btn) btn.style.opacity = '0.4';
    }
}

/* 4. ARK BREEDING CALCULATOR LOGIC */
function calculateBreeding() {
    const mat = parseInt(document.getElementById('matMut').value) || 0;
    const pat = parseInt(document.getElementById('patMut').value) || 0;
    const res = document.getElementById('breedResult');

    const total = mat + pat;
    const chance = total < 40 ? "7.31% (High Mutation Chance!)" : "3.56% (Patriarch Line Capped)";

    res.innerHTML = `🧬 Total Mutations: <strong class="text-bubblePink">${total}</strong> • Hatch Odds: <strong class="text-hotPink">${chance}</strong>`;
    triggerMagic();
}

/* 5. MEDIA PLAYER LOGIC */
function toggleOSPlayer() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('playerPlayBtn');
    btn.innerText = isPlaying ? "⏸ PAUSE MUSIC" : "▶ PLAY MUSIC";
    btn.className = isPlaying ? "flex-1 py-2.5 bg-bubblePink text-black font-pixel text-xs rounded-xl transition font-bold" : "flex-1 py-2.5 bg-hotPink text-black font-pixel text-xs rounded-xl transition font-bold";
}

function playSpecificTrack(idx) {
    isPlaying = true;
    toggleOSPlayer();
}

function nextOSTrack() {
    triggerMagic();
}

/* 6. TAROT CARD DRAWER */
const TAROT_DECK_VARIANT = [
    // --- MAJOR ARCANA (22) ---
    { name: "0. The Fool", desc: "Forgetting to check the tame's stamina before flying over the redwoods 🍃" },
    { name: "I. The Magician", desc: "Matte Black soul, rolling a fat joint with high intuition 🔮" },
    { name: "II. The High Priestess", desc: "Whimsigoth wisdom, iced coffee, & unbothered dark aura 🌙" },
    { name: "III. The Empress", desc: "Abundance, 100% mutation line odds, & cozy oversized hoodies ✨" },
    { name: "IV. The Emperor", desc: "G59 till the grave & controlling the server's trade market 💀" },
    { name: "V. The Hierophant", desc: "Consulting the weed strain guide instead of authority 🌿" },
    { name: "VI. The Lovers", desc: "Ruby & $crim level chemistry & matching dark aesthetics 🖤" },
    { name: "VII. The Chariot", desc: "Full speed ahead off 3 espresso shots & zero sleep ☕" },
    { name: "VIII. Strength", desc: "Taming a Giga solo while high as a kite 🦕" },
    { name: "IX. The Hermit", desc: "Rotting in bed listening to Burgundy on loop 🎧" },
    { name: "X. Wheel of Fortune", desc: "100% hatch rate luck & finding a lost mutation 🥚" },
    { name: "XI. Justice", desc: "Calling out server griefers & instant karma ⚖️" },
    { name: "XII. The Hanged Man", desc: "Stuck in a lag loop but enlightened by the session 🍃" },
    { name: "XIII. Death", desc: "Self-Inflicted plot armor; ending bad vibes for a total glow-up 🥀" },
    { name: "XIV. Temperance", desc: "Balancing caffeine intake with cold bong rips 🧪" },
    { name: "XV. The Devil", desc: "One more bowl at 3 AM when you have work tomorrow 😈" },
    { name: "XVI. The Tower", desc: "Server crash right as the baby dino hatches... absolute chaos 💥" },
    { name: "XVII. The Star", desc: "Cute hope, pink diamond vibrations, & shadow beats 💖" },
    { name: "XVIII. The Moon", desc: "Spooky midnight paranoia & late-night craving runs 🌕" },
    { name: "XIX. The Sun", desc: "Pure euphoria, freshly cleaned glass, & glowing mutations ☀️" },
    { name: "XX. Judgement", desc: "Realizing your ex was trash & listening to $B louder 📣" },
    { name: "XXI. The World", desc: "100% map exploration & complete peace of mind 🌍" },

    // --- SUIT OF CUPS (14) ---
    { name: "Ace of Cups", desc: "An overflowing cup of iced caramel coffee & pure joy 🧋" },
    { name: "Two of Cups", desc: "Shared blunts & co-op gaming soulmates 👯‍♀️" },
    { name: "Three of Cups", desc: "Girls night, true crime breakdowns, & gossip 🍷" },
    { name: "Four of Cups", desc: "Bored of standard colors, waiting for a neon mutation 🥱" },
    { name: "Five of Cups", desc: "Crying over spilled coffee & lost loot drops 😭" },
    { name: "Six of Cups", desc: "Nostalgic 2010s playlists & comfort food 🧸" },
    { name: "Seven of Cups", desc: "Too many open tabs & 50 unread Discord messages 🌀" },
    { name: "Eight of Cups", desc: "Leaving toxic servers & bad energy in the dust 🚶‍♀️" },
    { name: "Nine of Cups", desc: "Wish granted: maximum carry weight & infinite snacks 🍕" },
    { name: "Ten of Cups", desc: "Perfect base setup, cute tames, & zero drama 🏡" },
    { name: "Page of Cups", desc: "A random cute message from your long-distance favorite 💌" },
    { name: "Knight of Cups", desc: "Riding in with a hot coffee & new Spotify tracks 🎧" },
    { name: "Queen of Cups", desc: "Gurokawaii empathy & deep intuitive intuition 🔮" },
    { name: "King of Cups", desc: "Master of emotional chill, even through severe server lag 🌊" },

    // --- SUIT OF SWORDS (14) ---
    { name: "Ace of Swords", desc: "Instant breakthrough while debugging code at 2 AM 💡" },
    { name: "Two of Swords", desc: "Can't decide between toxic green or hot pink theme ⚔️" },
    { name: "Three of Swords", desc: "Heartbreak, but the shadow rap bass heals all 💔" },
    { name: "Four of Swords", desc: "Bed rot break time; do not disturb 🛌" },
    { name: "Five of Swords", desc: "Winning the argument but feeling petty as hell 😈" },
    { name: "Six of Swords", desc: "Sailing away from chaos into peaceful streams ⛵" },
    { name: "Seven of Swords", desc: "Sneaking into the redwoods base unnoticed 🥷" },
    { name: "Eight of Swords", desc: "Trapped in your own head overthinking text responses 🧠" },
    { name: "Nine of Swords", desc: "3 AM existential dread & nightmare fuel 👻" },
    { name: "Ten of Swords", desc: "Getting sniped out of nowhere... RIP inventory 🗡️" },
    { name: "Page of Swords", desc: "Curious lurking & reading server drama logs 🧐" },
    { name: "Knight of Swords", desc: "Charging into battle without a backup plan 🐎" },
    { name: "Queen of Swords", desc: "Sharp tongue, direct call-outs, zero fluff allowed ✂️" },
    { name: "King of Swords", desc: "Cold, calculated strategy & master builder energy 👑" },

    // --- SUIT OF WANDS (14) ---
    { name: "Ace of Wands", desc: "Sudden urge to completely redesign your entire OS layout 🪄" },
    { name: "Two of Wands", desc: "Planning your next map move while smoking on the roof 🌅" },
    { name: "Three of Wands", desc: "Your custom line tames are growing... success is near 🚢" },
    { name: "Four of Wands", desc: "Base celebration party with glow sticks & high FPS 🎉" },
    { name: "Five of Wands", desc: "Petty arguments in global chat 🥊" },
    { name: "Six of Wands", desc: "Unlocking the rarest achievement on server 🏆" },
    { name: "Seven of Wands", desc: "Defending your redwood shop against haters 🛡️" },
    { name: "Eight of Wands", desc: "Fast-paced Discord messages & instant replies ⚡" },
    { name: "Nine of Wands", desc: "One health point left but still standing tall 🩹" },
    { name: "Ten of Wands", desc: "Carrying 800 lbs of metal stone back to base alone 🎒" },
    { name: "Page of Wands", desc: "New hyperfixation unlocked! 🌟" },
    { name: "Knight of Wands", desc: "Unstoppable chaos gremlin energy 🏇" },
    { name: "Queen of Wands", desc: "Main character energy, hot pink aesthetic, absolute icon 💅" },
    { name: "King of Wands", desc: "Bold creative vision & absolute boss mentality 🔥" },

    // --- SUIT OF PENTACLES (14) ---
    { name: "Ace of Pentacles", desc: "Finding a high-tier blueprint in a white drop 🪙" },
    { name: "Two of Pentacles", desc: "Juggling 4 side projects, coffee, & a gaming session 🤹‍♀️" },
    { name: "Three of Pentacles", desc: "Clean collaboration & build masterclass 🏗️" },
    { name: "Four of Pentacles", desc: "Hoarding element & rare crystals like a dragon 🐉" },
    { name: "Five of Pentacles", desc: "Out of weed & out of coffee syrup... tragic 🥶" },
    { name: "Six of Pentacles", desc: "Gifting free starter packs to new server players 🎁" },
    { name: "Seven of Pentacles", desc: "Waiting patiently for eggs to hatch ⏳" },
    { name: "Eight of Pentacles", desc: "Grinding CSS variables until the pixel alignment is perfect 🛠️" },
    { name: "Nine of Pentacles", desc: "Living lavish in a custom pink fortress 🏰" },
    { name: "Ten of Pentacles", desc: "Generational wealth in mutated stats & aesthetic bases 💎" },
    { name: "Page of Pentacles", desc: "Learning a new code frame or building blueprint 📜" },
    { name: "Knight of Pentacles", desc: "Slow, steady, & reliable resource farming 🚜" },
    { name: "Queen of Pentacles", desc: "Cozy home, abundant snacks, & warm vibes 🕯️" },
    { name: "King of Pentacles", desc: "Trading company mogul & master of the economy 💵" }
];

function drawTarotCard(slotIdx) {
    const container = document.getElementById('tarotCardsContainer');
    const card = container.children[slotIdx];
    const drawn = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];

    card.innerHTML = `
        <span class="text-2xl">✨</span>
        <span class="font-pixel text-[9px] text-bubblePink mt-1">${drawn.name}</span>
        <span class="font-cute text-[9px] text-gray-300 mt-0.5">${drawn.desc}</span>
    `;
    triggerMagic();
}

function drawAllTarot() {
    for (let i = 0; i < 3; i++) drawTarotCard(i);
}

/* 7. FELINE FAMILIARS CLICKER SIMULATOR */

function switchPet(petKey) {
    currentPet = petKey;
    const emote = document.getElementById('petEmote');
    const title = document.getElementById('petNameTitle');

    if (petKey === 'lucifer') {
        emote.innerText = '🐈‍⬛';
        title.innerText = 'Lucifer (Tuxedo)';
    } else {
        emote.innerText = '🖤';
        title.innerText = 'Ozzie (Void Cat)';
    }
}

function patPet(e) {
    loveScore = Math.min(100, loveScore + 5);
    document.getElementById('loveVal').innerText = `${loveScore}%`;
    document.getElementById('loveBar').style.width = `${loveScore}%`;
    triggerMagic(e);
}

function feedPet() {
    treatScore = Math.min(100, treatScore + 15);
    document.getElementById('treatVal').innerText = `${treatScore}%`;
    document.getElementById('treatBar').style.width = `${treatScore}%`;
    triggerMagic();
}

/* 8. OBSIDIAN PAD THEME LOGIC */
function changeNoteTheme() {
    const val = document.getElementById('noteThemeSelect').value;
    const area = document.getElementById('notePadArea');

    if (val === 'pink') {
        area.className = "w-full flex-1 bg-gothPurple/90 border-2 border-bubblePink p-3 rounded-xl font-mono text-xs text-bubblePink outline-none resize-none";
    } else if (val === 'toxic') {
        area.className = "w-full flex-1 bg-black border-2 border-hotPink p-3 rounded-xl font-mono text-xs text-hotPink outline-none resize-none";
    } else {
        area.className = "w-full flex-1 bg-black/80 border border-darkBorder p-3 rounded-xl font-mono text-xs text-gray-200 outline-none resize-none";
    }
}

function clearNotes() {
    document.getElementById('notePadArea').value = '';
}

/* 9. TERMINAL COMMAND HANDLER */
function handleTerminalKey(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById('termInput');
        const cmd = input.value.trim().toLowerCase();
        const out = document.getElementById('termOutput');

        const pCmd = document.createElement('p');
        pCmd.className = "text-white";
        pCmd.innerText = `bloomie@vault:~$ ${input.value}`;
        out.appendChild(pCmd);

        const pRes = document.createElement('p');
        if (cmd === 'help') {
            pRes.className = "text-lavender";
            pRes.innerText = "Commands: 'g59', 'dinos', 'caffeine', 'spells', 'clear'";
        } else if (cmd === 'g59') {
            pRes.className = "text-bubblePink";
            pRes.innerText = "💀 GREY FIVE NINE UNTIL THE GRAVE 💀";
        } else if (cmd === 'dinos') {
            pRes.className = "text-hotPink";
            pRes.innerText = "🦖 Pink Thorn Trading Co. Status: 254 Health Rex Line Breeding active.";
        } else if (cmd === 'caffeine') {
            pRes.className = "text-acidGreen";
            pRes.innerText = "☕ Iced Coffee Level at 98%. System operational.";
        }  else if (cmd === 'boo!') {
            const today = new Date();
            let halloween = new Date(today.getFullYear(), 9, 31);
            if (today > halloween) halloween.setFullYear(today.getFullYear() + 1);
            const daysLeft = Math.ceil((halloween - today) / (1000 * 60 * 60 * 24));

            pRes.className = "text-center whitespace-pre font-mono text-hotPink text-sm leading-none my-2";
            pRes.innerText = `
⠀⠀⠀⠀⠀⠀⢀⣤⣶⣶⣖⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣾⡟⣉⣽⣿⢿⡿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢠⣿⣿⣿⡗⠋⠙⡿⣷⢌⣿⣿⠀⠀⠀⠀⠀⠀⠀
⣷⣄⣀⣿⣿⣿⣿⣷⣦⣤⣾⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀
⠈⠙⠛⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⡀⠀⢀⠀⠀⠀⠀
⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠻⠿⠿⠋⠀⠀⠀⠀
⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⡄
⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⢀⡾⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣶⣴⣾⠏⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠛⠛⠛⠋⠁⠀⠀⠀

🎃 ${daysLeft} DAYS UNTIL HALLOWEEN! 🎃`;
        } else if (cmd === 'clear') {
            out.innerHTML = '';
            input.value = '';
            return;
        } else {
            pRes.className = "text-red-400";
            pRes.innerText = `Command not recognized: '${cmd}'. Type 'help' for options.`;
        }

        out.appendChild(pRes);
        out.scrollTop = out.scrollHeight;
        input.value = '';
    }
}

/* 10. REAL-TIME SYSTEM CLOCK */

function updateClock() {
    const now = new Date();
    document.getElementById('systemClock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// Open default window on launch
window.onload = () => {
    openWindow('win-dinos');
}

// Make scattered icons draggable on desktop
document.querySelectorAll('.scattered-icon').forEach(icon => {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    icon.addEventListener('mousedown', (e) => {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = icon.offsetLeft;
        initialTop = icon.offsetTop;

        const onMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                isDragging = true;
                icon.style.left = `${initialLeft + dx}px`;
                icon.style.top = `${initialTop + dy}px`;
            }
        };

        const onMouseUp = (upEvent) => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            if (isDragging) {
                // Prevent click window-open if we were dragging
                upEvent.stopPropagation();
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
});