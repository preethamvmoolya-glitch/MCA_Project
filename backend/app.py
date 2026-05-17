from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import pyotp
import datetime
from bson.objectid import ObjectId
from ai_engine import evaluate_risk
import os

app = Flask(__name__)
CORS(app)

# Config
app.config['JWT_SECRET_KEY'] = 'nmpa-super-secret-key-2026'  # In production, read from env
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=8)
jwt = JWTManager(app)

# In-memory store for demonstration (replaces MongoDB for simplicity if DB isn't running, but structured for DB)
# For a real DB, you'd use: mongo = PyMongo(app, uri=os.getenv("MONGO_URI"))
db_cargos = []
db_audit_logs = []

def log_audit(user, action, details):
    db_audit_logs.append({
        "_id": str(ObjectId()),
        "user": user,
        "action": action,
        "details": details,
        "timestamp": datetime.datetime.now().isoformat()
    })

# --- LAYER 2 & 3: Auth & Gateway ---
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    # Simulated Google OAuth + TOTP
    # User provides email and 2FA code (e.g., '123456')
    email = data.get('email')
    totp_code = data.get('totp_code')

    # Mock Role assignment
    role = 'admin' if 'admin' in email else 'inspector'
    
    # In a real app, verify Google Token here, then verify TOTP
    if not email:
        return jsonify({"msg": "Missing email"}), 400

    token = create_access_token(identity={"email": email, "role": role})
    log_audit(email, "LOGIN", "User logged in successfully")
    return jsonify({"token": token, "role": role}), 200


# --- LAYER 4: Core Application Modules ---

@app.route('/api/cargo', methods=['GET'])
@jwt_required()
def get_cargos():
    return jsonify(db_cargos), 200

@app.route('/api/cargo', methods=['POST'])
@jwt_required()
def create_cargo():
    current_user = get_jwt_identity()
    data = request.json
    
    new_cargo = {
        "_id": str(ObjectId()),
        "shipmentId": data.get('shipmentId'),
        "cargoType": data.get('cargoType'),
        "originPort": data.get('originPort'),
        "vesselName": data.get('vesselName'),
        "arrivalDate": data.get('arrivalDate'),
        "documents": [], # GridFS refs would go here
        "riskLevel": "Pending",
        "status": "Data Entry",
        "createdAt": datetime.datetime.now().isoformat()
    }
    db_cargos.append(new_cargo)
    log_audit(current_user['email'], "CREATE_CARGO", f"Cargo {new_cargo['shipmentId']} added")
    return jsonify(new_cargo), 201

@app.route('/api/cargo/<cargo_id>/document', methods=['POST'])
@jwt_required()
def upload_document(cargo_id):
    current_user = get_jwt_identity()
    # Mock document upload
    for c in db_cargos:
        if c['_id'] == cargo_id:
            c['documents'].append("Uploaded Document (S3/GridFS ref)")
            log_audit(current_user['email'], "UPLOAD_DOC", f"Doc uploaded for cargo {cargo_id}")
            return jsonify({"msg": "Document uploaded successfully"}), 200
    return jsonify({"msg": "Cargo not found"}), 404

# --- LAYER 5: AI Inspection Engine (Python rule-based) ---
@app.route('/api/cargo/<cargo_id>/evaluate', methods=['POST'])
@jwt_required()
def evaluate_cargo_risk(cargo_id):
    current_user = get_jwt_identity()
    for c in db_cargos:
        if c['_id'] == cargo_id:
            # Call the AI Engine layer
            risk, decision = evaluate_risk(c)
            
            c['riskLevel'] = risk
            c['status'] = decision
            
            log_audit(current_user['email'], "AI_EVALUATION", f"Cargo {cargo_id} evaluated as {risk}")
            return jsonify(c), 200
    return jsonify({"msg": "Cargo not found"}), 404

@app.route('/api/cargo/<cargo_id>/status', methods=['PUT'])
@jwt_required()
def update_status(cargo_id):
    current_user = get_jwt_identity()
    data = request.json
    for c in db_cargos:
        if c['_id'] == cargo_id:
            c['status'] = data.get('status')
            log_audit(current_user['email'], "UPDATE_STATUS", f"Cargo {cargo_id} status updated to {c['status']}")
            return jsonify(c), 200
    return jsonify({"msg": "Cargo not found"}), 404

# --- LAYER 6: Reports & Admin ---
@app.route('/api/admin/audit', methods=['GET'])
@jwt_required()
def get_audit_logs():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({"msg": "Unauthorized"}), 403
    return jsonify(db_audit_logs[::-1]), 200  # Return newest first

if __name__ == '__main__':
    app.run(debug=True, port=5000)
