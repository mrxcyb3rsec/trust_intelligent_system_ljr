/* ═══════════════════════════════════════════════════════════
   HUSH TRUST DASHBOARD - COMPLETE INTERACTIVE JS
   ═══════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════
// GLOBAL VARIABLES
// ═══════════════════════════════════════════════════════════
let trustScore = 100;
let riskLevel = 40;
let alerts = [];
let apps = [];
let isSimulation = false;
let auditLog = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Hushh Trust Dashboard initializing...');
    initializeDashboard();
    addToLog('Dashboard initialized');
});

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════
function initializeDashboard() {
    // Load initial data
    loadData();
    
    // Auto-refresh every 3 seconds
    setInterval(() => {
        if (!isSimulation) {
            loadData();
        }
    }, 3000);
    
    // Welcome message
    setTimeout(() => {
        console.log('✅ Dashboard ready!');
    }, 1000);
}

// Load data (with fallback if backend not available)
async function loadData() {
    try {
        const response = await fetch('/data');
        if (response.ok) {
            const data = await response.json();
            updateUI(data);
            return;
        }
    } catch (error) {
        console.log('📱 Using local data mode');
    }
    
    // Fallback: Use local data
    useLocalData();
    updateUIFromLocal();
}

// Local data fallback
function useLocalData() {
    apps = [
        {name: "Instagram", permissions: ["Contacts", "Photos"], risk: "High", last_accessed: "2 hours ago", status: true},
        {name: "Google Maps", permissions: ["Location"], risk: "Medium", last_accessed: "10 minutes ago", status: true},
        {name: "Spotify", permissions: ["Email"], risk: "Low", last_accessed: "1 day ago", status: true},
        {name: "Shopping App", permissions: ["Location", "Payment Info"], risk: "High", last_accessed: "5 hours ago", status: true},
        {name: "Health App", permissions: ["Health Data"], risk: "Medium", last_accessed: "1 hour ago", status: false},
        {name: "Banking", permissions: ["Financial Data"], risk: "High", last_accessed: "30 minutes ago", status: false}
    ];
    alerts = [];
    calculateScores();
}

// Calculate trust and risk scores
function calculateScores() {
    trustScore = 100;
    let activeHighRisk = 0;
    let activeMediumRisk = 0;
    
    apps.forEach(app => {
        if (app.status) {
            if (app.risk === "High") {
                trustScore -= 15;
                activeHighRisk++;
            } else if (app.risk === "Medium") {
                trustScore -= 8;
                activeMediumRisk++;
            }
        }
    });
    
    trustScore = Math.max(0, trustScore);
    
    // Risk calculation
    riskLevel = (activeHighRisk * 20) + (activeMediumRisk * 10) + (alerts.length * 15);
    riskLevel = Math.min(100, riskLevel);
    
    // Generate alerts based on active apps
    updateAlertsFromApps(activeHighRisk);
}

function updateAlertsFromApps(highRiskCount) {
    alerts = [];
    
    if (highRiskCount > 1) {
        alerts.push({type: 'danger', title: 'Multiple High-Risk Apps', message: `${highRiskCount} apps with high-risk permissions are active`});
    }
    
    apps.forEach(app => {
        if (app.status && app.risk === "High") {
            if (app.permissions.includes("Location")) {
                alerts.push({type: 'warning', title: 'Location Access', message: `${app.name} has access to your location`});
            }
            if (app.permissions.includes("Payment Info")) {
                alerts.push({type: 'danger', title: 'Payment Data Risk', message: `${app.name} has access to payment information`});
            }
        }
    });
}

// ═══════════════════════════════════════════════════════════
// UI UPDATE FUNCTIONS
// ═══════════════════════════════════════════════════════════
function updateUI(data) {
    trustScore = data.trust_score;
    riskLevel = data.risk_score;
    apps = data.apps;
    alerts = data.alerts || [];
    
    // Update Trust Score
    document.getElementById('score').textContent = trustScore;
    
    // Update Trust Circle
    const trustCircle = document.getElementById('trustCircle');
    const circumference = 264;
    const offset = circumference - (trustScore / 100) * circumference;
    trustCircle.style.strokeDashoffset = offset;
    
    // Color based on score
    const scoreColor = trustScore > 70 ? '#22c55e' : trustScore > 40 ? '#f59e0b' : '#ef4444';
    document.querySelector('.score-text span').style.color = scoreColor;
    
    // Update Risk
    document.getElementById('risk').textContent = riskLevel + '%';
    const riskFill = document.getElementById('riskFill');
    riskFill.style.width = (100 - riskLevel) + '%';
    
    const riskMarker = document.getElementById('riskMarker');
    riskMarker.style.left = riskLevel + '%';
    
    // Risk status
    updateRiskStatus(riskLevel);
    
    // Update Alerts
    updateAlerts(alerts);
    
    // Update Insights
    updateInsights(data.reasons);
    
    // Update System Action
    updateAction(data.action);
    
    // Update Apps
    renderApps(apps);
    
    // Update body status for visual effects
    updateBodyStatus(riskLevel);
}

function updateUIFromLocal() {
    calculateScores();
    
    document.getElementById('score').textContent = trustScore;
    document.getElementById('risk').textContent = riskLevel + '%';
    
    // Update trust circle
    const trustCircle = document.getElementById('trustCircle');
    const circumference = 264;
    const offset = circumference - (trustScore / 100) * circumference;
    trustCircle.style.strokeDashoffset = offset;
    
    const scoreColor = trustScore > 70 ? '#22c55e' : trustScore > 40 ? '#f59e0b' : '#ef4444';
    document.querySelector('.score-text span').style.color = scoreColor;
    
    // Update risk bar
    const riskFill = document.getElementById('riskFill');
    riskFill.style.width = (100 - riskLevel) + '%';
    const riskMarker = document.getElementById('riskMarker');
    riskMarker.style.left = riskLevel + '%';
    
    updateRiskStatus(riskLevel);
    updateAlerts(alerts);
    updateInsightsLocal();
    updateAction('✅ SYSTEM NORMAL');
    renderApps(apps);
    updateBodyStatus(riskLevel);
}

function updateRiskStatus(risk) {
    const riskStatus = document.getElementById('riskStatus');
    if (risk < 50) {
        riskStatus.style.color = '#22c55e';
        riskStatus.style.background = 'rgba(34, 197, 94, 0.15)';
        riskStatus.innerHTML = '<i class="bi bi-check-circle-fill"></i><span>System Normal</span>';
    } else if (risk < 80) {
        riskStatus.style.color = '#f59e0b';
        riskStatus.style.background = 'rgba(245, 158, 11, 0.15)';
        riskStatus.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i><span>Warning</span>';
    } else {
        riskStatus.style.color = '#ef4444';
        riskStatus.style.background = 'rgba(239, 68, 68, 0.15)';
        riskStatus.innerHTML = '<i class="bi bi-x-circle-fill"></i><span>Critical</span>';
    }
}

function updateBodyStatus(risk) {
    document.body.classList.remove('safe', 'warning', 'danger');
    if (risk < 50) {
        document.body.classList.add('safe');
    } else if (risk < 80) {
        document.body.classList.add('warning');
    } else {
        document.body.classList.add('danger');
    }
}

// Update alerts display
function updateAlerts(alertsList) {
    const alertsContainer = document.getElementById('alerts');
    const alertCount = document.getElementById('alertCount');
    
    const count = Array.isArray(alertsList) ? alertsList.length : 0;
    alertCount.textContent = count;
    
    if (count === 0) {
        alertsContainer.innerHTML = `
            <div class="empty-alert">
                <i class="bi bi-shield-check"></i>
                <p>All systems secure. No active alerts.</p>
            </div>
        `;
    } else {
        const alertsArray = Array.isArray(alertsList) ? alertsList : [];
        alertsContainer.innerHTML = alertsArray.map((alert, idx) => {
            const alertType = typeof alert === 'string' ? 
                (alert.includes('Location') ? 'warning' : 'danger') : 
                (alert.type || 'danger');
            
            return `
            <div class="alert-item ${alertType}" style="animation-delay: ${idx * 0.1}s">
                <div class="alert-icon-box">
                    <i class="bi ${getAlertIcon(alert)}"></i>
                </div>
                <div class="alert-content">
                    <h5>${typeof alert === 'string' ? alert : alert.title}</h5>
                    <p>Detected ${idx + 1} minute(s) ago</p>
                </div>
            </div>
        `}).join('');
    }
}

function getAlertIcon(alert) {
    const alertStr = typeof alert === 'string' ? alert : alert.title || '';
    if (alertStr.includes('Location')) return 'bi-geo-alt-fill';
    if (alertStr.includes('Payment')) return 'bi-credit-card-fill';
    if (alertStr.includes('High-Risk')) return 'bi-exclamation-triangle-fill';
    return 'bi-bell-fill';
}

// Update insights
function updateInsights(reasons) {
    const insightsContainer = document.getElementById('reasons');
    const insights = [];
    
    // Generate insights based on scores
    if (trustScore >= 80) {
        insights.push({icon: 'check-circle-fill', type: 'good', title: 'Strong Protection', desc: 'Trust score is excellent. Your data is well protected.'});
    } else if (trustScore >= 60) {
        insights.push({icon: 'info-circle-fill', type: 'warn', title: 'Moderate Protection', desc: 'Consider reviewing app permissions for better security.'});
    } else {
        insights.push({icon: 'exclamation-circle-fill', type: 'danger', title: 'Low Protection', desc: 'High-risk apps are accessing your data. Take action now!'});
    }
    
    if (riskLevel < 30) {
        insights.push({icon: 'check-circle-fill', type: 'good', title: 'Low Risk', desc: 'No suspicious activities detected.'});
    } else if (riskLevel > 70) {
        insights.push({icon: 'exclamation-circle-fill', type: 'danger', title: 'High Risk', desc: 'Multiple threat vectors detected. Immediate action recommended!'});
    }
    
    // Add reasons from backend
    if (reasons && reasons.length > 0) {
        reasons.forEach(reason => {
            insights.push({icon: 'info-circle-fill', type: 'warn', title: 'Analysis', desc: reason});
        });
    }
    
    renderInsights(insights);
}

function updateInsightsLocal() {
    const insightsContainer = document.getElementById('reasons');
    const insights = [];
    
    const activeApps = apps.filter(a => a.status).length;
    
    if (trustScore >= 80) {
        insights.push({icon: 'check-circle-fill', type: 'good', title: 'Strong Protection', desc: `Trust score is ${trustScore}%. Your data is well protected.`});
    } else if (trustScore >= 60) {
        insights.push({icon: 'info-circle-fill', type: 'warn', title: 'Moderate Protection', desc: `${activeApps} apps have access. Consider reducing permissions.`});
    } else {
        insights.push({icon: 'exclamation-circle-fill', type: 'danger', title: 'Low Protection', desc: 'High-risk apps have access. Revoke permissions immediately!'});
    }
    
    if (alerts.length === 0) {
        insights.push({icon: 'check-circle-fill', type: 'good', title: 'No Alerts', desc: 'All systems secure.'});
    } else {
        insights.push({icon: 'exclamation-circle-fill', type: 'danger', title: `${alerts.length} Active Alerts`, desc: 'Review alerts below and take action.'});
    }
    
    renderInsights(insights);
}

function renderInsights(insights) {
    const container = document.getElementById('reasons');
    container.innerHTML = insights.map(insight => `
        <div class="insight-box">
            <div class="insight-icon ${insight.type}">
                <i class="bi ${insight.icon}"></i>
            </div>
            <div class="insight-text">
                <h5>${insight.title}</h5>
                <p>${insight.desc}</p>
            </div>
        </div>
    `).join('');
}

// Update action box
function updateAction(action) {
    const actionBox = document.getElementById('action');
    actionBox.innerHTML = `<i class="bi bi-robot"></i><span>${action}</span>`;
}

// Render apps
function renderApps(appsList) {
    const appsContainer = document.getElementById('apps');
    appsContainer.innerHTML = appsList.map((app, idx) => `
        <div class="app-card ${app.status ? '' : 'revoked'}" onclick="toggleAppPermission(${idx})">
            <div class="app-icon-box">
                <i class="bi ${getAppIcon(app.name)}"></i>
            </div>
            <div class="app-details">
                <h5>${app.name}</h5>
                <span>${app.permissions.join(', ')}</span>
            </div>
            <span class="app-risk ${app.risk.toLowerCase()}">${app.risk}</span>
        </div>
    `).join('');
}

function getAppIcon(appName) {
    const icons = {
        'Instagram': 'bi-instagram',
        'Google Maps': 'bi-geo-alt',
        'Spotify': 'bi-music-note-beamed',
        'Shopping App': 'bi-bag-fill',
        'Health App': 'bi-heart-pulse',
        'Banking': 'bi-bank'
    };
    return icons[appName] || 'bi-app';
}

// ═══════════════════════════════════════════════════════════
// USER ACTIONS
// ═══════════════════════════════════════════════════════════

// Toggle app permission
function toggleAppPermission(index) {
    apps[index].status = !apps[index].status;
    const action = apps[index].status ? 'granted to' : 'revoked from';
    showActionResult(`✅ Permission ${action} ${apps[index].name}`);
    addToLog(`Permission ${action} ${apps[index].name}`);
    updateUIFromLocal();
}

// Revoke all consent
function revokeAllConsent() {
    apps.forEach(app => app.status = false);
    showActionResult('🚫 All data consents have been revoked!');
    addToLog('All consents revoked');
    updateUIFromLocal();
    addBotMessage("I've revoked all data sharing permissions. Your apps now have zero access to your personal data. Your trust score is now at maximum!");
}

// Manage all permissions
function manageAllPermissions() {
    showActionResult('🔧 Opening permission manager... Use the toggles to grant or revoke access.');
    addBotMessage("Click on any app card to toggle its permission. High-risk apps are marked with their risk level.");
}

// Quick actions
function quickAction(action) {
    if (action === 'encrypt') {
        showActionResult('🔐 Data encryption activated. All your data is now encrypted.');
        addToLog('Data encryption enabled');
    } else if (action === 'audit') {
        showActionResult(`📋 Viewing audit log. ${auditLog.length} entries recorded.`);
    }
}

// Refresh insights
function refreshInsights() {
    updateInsightsLocal();
    showActionResult('🔄 Insights refreshed');
    addToLog('Insights refreshed');
}

// ═══════════════════════════════════════════════════════════
// SIMULATION FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function simulateAttack(type) {
    isSimulation = true;
    addToLog(`Attack simulation: ${type}`);
    
    const attackTypes = {
        phishing: {title: 'Phishing Attack', message: 'Suspicious email detected attempting to steal credentials'},
        breach: {title: 'Data Breach', message: 'Unauthorized attempt to access your personal data'},
        unauthorized: {title: 'Unauthorized Access', message: 'Login attempt from unrecognized device'},
        malware: {title: 'Malware Attempt', message: 'Malicious software detected attempting to infiltrate system'}
    };
    
    const attack = attackTypes[type];
    
    // Add alert
    alerts.push({type: 'danger', title: attack.title, message: attack.message});
    
    // Increase risk, decrease trust
    riskLevel = Math.min(100, riskLevel + 25);
    trustScore = Math.max(0, trustScore - 20);
    
    // Update UI
    updateUIFromLocal();
    
    // Show response
    if (riskLevel > 70) {
        showActionResult('🛡️ THREAT DETECTED - AUTO RESPONSE ACTIVATED');
    } else {
        showActionResult(`🛡️ DEFENSE ACTIVATED: ${attack.title} detected and neutralized`);
    }
    
    addBotMessage(`⚠️ Security Alert: ${attack.title}. ${attack.message}. I've logged this event and your system has automatically responded.`);
    
    // Try to notify backend if available
    try {
        await fetch('/simulate');
    } catch (e) {}
}

// Reset system
async function resetSystem() {
    isSimulation = false;
    alerts = [];
    riskLevel = 40;
    trustScore = 100;
    
    // Reset app statuses
    apps = apps.map(app => ({...app, status: true}));
    apps[3].status = false;  // Shopping app off
    apps[4].status = false;  // Health app off
    apps[5].status = false;  // Banking off
    
    showActionResult('🔄 System reset complete. All threats cleared. Trust score restored!');
    addToLog('System reset');
    updateUIFromLocal();
    addBotMessage("System has been reset to default state. Your trust score is now at 100% and all threats have been cleared.");
    
    try {
        await fetch('/reset');
    } catch (e) {}
}

// Show action result
function showActionResult(message) {
    const actionBox = document.getElementById('action');
    actionBox.innerHTML = `<i class="bi bi-robot"></i><span>${message}</span>`;
    actionBox.style.animation = 'none';
    setTimeout(() => actionBox.style.animation = 'pulse 2s infinite', 10);
}

// ═══════════════════════════════════════════════════════════
// AI CHAT FUNCTIONS
// ═══════════════════════════════════════════════════════════

function handleEnter(event) {
    if (event.key === 'Enter') {
        askAI();
    }
}

function askAI() {
    const questionInput = document.getElementById('question');
    const question = questionInput.value.trim();
    
    if (!question) return;
    
    addUserMessage(question);
    questionInput.value = '';
    addToLog(`User asked: ${question}`);
    
    setTimeout(() => {
        const response = generateAIResponse(question);
        addBotMessage(response);
        addToLog(`AI responded: ${response.substring(0, 50)}...`);
    }, 600);
}

function addUserMessage(message) {
    const chatHistory = document.getElementById('chatHistory');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'msg user-msg';
    msgDiv.innerHTML = `<div class="msg-content"><p>${message}</p></div>`;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function addBotMessage(message) {
    const chatHistory = document.getElementById('chatHistory');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'msg bot-msg';
    msgDiv.innerHTML = `
        <div class="msg-content">
            <i class="bi bi-robot"></i>
            <p>${message}</p>
        </div>
    `;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function clearChat() {
    const chatHistory = document.getElementById('chatHistory');
    chatHistory.innerHTML = `
        <div class="msg bot-msg">
            <div class="msg-content">
                <i class="bi bi-robot"></i>
                <p>Chat cleared! How can I help you with your data privacy?</p>
            </div>
        </div>
    `;
    addToLog('Chat cleared');
}

function generateAIResponse(question) {
    const q = question.toLowerCase();
    
    // Trust score related
    if (q.includes('trust') || q.includes('score')) {
        return `Your current trust score is <strong>${trustScore}/100</strong>. It's calculated based on:<br>• Number of apps with data access<br>• Risk level of those apps<br>• Active security alerts<br><br>Higher score = better data protection! 🔒`;
    }
    
    // Risk related
    if (q.includes('risk')) {
        return `Current risk level is <strong>${riskLevel}%</strong>. ${riskLevel < 30 ? '✅ This is healthy! Your data is well protected.' : '⚠️ We recommend reviewing your app permissions to reduce risk.'}<br><br>Risk is calculated based on active high-risk apps and security alerts.`;
    }
    
    // Permissions related
    if (q.includes('permission') || q.includes('app')) {
        const active = apps.filter(a => a.status).length;
        const highRisk = apps.filter(a => a.status && a.risk === 'High').length;
        return `You have <strong>${active} apps</strong> with active data permissions, of which <strong>${highRisk}</strong> are high-risk.<br><br>Click on any app card to toggle its permission. High-risk apps are marked in red.`;
    }
    
    // Data export related
    if (q.includes('export') || q.includes('download')) {
        return "You can export your data using the buttons below the simulation section. Choose JSON for structured data or CSV for spreadsheets. Your data belongs to you! 📥";
    }
    
    // Consent related
    if (q.includes('consent') || q.includes('revoke')) {
        return "You have full control over your data consent! Click 'Revoke All' to remove all permissions instantly, or click individual apps to toggle their access. That's the Hushh promise - your data, your rules! ✅";
    }
    
    // Privacy related
    if (q.includes('privacy') || q.includes('protect')) {
        return "Hushh ensures your privacy through:<br>• <strong>Revocable consent</strong> - You can remove access anytime<br>• <strong>Transparent data use</strong> - See exactly what apps access<br>• <strong>User control</strong> - You're always in command<br><br>Your data is encrypted and you control who sees it! 🔐";
    }
    
    // Delete related
    if (q.includes('delete') || q.includes('remove')) {
        return "To remove data access, simply click on any app card to revoke its permission. Use 'Revoke All' to remove all access at once. Your data remains yours - you can also export it or request deletion anytime.";
    }
    
    // Help
    if (q.includes('help')) {
        return "I can help you understand:<br>• Your <strong>trust score</strong> and what it means<br>• Your <strong>risk level</strong> and how to reduce it<br>• Which <strong>apps</strong> have access to your data<br>• How to <strong>revoke consent</strong><br>• How to <strong>export</strong> your data<br><br>What would you like to know?";
    }
    
    // Greetings
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('hey')) {
        return "Hello! 👋 I'm your Hushh privacy assistant. I'm here to help you understand and control your data. Ask me about your trust score, risk level, app permissions, or privacy settings!";
    }
    
    // Default
    return "That's a great question! I can help you understand your trust score, manage app permissions, learn about privacy features, or explain risk assessments. What would you like to know?";
}

// ═══════════════════════════════════════════════════════════
// DATA EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════

function exportData(format) {
    const data = {
        exportDate: new Date().toISOString(),
        trustScore: trustScore,
        riskLevel: riskLevel,
        apps: apps,
        alerts: alerts,
        auditLog: auditLog
    };
    
    if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hushh_data_export.json';
        a.click();
        showActionResult('📥 Data exported as JSON!');
    } else if (format === 'csv') {
        let csv = 'App Name,Permissions,Risk,Status\n';
        apps.forEach(app => {
            csv += `${app.name},"${app.permissions.join(', ')}",${app.risk},${app.status ? 'Active' : 'Revoked'}\n`;
        });
        const blob = new Blob([csv], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hushh_permissions.csv';
        a.click();
        showActionResult('📥 Data exported as CSV!');
    }
    
    addToLog(`Data exported as ${format.toUpperCase()}`);
    addBotMessage("Your data has been exported. You now have a copy of all your permission settings and audit history!");
}

function viewAuditLog() {
    if (auditLog.length === 0) {
        showActionResult('📋 Audit log is empty. Start interacting with the dashboard to record events.');
    } else {
        showActionResult(`📋 Audit Log: ${auditLog.length} entries. Latest: ${auditLog[auditLog.length - 1]}`);
    }
    addBotMessage(`Your audit log contains ${auditLog.length} entries tracking all your interactions with the dashboard. This ensures full transparency!`);
}

function addToLog(action) {
    const timestamp = new Date().toLocaleString();
    auditLog.push({timestamp, action});
}

// Console log for debugging
console.log('%c🚀 Hushh Trust Dashboard Loaded!', 'color: #22d3ee; font-size: 16px; font-weight: bold;');
console.log('%cYour data. Your control. Your privacy.', 'color: #6366f1; font-size: 12px;');
