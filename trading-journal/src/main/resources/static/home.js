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
                if(stratSel) {
                    stratSel.innerHTML = strategies.map(o => `<option value="${o.value}" data-id="${o.id}">${o.value}</option>`).join('');
                    const defStrategy = localStorage.getItem(`default_strategy_${userId}`);
                    if (defStrategy) stratSel.value = defStrategy;
                }
                
                const filterStratSel = document.getElementById('filter-strategy');
                if(filterStratSel) {
                    filterStratSel.innerHTML = '<option value="all">All Strategies</option>' + strategies.map(o => `<option value="${o.value}" data-id="${o.id}">${o.value}</option>`).join('');
                    const defFilterStrategy = localStorage.getItem(`default_filter-strategy_${userId}`);
                    if (defFilterStrategy) {
                        filterStratSel.value = defFilterStrategy;
                        window.currentStrategyFilter = defFilterStrategy;
                    }
                }
                
                const rrSel = document.getElementById('rr');
                if(rrSel) rrSel.innerHTML = rrs.map(o => `<option value="${o.value}" data-id="${o.id}">${o.value}</option>`).join('');
            }).catch(console.error);

        fetch(`${API_BASE}/api/instruments`)
            .then(res => res.json())
            .then(data => {
                const instSel = document.getElementById('instrument');
                if(instSel) {
                    instSel.innerHTML = data.map(o => `<option value="${o.symbol || o.name}" data-id="${o.id}">${o.symbol || o.name}</option>`).join('');
                    const defInst = localStorage.getItem(`default_instrument_${userId}`);
                    if (defInst) instSel.value = defInst;
                }
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

        const starBtn = document.getElementById(`star-${idSuffix}`);
        if (starBtn) {
            starBtn.addEventListener('click', () => {
                const select = document.getElementById(selectId);
                if (select.selectedIndex === -1) return showNotification(`Select ${type} to set as default`, 'error');
                const opt = select.options[select.selectedIndex];
                localStorage.setItem(`default_${idSuffix}_${userId}`, opt.value);
                showNotification(`${type} default set to ${opt.value}`, 'success');
            });
        }
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
    window.currentStrategyFilter = 'all';
    window.currentPeriodFilter = 'all';
    window.currentTrades = [];
    window.currentPage = 1;
    
    const pageSizeSelect = document.getElementById('page-size-select');
    window.pageSize = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) : 10;

    function filterTradeByPeriod(tradeDate, period) {
        if (!tradeDate || !period || period === 'all') return true;

        const dateParts = tradeDate.split('-');
        if (dateParts.length < 3) return false;

        const trade = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        if (period === 'week') {
            const day = today.getDay();
            const diffToMonday = (day + 6) % 7;
            const weekStart = new Date(year, month, today.getDate() - diffToMonday);
            const weekEnd = new Date(year, month, weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            weekStart.setHours(0, 0, 0, 0);
            return trade >= weekStart && trade <= weekEnd;
        }

        if (period === 'month') {
            return trade.getFullYear() === year && trade.getMonth() === month;
        }

        if (period === 'custom') {
            const monthInput = document.getElementById('custom-month-picker');
            const chosen = monthInput && monthInput.value ? monthInput.value : null;
            if (!chosen) return true;
            const [targetYear, targetMonth] = chosen.split('-').map(Number);
            return trade.getFullYear() === targetYear && trade.getMonth() === (targetMonth - 1);
        }

        return true;
    }

    function renderTrades() {
        const tradeList = document.getElementById('trade-list');
        if (!tradeList) return;
        
        let processedTrades = [...window.currentTrades];
        
        if (window.currentStrategyFilter && window.currentStrategyFilter !== 'all') {
            processedTrades = processedTrades.filter(t => t.strategy === window.currentStrategyFilter);
        }

        if (window.currentPeriodFilter && window.currentPeriodFilter !== 'all') {
            processedTrades = processedTrades.filter(t => filterTradeByPeriod(t.date, window.currentPeriodFilter));
        }

        if (processedTrades.length > 0) {
            processedTrades = [...processedTrades].filter(t => t && t.date).sort((a, b) => {
                let pa = a.date.split('-');
                let pb = b.date.split('-');
                if(pa.length < 3 || pb.length < 3) return 0;
                return new Date(pa[0], pa[1]-1, pa[2]) - new Date(pb[0], pb[1]-1, pb[2]);
            });
            // Removed dummy trades insertion to fix pagination
        }

        let sortedTrades = processedTrades;
        if (window.currentSort === 'newest') {
            sortedTrades.sort((a, b) => {
                if (!a.date || !b.date) return 0;
                let pa = a.date.split('-');
                let pb = b.date.split('-');
                if(pa.length < 3 || pb.length < 3) return 0;
                return new Date(pb[0], pb[1]-1, pb[2]) - new Date(pa[0], pa[1]-1, pa[2]);
            });
        } else if (window.currentSort === 'oldest') {
            sortedTrades.sort((a, b) => {
                if (!a.date || !b.date) return 0;
                let pa = a.date.split('-');
                let pb = b.date.split('-');
                if(pa.length < 3 || pb.length < 3) return 0;
                return new Date(pa[0], pa[1]-1, pa[2]) - new Date(pb[0], pb[1]-1, pb[2]);
            });
        } else if (window.currentSort === 'rr') {
            sortedTrades.sort((a, b) => parseFloat(b.rr || 0) - parseFloat(a.rr || 0));
        } else if (window.currentSort === 'result') {
            sortedTrades.sort((a, b) => {
                if (a.result === b.result) {
                    if (!a.date || !b.date) return 0;
                    let pa = a.date.split('-');
                    let pb = b.date.split('-');
                    if(pa.length < 3 || pb.length < 3) return 0;
                    return new Date(pb[0], pb[1]-1, pb[2]) - new Date(pa[0], pa[1]-1, pa[2]);
                }
                return a.result === 'Profit' ? -1 : 1;
            });
        }

        const totalItems = sortedTrades.length;
        const totalPages = Math.ceil(totalItems / window.pageSize) || 1;
        if (window.currentPage > totalPages) window.currentPage = totalPages;
        if (window.currentPage < 1) window.currentPage = 1;

        const startIndex = (window.currentPage - 1) * window.pageSize;
        const endIndex = startIndex + window.pageSize;
        const pagedTrades = sortedTrades.slice(startIndex, endIndex);

        tradeList.innerHTML = pagedTrades.length ? pagedTrades.map(t => {
            const isProfit = t.result === 'Profit';
            const isLoss = t.result === 'Loss';
            const isDummy = t.isDummy;
            
            let rowClass = 'bg-gray-50/20 hover:bg-gray-50/60';
            let highlightClass = 'text-gray-600 font-bold';
            
            if (isProfit) {
                rowClass = 'bg-green-50/20 hover:bg-green-50/60';
                highlightClass = 'text-green-600 font-bold';
            } else if (isLoss) {
                rowClass = 'bg-red-50/20 hover:bg-red-50/60';
                highlightClass = 'text-red-600 font-bold';
            }
            
            let dateStr = t.date;
            if (t.date && t.date.includes('-')) {
                const parts = t.date.split('-');
                if (parts.length >= 3) {
                    const d = new Date(parts[0], parts[1] - 1, parts[2]);
                    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    dateStr = `${t.date} (${weekdays[d.getDay()]})`;
                }
            }

            let actionButtons = isDummy ? '' : `
                    <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="text-blue-500 hover:text-blue-700" onclick="editTrade(${t.id})" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                        </button>
                        <button class="text-red-500 hover:text-red-700" onclick="deleteTrade(${t.id})" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>
                        </button>
                    </div>`;

            let badge = isDummy ? '-' : `
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${t.result}
                    </span>`;

            return `
            <tr class="transition-colors group ${rowClass}">
                <td class="px-6 py-4 whitespace-nowrap ${highlightClass}">${t.instrument}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-700">${t.strategy}</td>
                <td class="px-6 py-4 whitespace-nowrap ${highlightClass}">${t.rr}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${badge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${dateStr}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    ${actionButtons}
                </td>
            </tr>
            `;
        }).join('') : '<tr><td colspan="6" class="text-gray-500 text-center p-8">No trades yet.</td></tr>';

        renderPaginationControls(totalItems, totalPages);
    }

    window.changePage = function(delta) {
        window.currentPage += delta;
        renderTrades();
    };

    function renderPaginationControls(totalItems, totalPages) {
        const controls = document.getElementById('pagination-controls');
        if (!controls) return;
        
        if (totalItems === 0) {
            controls.innerHTML = '';
            return;
        }

        const start = (window.currentPage - 1) * window.pageSize + 1;
        const end = Math.min(window.currentPage * window.pageSize, totalItems);

        let pageButtonsHTML = '';
        let startPage = Math.max(1, window.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === window.currentPage;
            const activeClass = isActive 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50';
            pageButtonsHTML += `<button data-page="${i}" class="page-num-btn px-4 py-2 border rounded font-medium shadow-sm transition-colors ${activeClass}">${i}</button>`;
        }

        controls.innerHTML = `
            <div class="text-sm text-slate-600 font-medium">
                Showing ${start} to ${end} of ${totalItems} trades
            </div>
            <div class="flex gap-2">
                <button id="prev-page-btn" ${window.currentPage === 1 ? 'disabled' : ''} class="px-4 py-2 bg-white border border-gray-300 rounded text-slate-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-colors">Previous</button>
                ${pageButtonsHTML}
                <button id="next-page-btn" ${window.currentPage === totalPages ? 'disabled' : ''} class="px-4 py-2 bg-white border border-gray-300 rounded text-slate-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-colors">Next</button>
            </div>
        `;
        
        const prevBtn = document.getElementById('prev-page-btn');
        if (prevBtn) prevBtn.addEventListener('click', () => { window.currentPage--; renderTrades(); });
        
        const nextBtn = document.getElementById('next-page-btn');
        if (nextBtn) nextBtn.addEventListener('click', () => { window.currentPage++; renderTrades(); });

        document.querySelectorAll('.page-num-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                window.currentPage = parseInt(e.target.getAttribute('data-page'), 10);
                renderTrades();
            });
        });
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
    document.getElementById('sort-newest')?.addEventListener('click', () => { window.currentSort = 'newest'; window.currentPage = 1; renderTrades(); });
    document.getElementById('sort-oldest')?.addEventListener('click', () => { window.currentSort = 'oldest'; window.currentPage = 1; renderTrades(); });
    document.getElementById('sort-rr')?.addEventListener('click', () => { window.currentSort = 'rr'; window.currentPage = 1; renderTrades(); });
    document.getElementById('sort-result')?.addEventListener('click', () => { window.currentSort = 'result'; window.currentPage = 1; renderTrades(); });

    document.getElementById('page-size-select')?.addEventListener('change', (e) => {
        window.pageSize = parseInt(e.target.value, 10);
        window.currentPage = 1;
        renderTrades();
    });

    document.getElementById('filter-strategy')?.addEventListener('change', (e) => {
        window.currentStrategyFilter = e.target.value;
        window.currentPage = 1;
        renderTrades();
    });

    const customMonthPicker = document.getElementById('custom-month-picker');
    const periodSelect = document.getElementById('filter-period');

    function syncCustomMonthVisibility() {
        const isCustom = periodSelect && periodSelect.value === 'custom';
        if (customMonthPicker) {
            customMonthPicker.classList.toggle('hidden', !isCustom);
            if (isCustom && !customMonthPicker.value) {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                customMonthPicker.value = `${year}-${month}`;
            }
        }
    }

    periodSelect?.addEventListener('change', (e) => {
        window.currentPeriodFilter = e.target.value;
        syncCustomMonthVisibility();
        window.currentPage = 1;
        renderTrades();
    });

    customMonthPicker?.addEventListener('change', (e) => {
        if (periodSelect && periodSelect.value === 'custom') {
            window.currentPeriodFilter = 'custom';
            window.currentPage = 1;
            renderTrades();
        }
    });

    document.getElementById('star-filter-strategy')?.addEventListener('click', () => {
        const select = document.getElementById('filter-strategy');
        const val = select.value;
        localStorage.setItem(`default_filter-strategy_${userId}`, val);
        showNotification(`Default filter strategy set to ${val === 'all' ? 'All' : val}`, 'success');
    });

    syncCustomMonthVisibility();

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
