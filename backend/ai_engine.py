# Layer 5 — AI inspection engine (Python · rule-based)

def evaluate_risk(cargo_data):
    """
    Evaluates cargo risk based on rules.
    Returns a tuple: (Risk Level, Decision Status)
    """
    score = 0
    
    cargo_type = cargo_data.get('cargoType', '').lower()
    origin = cargo_data.get('originPort', '').lower()
    
    # 1. Rule evaluation (Type, origin, flags)
    # 2. Risk scoring (Weighted factors)
    if 'hazardous' in cargo_type or 'chemicals' in cargo_type:
        score += 50
    elif 'electronics' in cargo_type:
        score += 20
        
    if 'unknown' in origin or 'high-risk-country' in origin:
        score += 40
        
    if len(cargo_data.get('documents', [])) == 0:
        score += 30 # Penalty for no documents
        
    # 3. Classification (Low / Med / High)
    if score >= 70:
        risk = 'High'
        decision = 'Detain cargo'
    elif score >= 30:
        risk = 'Medium'
        decision = 'Secondary inspection'
    else:
        risk = 'Low'
        decision = 'Expedite'
        
    return risk, decision
