// Live countdowns, API fetch, Discord member count
const API_BASE = 'http://localhost:3000/api';

async function fetchData() {
    const events = await fetch(`${API_BASE}/events`).then(r => r.json());
    const giveaways = await fetch(`${API_BASE}/giveaways`).then(r => r.json());
    renderEvents(events);
    renderGiveaways(giveaways);
    document.getElementById('event-count').innerText = events.length;
    document.getElementById('giveaway-count').innerText = giveaways.length;
}

function renderEvents(events) {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = events.map(ev => `
        <div class="event-card glass-card">
            <h3>${ev.name}</h3>
            <p><i class="far fa-clock"></i> ${new Date(ev.datetime).toLocaleString()}</p>
            <div class="countdown" data-end="${ev.datetime}" id="ev-${ev._id}">--</div>
        </div>
    `).join('');
    startCountdowns();
}

function startCountdowns() {
    setInterval(() => {
        document.querySelectorAll('.countdown[data-end]').forEach(el => {
            const diff = new Date(el.dataset.end) - new Date();
            if (diff <= 0) el.innerText = '🔥 STARTED';
            else el.innerText = `${Math.floor(diff/3600000)}h ${Math.floor((diff%3600000)/60000)}m ${Math.floor((diff%1000)/1000)}s`;
        });
    }, 1000);
}

// Discord member count (via Proxy API)
async function updateMemberCount() {
    try {
        const res = await fetch('https://discord.com/api/v9/invites/andaaz?with_counts=true');
        const data = await res.json();
        document.getElementById('member-count').innerText = data.approximate_member_count || '10k+';
    } catch { document.getElementById('member-count').innerText = '10,284'; }
}

fetchData();
updateMemberCount();
setInterval(updateMemberCount, 60000);