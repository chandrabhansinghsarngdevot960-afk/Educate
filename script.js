// Live Member Count from Discord
async function updateMemberCount() {
    try {
        const response = await fetch('https://discord.com/api/v9/invites/andaaz?with_counts=true');
        const data = await response.json();
        if (data.approximate_member_count) {
            document.getElementById('member-count').innerText = data.approximate_member_count.toLocaleString();
        } else {
            document.getElementById('member-count').innerText = '10,284';
        }
    } catch (error) {
        document.getElementById('member-count').innerText = '10,284';
    }
}

// Render Events
function renderEvents() {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    window.eventsData.forEach(event => {
        const eventDate = new Date(event.datetime);
        const card = document.createElement('div');
        card.className = 'event-card glass-card';
        card.innerHTML = `
            <h3>${event.name}</h3>
            <div class="datetime">
                <i class="far fa-calendar-alt"></i>
                <span>${eventDate.toLocaleDateString()}</span>
                <i class="far fa-clock"></i>
                <span>${eventDate.toLocaleTimeString()}</span>
            </div>
            <div class="countdown" id="countdown-${event.id}" data-end="${event.datetime}">
                Loading...
            </div>
            <div class="status" id="status-${event.id}">Upcoming</div>
        `;
        container.appendChild(card);
    });
    
    startEventCountdowns();
}

// Live Countdown for Events
function startEventCountdowns() {
    function updateAllCountdowns() {
        document.querySelectorAll('.countdown[data-end]').forEach(el => {
            const endTime = new Date(el.getAttribute('data-end'));
            const now = new Date();
            const diff = endTime - now;
            
            if (diff <= 0) {
                el.innerText = '🔥 STARTED';
                const statusEl = document.getElementById(el.id.replace('countdown', 'status'));
                if (statusEl) statusEl.innerText = 'Live Now!';
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                el.innerText = `${hours}h ${minutes}m ${seconds}s`;
            }
        });
    }
    
    updateAllCountdowns();
    setInterval(updateAllCountdowns, 1000);
}

// Render Giveaways
function renderGiveaways() {
    const container = document.getElementById('giveawaysContainer');
    if (!container) return;
    
    container.innerHTML = '';
    window.giveawaysData.forEach(giveaway => {
        const endDate = new Date(giveaway.endTime);
        const hasEnded = new Date() >= endDate;
        const winner = localStorage.getItem(`winner_${giveaway.id}`);
        
        const card = document.createElement('div');
        card.className = 'giveaway-card glass-card';
        card.innerHTML = `
            <h3>🎁 ${giveaway.name}</h3>
            <div class="datetime">
                <i class="fas fa-hourglass-end"></i>
                <span>Ends: ${endDate.toLocaleString()}</span>
            </div>
            <div class="countdown" id="giveaway-countdown-${giveaway.id}" data-end="${giveaway.endTime}">
                Loading...
            </div>
            <div class="participants">
                <i class="fas fa-users"></i> ${giveaway.participants.length} Participants
            </div>
            ${winner ? `<div class="winner-area"><i class="fas fa-trophy"></i> Winner: ${winner}</div>` : 
                      (hasEnded ? `<div class="winner-area"><i class="fas fa-sync-alt"></i> Selecting winner...</div>` : '')}
        `;
        container.appendChild(card);
    });
    
    startGiveawayCountdowns();
    checkGiveawayWinners();
}

// Live Countdown for Giveaways
function startGiveawayCountdowns() {
    function updateGiveawayCountdowns() {
        document.querySelectorAll('.countdown[data-end]').forEach(el => {
            if (!el.id.includes('giveaway')) return;
            
            const endTime = new Date(el.getAttribute('data-end'));
            const now = new Date();
            const diff = endTime - now;
            
            if (diff <= 0) {
                el.innerText = '🏆 ENDED';
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                el.innerText = `${hours}h ${minutes}m ${seconds}s`;
            }
        });
    }
    
    updateGiveawayCountdowns();
    setInterval(updateGiveawayCountdowns, 1000);
}

// Check and Select Winners
function checkGiveawayWinners() {
    setInterval(() => {
        window.giveawaysData.forEach(giveaway => {
            const endTime = new Date(giveaway.endTime);
            const now = new Date();
            const existingWinner = localStorage.getItem(`winner_${giveaway.id}`);
            
            if (now >= endTime && !existingWinner && giveaway.participants.length > 0) {
                const randomIndex = Math.floor(Math.random() * giveaway.participants.length);
                const winner = giveaway.participants[randomIndex];
                localStorage.setItem(`winner_${giveaway.id}`, winner);
                
                // Discord Webhook (Optional - Replace with your webhook URL)
                const webhookURL = "YOUR_DISCORD_WEBHOOK_URL";
                const message = {
                    content: `🎉 **GIVEAWAY WINNER** 🎉\n**${giveaway.name}**\nWinner: **${winner}**\nCongratulations! 🏆`
                };
                
                fetch(webhookURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(message)
                }).catch(err => console.log('Webhook error:', err));
                
                renderGiveaways();
            }
        });
    }, 3000);
}

// Update counts
function updateCounts() {
    document.getElementById('event-count').innerText = window.eventsData.length;
    document.getElementById('giveaway-count').innerText = window.giveawaysData.length;
}

// Particle Animation
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.5 + 0.2,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.2
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(88, 101, 242, ${p.alpha})`;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    updateMemberCount();
    renderEvents();
    renderGiveaways();
    updateCounts();
    initParticles();
    
    setInterval(updateMemberCount, 60000);
});