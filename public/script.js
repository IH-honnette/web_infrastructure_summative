// Global variables
let map = null;
let currentResults = null;

// DOM elements
const ipInput = document.getElementById('ipInput');
const checkIpBtn = document.getElementById('checkIpBtn');
const checkMyIpBtn = document.getElementById('checkMyIpBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsSection = document.getElementById('resultsSection');
const closeResults = document.getElementById('closeResults');
const historyFilter = document.getElementById('historyFilter');
const clearHistory = document.getElementById('clearHistory');
const historyList = document.getElementById('historyList');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    checkIpBtn.addEventListener('click', checkIpAddress);
    checkMyIpBtn.addEventListener('click', checkMyIp);
    closeResults.addEventListener('click', hideResults);
    historyFilter.addEventListener('change', loadHistory);
    clearHistory.addEventListener('click', clearHistoryData);
    ipInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkIpAddress();
        }
    });
    
    // Load initial data
    loadHistory();
    loadStats();
});

// API Functions
async function checkIpAddress() {
    const ipAddress = ipInput.value.trim();
    
    if (!ipAddress) {
        showError('Please enter an IP address');
        return;
    }
    
    // Basic IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ipAddress)) {
        showError('Please enter a valid IPv4 address');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`/api/ip/${ipAddress}`);
        const data = await response.json();
        
        if (data.success) {
            displayResults(data.data);
            loadHistory();
            loadStats();
        } else {
            showError(data.message || 'Failed to fetch IP information');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function checkMyIp() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/my-ip');
        const data = await response.json();
        
        if (data.success) {
            ipInput.value = data.clientIP;
            displayResults(data.data);
            loadHistory();
            loadStats();
        } else {
            showError(data.message || 'Failed to fetch your IP information');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function loadHistory() {
    try {
        const filter = historyFilter.value;
        const url = filter ? `/api/history?filter=${filter}` : '/api/history';
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayHistory(data.data);
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
            displayStats(data.data);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Display Functions
function displayResults(data) {
    currentResults = data;
    
    // Update IP details
    document.getElementById('ipAddress').textContent = data.ip || '-';
    document.getElementById('ipType').textContent = data.type || '-';
    document.getElementById('location').textContent = formatLocation(data);
    document.getElementById('country').textContent = formatCountry(data);
    document.getElementById('organization').textContent = formatOrganization(data);
    document.getElementById('timezone').textContent = formatTimezone(data);
    document.getElementById('currency').textContent = formatCurrency(data);
    document.getElementById('continent').textContent = formatContinent(data);
    
    // Update security status
    updateSecurityStatus(data);
    
    // Update security analysis
    updateSecurityAnalysis(data);
    
    // Update privacy tips
    updatePrivacyTips(data);
    
    // Initialize map
    initializeMap(data);
    
    // Show results
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function updateSecurityStatus(data) {
    const securityBadge = document.getElementById('securityBadge');
    const security = data.security || {};
    let status = 'safe';
    let text = 'Safe';
    let icon = 'fas fa-shield-alt';
    
    if (security.tor) {
        status = 'danger';
        text = 'TOR Network Detected';
        icon = 'fas fa-user-secret';
    } else if (security.vpn || security.proxy) {
        status = 'warning';
        text = 'VPN/Proxy Detected';
        icon = 'fas fa-network-wired';
    }
    
    securityBadge.className = `security-badge ${status}`;
    securityBadge.innerHTML = `<i class="${icon}"></i><span>${text}</span>`;
}

function updateSecurityAnalysis(data) {
    const security = data.security || {};
    
    // Proxy status
    updateSecurityItem('proxyStatus', security.proxy, 'Proxy');
    
    // VPN status
    updateSecurityItem('vpnStatus', security.vpn, 'VPN');
    
    // TOR status
    updateSecurityItem('torStatus', security.tor, 'TOR Network');
    
    // Hosting status
    updateSecurityItem('hostingStatus', security.hosting, 'Hosting');
}

function updateSecurityItem(elementId, isDetected, label) {
    const element = document.getElementById(elementId);
    const indicator = element.querySelector('.status-indicator');
    
    // Remove existing classes
    element.classList.remove('safe', 'warning', 'danger');
    indicator.classList.remove('safe', 'warning', 'danger');
    
    if (isDetected) {
        element.classList.add('danger');
        indicator.classList.add('danger');
        element.querySelector('.security-label').textContent = `${label} - Detected`;
    } else {
        element.classList.add('safe');
        indicator.classList.add('safe');
        element.querySelector('.security-label').textContent = `${label} - Not Detected`;
    }
}

function updatePrivacyTips(data) {
    const tipsContainer = document.getElementById('privacyTips');
    const security = data.security || {};
    const tips = [];
    
    if (security.tor) {
        tips.push({
            icon: 'fas fa-user-secret',
            text: 'This IP is using the TOR network. While this provides anonymity, it may be flagged by some services.',
            type: 'warning'
        });
    } else if (security.vpn || security.proxy) {
        tips.push({
            icon: 'fas fa-network-wired',
            text: 'This IP appears to be using a VPN or proxy. This can help protect privacy but may affect service access.',
            type: 'info'
        });
    } else {
        tips.push({
            icon: 'fas fa-shield-alt',
            text: 'This appears to be a regular IP address. Consider using a VPN for enhanced privacy.',
            type: 'safe'
        });
    }
    
    tips.push({
        icon: 'fas fa-globe',
        text: `Your location is visible as ${formatLocation(data)}. Be aware of what information you share online.`,
        type: 'info'
    });
    
    if (data.connection?.org) {
        tips.push({
            icon: 'fas fa-building',
            text: `Your ISP is ${data.connection.org}. They can see your online activity.`,
            type: 'info'
        });
    }
    
    if (security.hosting) {
        tips.push({
            icon: 'fas fa-server',
            text: 'This IP is associated with hosting services. Be extra cautious with sensitive data.',
            type: 'warning'
        });
    }
    
    tips.push({
        icon: 'fas fa-lock',
        text: 'Use HTTPS websites, enable two-factor authentication, and regularly review your privacy settings.',
        type: 'safe'
    });
    
    tipsContainer.innerHTML = tips.map(tip => `
        <div class="tip-item">
            <i class="${tip.icon}"></i>
            <span>${tip.text}</span>
        </div>
    `).join('');
}

function initializeMap(data) {
    if (!data.latitude || !data.longitude) {
        document.getElementById('map').innerHTML = '<p style="text-align: center; padding: 20px; color: #718096;">Location data not available</p>';
        return;
    }
    
    // Destroy existing map if it exists
    if (map) {
        map.remove();
    }
    
    // Create new map
    map = L.map('map').setView([data.latitude, data.longitude], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add marker
    const marker = L.marker([data.latitude, data.longitude]).addTo(map);
    
    // Add popup with location info
    const popupContent = `
        <div style="text-align: center;">
            <strong>${formatLocation(data)}</strong><br>
            ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}
        </div>
    `;
    marker.bindPopup(popupContent);
}

function displayHistory(history) {
    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; padding: 20px; color: #718096;">No search history available</p>';
        return;
    }
    
    historyList.innerHTML = history.map(item => {
        const security = item.result.security || {};
        let status = 'safe';
        let statusText = 'Safe';
        
        if (security.tor) {
            status = 'tor';
            statusText = 'TOR';
        } else if (security.vpn || security.proxy) {
            status = 'proxy';
            statusText = security.vpn ? 'VPN' : 'Proxy';
        }
        
        const location = formatLocation(item.result);
        const time = new Date(item.timestamp).toLocaleString();
        
        return `
            <div class="history-item ${status}" onclick="loadHistoryItem('${item.ip}')">
                <div class="history-info">
                    <div class="history-ip">${item.ip}</div>
                    <div class="history-location">${location}</div>
                    <div class="history-time">${time}</div>
                </div>
                <div class="history-status ${status}">${statusText}</div>
            </div>
        `;
    }).join('');
}

function displayStats(stats) {
    document.getElementById('totalSearches').textContent = stats.totalSearches;
    document.getElementById('safeCount').textContent = stats.safeCount;
    document.getElementById('proxyCount').textContent = stats.proxyCount + stats.vpnCount;
    document.getElementById('torCount').textContent = stats.torCount;
}

// Utility Functions
function formatLocation(data) {
    const city = data.city;
    const country = data.country;
    
    if (city && country) {
        return `${city}, ${country}`;
    } else if (city) {
        return city;
    } else if (country) {
        return country;
    }
    return 'Unknown';
}

function formatCountry(data) {
    const country = data.country;
    const flag = data.flag;
    
    if (country && flag?.emoji) {
        return `${flag.emoji} ${country}`;
    } else if (country) {
        return country;
    }
    return 'Unknown';
}

function formatOrganization(data) {
    const connection = data.connection;
    if (connection?.org) {
        return connection.org;
    }
    return 'Unknown';
}

function formatTimezone(data) {
    const timezone = data.timezone;
    if (timezone?.id) {
        return timezone.id;
    }
    return 'Unknown';
}

function formatCurrency(data) {
    const currency = data.currency;
    if (currency?.name && currency?.symbol) {
        return `${currency.symbol} ${currency.name}`;
    } else if (currency?.name) {
        return currency.name;
    }
    return 'Unknown';
}

function formatContinent(data) {
    const continent = data.continent;
    if (continent) {
        return continent;
    }
    return 'Unknown';
}

function loadHistoryItem(ip) {
    ipInput.value = ip;
    checkIpAddress();
}

function clearHistoryData() {
    if (confirm('Are you sure you want to clear all search history?')) {
        // In a real application, you would call an API to clear history
        // For now, we'll just reload the page
        location.reload();
    }
}

// Copy to clipboard function
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(elementId);
        }).catch(() => {
            fallbackCopyTextToClipboard(text, elementId);
        });
    } else {
        fallbackCopyTextToClipboard(text, elementId);
    }
}

function fallbackCopyTextToClipboard(text, elementId) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess(elementId);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    
    document.body.removeChild(textArea);
}

function showCopySuccess(elementId) {
    const copyBtn = document.querySelector(`#${elementId}`).nextElementSibling;
    const originalIcon = copyBtn.innerHTML;
    
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    copyBtn.style.color = '#48bb78';
    
    setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
        copyBtn.style.color = '#718096';
    }, 2000);
}

// UI Functions
function showLoading(show) {
    if (show) {
        loadingIndicator.classList.remove('hidden');
        checkIpBtn.disabled = true;
        checkMyIpBtn.disabled = true;
    } else {
        loadingIndicator.classList.add('hidden');
        checkIpBtn.disabled = false;
        checkMyIpBtn.disabled = false;
    }
}

function hideResults() {
    resultsSection.classList.add('hidden');
    if (map) {
        map.remove();
        map = null;
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorModal.classList.remove('hidden');
}

function closeErrorModal() {
    errorModal.classList.add('hidden');
}

// Close modal when clicking outside
errorModal.addEventListener('click', function(e) {
    if (e.target === errorModal) {
        closeErrorModal();
    }
});

// Close results when clicking escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideResults();
        closeErrorModal();
    }
}); 