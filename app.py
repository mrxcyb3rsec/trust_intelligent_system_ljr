from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import random
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# ═══════════════════════════════════════════════════════════
# GLOBAL STATES
# ═══════════════════════════════════════════════════════════
simulation_mode = False
dynamic_risk = 40
trust_score = 100

# ═══════════════════════════════════════════════════════════
# DATA
# ═══════════════════════════════════════════════════════════
def load_data():
    return {
        "apps": [
            {"name": "Instagram", "permissions": ["Contacts", "Photos"], "risk": "High", "last_accessed": "2 hours ago", "status": True},
            {"name": "Google Maps", "permissions": ["Location"], "risk": "Medium", "last_accessed": "10 minutes ago", "status": True},
            {"name": "Spotify", "permissions": ["Email"], "risk": "Low", "last_accessed": "1 day ago", "status": True},
            {"name": "Shopping App", "permissions": ["Location", "Payment Info"], "risk": "High", "last_accessed": "5 hours ago", "status": False},
            {"name": "Health App", "permissions": ["Health Data"], "risk": "Medium", "last_accessed": "1 hour ago", "status": False},
            {"name": "Banking", "permissions": ["Financial Data"], "risk": "High", "last_accessed": "30 minutes ago", "status": False}
        ]
    }

# ═══════════════════════════════════════════════════════════
# TRUST SCORE CALCULATION
# ═══════════════════════════════════════════════════════════
def calculate_score(apps):
    score = 100
    for app in apps:
        if app.get("status", False):
            if app["risk"] == "High":
                score -= 15
            elif app["risk"] == "Medium":
                score -= 8
    return max(score, 0)

# ═══════════════════════════════════════════════════════════
# ALERT SYSTEM
# ═══════════════════════════════════════════════════════════
def generate_alerts(apps):
    alerts = []
    high_risk_active = [a for a in apps if a.get("status", False) and a["risk"] == "High"]
    
    if len(high_risk_active) > 1:
        alerts.append("⚠️ Multiple high-risk apps connected")
    
    for app in apps:
        if app.get("status", False):
            if "Location" in app["permissions"]:
                alerts.append(f"📍 {app['name']} is accessing your location")
            if "Payment Info" in app["permissions"]:
                alerts.append(f"💳 {app['name']} has payment access")
    
    return alerts

# ═══════════════════════════════════════════════════════════
# AI EXPLANATION
# ═══════════════════════════════════════════════════════════
def generate_explanation(risk):
    reasons = []
    if risk > 50:
        reasons.append("Unusual app behavior detected")
    if risk > 65:
        reasons.append("Multiple high-risk permissions active")
    if risk > 80:
        reasons.append("Critical threat pattern identified")
    if risk < 30:
        reasons.append("All systems operating normally")
    return reasons

# ═══════════════════════════════════════════════════════════
# AUTO RESPONSE
# ═══════════════════════════════════════════════════════════
def auto_response(risk):
    if risk > 80:
        return "🔒 AUTO LOCK ACTIVATED - Critical threat detected"
    elif risk > 60:
        return "⚠️ RECOMMEND ENABLE MFA - Elevated risk detected"
    else:
        return "✅ SYSTEM NORMAL - All data relationships secure"

# ═══════════════════════════════════════════════════════════
# MAIN API - GET ALL DATA
# ═══════════════════════════════════════════════════════════
@app.route("/data")
def data():
    global dynamic_risk, simulation_mode, trust_score
    
    data = load_data()
    apps = data["apps"]
    
    # Calculate trust score
    trust_score = calculate_score(apps)
    
    # Dynamic Risk Engine
    if simulation_mode:
        dynamic_risk += random.randint(15, 30)
        trust_score = max(0, trust_score - random.randint(10, 20))
    else:
        # Small fluctuations for realism
        dynamic_risk += random.randint(-5, 10)
    
    # Clamp values
    dynamic_risk = max(0, min(100, dynamic_risk))
    
    # Determine status
    if dynamic_risk < 50:
        status = "SAFE"
    elif dynamic_risk < 80:
        status = "WARNING"
    else:
        status = "DANGER"
    
    return jsonify({
        "trust_score": trust_score,
        "risk_score": dynamic_risk,
        "status": status,
        "apps": apps,
        "alerts": generate_alerts(apps),
        "reasons": generate_explanation(dynamic_risk),
        "action": auto_response(dynamic_risk)
    })

# ═══════════════════════════════════════════════════════════
# SIMULATION MODE
# ═══════════════════════════════════════════════════════════
@app.route("/simulate")
def simulate():
    global simulation_mode
    simulation_mode = True
    return jsonify({"message": "🚨 Attack Simulation Started"})

# ═══════════════════════════════════════════════════════════
# RESET SYSTEM
# ═══════════════════════════════════════════════════════════
@app.route("/reset")
def reset():
    global simulation_mode, dynamic_risk, trust_score
    simulation_mode = False
    dynamic_risk = 40
    trust_score = 100
    return jsonify({"message": "System Reset", "trust_score": 100, "risk_score": 40})

# ═══════════════════════════════════════════════════════════
# EXPORT DATA
# ═══════════════════════════════════════════════════════════
@app.route("/export")
def export():
    data = load_data()
    return jsonify({
        "export_date": datetime.now().isoformat(),
        "trust_score": calculate_score(data["apps"]),
        "apps": data["apps"]
    })

# ═══════════════════════════════════════════════════════════
# STATIC FILES
# ═══════════════════════════════════════════════════════════
@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)

# ═══════════════════════════════════════════════════════════
# RUN APP
# ═══════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("🚀 Starting Hushh Trust Dashboard...")
    print("📍 Open http://localhost:5000 in your browser")
    app.run(host="0.0.0.0", port=5000, debug=True)
