const API_BASE = 'http://127.0.0.1:8080';

document.addEventListener('DOMContentLoaded', function() {
    const userIdStr = sessionStorage.getItem('userId');
    if (!userIdStr) {
        window.location.href = 'login-form.html';
        return;
    }
    const userId = parseInt(userIdStr, 10);

    function pad(n) { return n < 10 ? '0' + n : n; }
    function formatDate(date) {
        return date.getFullYear() + '-' + pad(date.getMonth()+1) + '-' + pad(date.getDate());
    }

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const bar = document.getElementById('weekday-bar');
    let daysArr = [];
    for(let i=0; i<11; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        daysArr.push(d);
    }
    if (bar) {
        bar.innerHTML = daysArr.map(d => {
            const dayName = weekdays[d.getDay()];
            const isToday = d.toDateString() === now.toDateString();
            const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            return `<div class="w-[90px] h-16 flex flex-col items-center justify-center rounded-lg text-white/80 text-sm font-medium tracking-wide cursor-pointer hover:bg-blue-900/20 hover:text-white transition-all duration-300 ease-in-out ${isToday ? 'bg-gradient-to-br from-blue-500 via-red-500 to-pink-600 text-white font-semibold shadow-md ring-2 ring-red-300/40' : ''}">
                <span>${dayName.slice(0,3)}</span>
                <span class='text-xs text-white/50 mt-1'>${dateStr}</span>
            </div>`;
        }).join('');
    }

    let currentDate = new Date();
    const calendarInput = document.getElementById('calendar-date');
    if (calendarInput) {
        calendarInput.value = formatDate(currentDate);
        document.getElementById('prev-date')?.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 1);
            calendarInput.value = formatDate(currentDate);
        });
        document.getElementById('next-date')?.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 1);
            calendarInput.value = formatDate(currentDate);
        });
        calendarInput.addEventListener('change', () => {
            if (calendarInput.value) {
                const parts = calendarInput.value.split('-');
                currentDate = new Date(parts[0], parts[1] - 1, parts[2]);
            }
        });
    }

    const profitBtn = document.getElementById('profit-btn');
    const lossBtn = document.getElementById('loss-btn');
    if (profitBtn && lossBtn) {
        profitBtn.addEventListener('click', function() {
            this.classList.add('active', 'ring-4', 'ring-green-400');
            lossBtn.classList.remove('active', 'ring-4', 'ring-red-400');
        });
        lossBtn.addEventListener('click', function() {
            this.classList.add('active', 'ring-4', 'ring-red-400');
            profitBtn.classList.remove('active', 'ring-4', 'ring-green-400');
        });
    }

    function showNotification(msg, type) {
        let notif = document.getElementById('trade-notif');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'trade-notif';
            notif.style.position = 'fixed';
            notif.style.top = '16px';
            notif.style.left = '50%';
            notif.style.transform = 'translateX(-50%)';
            notif.style.zIndex = '9999';
            notif.style.minWidth = '220px';
            notif.style.padding = '12px 24px';
            notif.style.borderRadius = '8px';
            notif.style.fontWeight = 'bold';
            notif.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
            document.body.appendChild(notif);
        }
        notif.textContent = msg;
        notif.style.background = type === 'success' ? 'linear-gradient(to right,#38bdf8,#22c55e)' : 'linear-gradient(to right,#f87171,#fbbf24)';
        notif.style.color = '#fff';
        notif.style.display = 'block';
        if (notif._timeout) clearTimeout(notif._timeout);
        notif._timeout = setTimeout(() => { notif.style.display = 'none'; }, 2000);
    }

    function loadOptions() {
        fetch(`${API_BASE}/api/user-options?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                const strategies = Array.isArray(data) ? data.filter(o => o.type === 'strategy') : (data.strategy || []);
                const rrs = Array.isArray(data) ? data.filter(o => o.type === 'rr') : (data.rr || []);
                
                const stratSel = document.getElementById('strategy');
                if(stratSel) stratSel.innerHTML = strategies.map(o => `<option value="${o.value}" data-id="${o.id}">${o.value}</option>`).join('');
                
                const rrSel = document.getElementById('rr');
                if(rrSel) rrSel.innerHTML = rrs.map(o => `<option value="${o.value}" data-id="${o.id}">${o.value}</option>`).join('');
            }).catch(console.error);

        fetch(`${API_BASE}/api/instruments`)
            .then(res => res.json())
            .then(data => {
                const instSel = document.getElementById('instrument');
                if(instSel) instSel.innerHTML = data.map(o => `<option value="${o.symbol || o.name}" data-id="${o.id}">${o.symbol || o.name}</option>`).join('');
            }).catch(console.error);
    }
    loadOptions();

    function createPopupMenu(title, defaultValue, saveCallback) {
        let modal = document.getElementById('generic-popup');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'generic-popup';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4">
                    <h2 class="text-xl font-bold mb-2">${title}</h2>
                    <input type="text" id="popup-input" class="border rounded-md px-3 py-2" value="${defaultValue || ''}" placeholder="Enter value..." />
                    <div class="flex justify-end gap-2 mt-4">
                        <button id="popup-cancel" class="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button id="popup-save" class="px-4 py-2 bg-blue-500 text-white rounded-md">Save</button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('popup-cancel').onclick = () => modal.innerHTML = '';
        document.getElementById('popup-save').onclick = () => {
            const val = document.getElementById('popup-input').value.trim();
            if (val) saveCallback(val);
            modal.innerHTML = '';
        };
    }

    function setupDropdownHandlers(type, idSuffix, selectId, apiPath, payloadBuilder) {
        document.getElementById(`add-${idSuffix}`)?.addEventListener('click', () => {
            createPopupMenu(`Add ${type}`, '', (val) => {
                fetch(`${API_BASE}${apiPath}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadBuilder(val))
                }).then(res => {
                    if (res.ok) { showNotification(`${type} added!`, 'success'); loadOptions(); }
                    else showNotification(`Error adding ${type}`, 'error');
                }).catch(() => showNotification(`Error adding ${type}`, 'error'));
            });
        });

        document.getElementById(`edit-${idSuffix}`)?.addEventListener('click', () => {
            const select = document.getElementById(selectId);
            if (select.selectedIndex === -1) return showNotification(`Select ${type} to edit`, 'error');
            const opt = select.options[select.selectedIndex];
            const id = opt.getAttribute('data-id');
            createPopupMenu(`Edit ${type}`, opt.value, (val) => {
                fetch(`${API_BASE}${apiPath}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadBuilder(val))
                }).then(res => {
                    if (res.ok) { showNotification(`${type} updated!`, 'success'); loadOptions(); }
                    else showNotification(`Error updating ${type}`, 'error');
                }).catch(() => showNotification(`Error updating ${type}`, 'error'));
            });
        });

        document.getElementById(`delete-${idSuffix}`)?.addEventListener('click', () => {
            const select = document.getElementById(selectId);
            if (select.selectedIndex === -1) return showNotification(`Select ${type} to delete`, 'error');
            const opt = select.options[select.selectedIndex];
            const id = opt.getAttribute('data-id');
            if (confirm(`Delete ${opt.value}?`)) {
                fetch(`${API_BASE}${apiPath}/${id}`, { method: 'DELETE' })
                    .then(res => {
                        if (res.ok) { showNotification(`${type} deleted!`, 'success'); loadOptions(); }
                        else showNotification(`Error deleting ${type}`, 'error');
                    }).catch(() => showNotification(`Error deleting ${type}`, 'error'));
            }
        });
    }

    setupDropdownHandlers('Instrument', 'instrument', 'instrument', '/api/instruments', (val) => ({ symbol: val, name: val, type: 'Unknown' }));
    setupDropdownHandlers('Strategy', 'strategy', 'strategy', '/api/user-options', (val) => ({ type: 'strategy', value: val, userId }));
    setupDropdownHandlers('RR', 'rr', 'rr', '/api/user-options', (val) => ({ type: 'rr', value: val, userId }));

    window.currentTrades = [];
    window.editTrade = function(id) {
        const trade = window.currentTrades.find(t => t.id === id);
        if (!trade) return;
        
        document.getElementById('instrument').value = trade.instrument;
        document.getElementById('strategy').value = trade.strategy;
        document.getElementById('rr').value = trade.rr;
        document.getElementById('calendar-date').value = trade.date;
        
        const profitBtn = document.getElementById('profit-btn');
        const lossBtn = document.getElementById('loss-btn');
        if (trade.result === 'Profit') {
            profitBtn.classList.add('active', 'ring-4', 'ring-green-400');
            lossBtn.classList.remove('active', 'ring-4', 'ring-red-400');
        } else {
            lossBtn.classList.add('active', 'ring-4', 'ring-red-400');
            profitBtn.classList.remove('active', 'ring-4', 'ring-green-400');
        }
        
        window.editingTradeId = id;
        document.getElementById('add-trade-btn').textContent = 'Update Trade';
        document.getElementById('add-trade-btn').scrollIntoView({ behavior: 'smooth' });
    };

    window.deleteTrade = function(id) {
        if (!confirm('Are you sure you want to delete this trade?')) return;
        fetch(`${API_BASE}/api/trades/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    showNotification('Trade deleted!', 'success');
                    fetchTrades();
                } else {
                    showNotification('Error deleting trade', 'error');
                }
            })
            .catch(() => showNotification('Error deleting trade', 'error'));
    };

    window.currentSort = 'newest';
    window.currentTrades = [];

    function renderTrades() {
        const tradeList = document.getElementById('trade-list');
        if (!tradeList) return;
        
        let sortedTrades = [...window.currentTrades];
        if (window.currentSort === 'newest') {
            sortedTrades.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (window.currentSort === 'oldest') {
            sortedTrades.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (window.currentSort === 'rr') {
            sortedTrades.sort((a, b) => parseFloat(b.rr) - parseFloat(a.rr));
        } else if (window.currentSort === 'result') {
            sortedTrades.sort((a, b) => {
                if (a.result === b.result) return new Date(b.date) - new Date(a.date);
                return a.result === 'Profit' ? -1 : 1;
            });
        }

        tradeList.innerHTML = sortedTrades.length ? sortedTrades.map(t => {
            const isProfit = t.result === 'Profit';
            const rowClass = isProfit ? 'bg-green-50/20 hover:bg-green-50/60' : 'bg-red-50/20 hover:bg-red-50/60';
            const highlightClass = isProfit ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
            
            return `
            <tr class="transition-colors group ${rowClass}">
                <td class="px-6 py-4 whitespace-nowrap ${highlightClass}">${t.instrument}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-700">${t.strategy}</td>
                <td class="px-6 py-4 whitespace-nowrap ${highlightClass}">${t.rr}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${t.result}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${t.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="text-blue-500 hover:text-blue-700" onclick="editTrade(${t.id})" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                        </button>
                        <button class="text-red-500 hover:text-red-700" onclick="deleteTrade(${t.id})" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('') : '<tr><td colspan="6" class="text-gray-500 text-center p-8">No trades yet.</td></tr>';
    }

    function fetchTrades() {
        const tradeList = document.getElementById('trade-list');
        if (!tradeList) return;
        tradeList.innerHTML = '<tr><td colspan="6" class="text-center p-4">Loading trades...</td></tr>';
        
        fetch(`${API_BASE}/api/trades?userId=${userId}`)
            .then(res => res.json())
            .then(trades => {
                if (!Array.isArray(trades)) throw new Error('Invalid data');
                window.currentTrades = trades;
                renderTrades();
            }).catch(() => {
                tradeList.innerHTML = '<tr><td colspan="6" class="text-red-500 text-center p-4">Error loading trades.</td></tr>';
            });
    }
    fetchTrades();

    // Sort buttons listeners
    document.getElementById('sort-newest')?.addEventListener('click', () => { window.currentSort = 'newest'; renderTrades(); });
    document.getElementById('sort-oldest')?.addEventListener('click', () => { window.currentSort = 'oldest'; renderTrades(); });
    document.getElementById('sort-rr')?.addEventListener('click', () => { window.currentSort = 'rr'; renderTrades(); });
    document.getElementById('sort-result')?.addEventListener('click', () => { window.currentSort = 'result'; renderTrades(); });

    window.editingTradeId = null;

    document.getElementById('add-trade-btn')?.addEventListener('click', () => {
        const instrument = document.getElementById('instrument')?.value;
        const strategy = document.getElementById('strategy')?.value;
        const rr = document.getElementById('rr')?.value;
        const date = document.getElementById('calendar-date')?.value;
        
        let result = 'Profit';
        const profitBtn = document.getElementById('profit-btn');
        if (profitBtn && !profitBtn.classList.contains('active')) {
            const lossBtn = document.getElementById('loss-btn');
            if (lossBtn && lossBtn.classList.contains('active')) result = 'Loss';
        }
        
        if (!instrument || !strategy || !rr || !date) {
            return showNotification('Please fill in all fields', 'error');
        }

        const payload = { instrument, strategy, rr, date, result, userId };
        
        if (window.editingTradeId) {
            fetch(`${API_BASE}/api/trades/${window.editingTradeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(res => {
                if (res.ok) {
                    showNotification('Trade updated!', 'success');
                    window.editingTradeId = null;
                    document.getElementById('add-trade-btn').textContent = 'Add Trade';
                    fetchTrades();
                } else {
                    showNotification('Error updating trade', 'error');
                }
            }).catch(() => showNotification('Error updating trade', 'error'));
        } else {
            fetch(`${API_BASE}/api/trades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(res => {
                if (res.ok) {
                    showNotification('Trade added!', 'success');
                    fetchTrades();
                } else {
                    showNotification('Error adding trade', 'error');
                }
            }).catch(() => showNotification('Error adding trade', 'error'));
        }
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        fetch(`${API_BASE}/api/logout`, { method: 'POST' }).then(() => {
            sessionStorage.removeItem('userId');
            window.location.href = 'login-form.html';
        });
    });

    fetch(`${API_BASE}/api/user/profile-image`)
        .then(res => res.json())
        .then(data => {
            const img = document.getElementById('profileImage');
            if (img && data.imageUrl) img.src = data.imageUrl;
        }).catch(console.error);

});
