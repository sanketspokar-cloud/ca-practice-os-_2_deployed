from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import json
import os
import hmac
import hashlib
import base64
import time

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Allowed CORS Origins (Vercel Production and Localhost Dev)
allowed_origins = [
    "https://ca-practice-os-2-deployed.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Session Settings
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-for-practice-os-3982409823")

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def create_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(payload).encode('utf-8'))
    
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def verify_jwt(token: str) -> dict:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        header_b64, payload_b64, signature_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        
        expected_signature = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
        expected_signature_b64 = base64url_encode(expected_signature)
        
        if not hmac.compare_digest(signature_b64.encode('utf-8'), expected_signature_b64.encode('utf-8')):
            return None
            
        payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
        if payload.get("exp") and time.time() > payload["exp"]:
            return None
            
        return payload
    except Exception:
        return None

def verify_admin_auth(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized session. Please log in.")
    
    token = auth_header.split(" ")[1]
    payload = verify_jwt(token)
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please log in again.")
    
    return payload

# Mock Data (In-memory state for MVP)
DATA = {
    "clients": [
        { "id":1, "code":"CLT-0001", "name":"Sharma Textiles Pvt Ltd", "entity":"Private Limited", "gstin":"27AABCS5768L1ZD", "pan":"AABCS5768L", "status":"active", "partner":"Rajesh Kumar", "outstanding":84500, "tasksDue":3, "industry":"Textiles", "email":"accounts@sharmatextiles.com", "phone":"9876543210", "assigned":"Priya Sharma" },
        { "id":2, "code":"CLT-0002", "name":"Mehta & Sons HUF", "entity":"HUF", "gstin":"07AACHM7412K1ZP", "pan":"AACHM7412K", "status":"active", "partner":"Anjali Mehta", "outstanding":12000, "tasksDue":1, "industry":"Trading", "email":"mehta.huf@gmail.com", "phone":"9812345678", "assigned":"Rahul Verma" },
        { "id":3, "code":"CLT-0003", "name":"TechForge Solutions LLP", "entity":"LLP", "gstin":"29AAFFT3345M1ZR", "pan":"AAFFT3345M", "status":"active", "partner":"Vikram Nair", "outstanding":0, "tasksDue":5, "industry":"Technology", "email":"cfo@techforge.in", "phone":"9988776655", "assigned":"Priya Sharma" },
        { "id":4, "code":"CLT-0004", "name":"Green Valley Farms", "entity":"Proprietorship", "gstin":None, "pan":"BLKPS4521D", "status":"active", "partner":"Sunita Patel", "outstanding":67800, "tasksDue":0, "industry":"Agriculture", "email":"greenvalley@mail.com", "phone":"9765432109", "assigned":"Amit Singh" },
        { "id":5, "code":"CLT-0005", "name":"Kapoor Infrastructure Ltd", "entity":"Public Limited", "gstin":"24AACKK4789N1ZX", "pan":"AACKK4789N", "status":"active", "partner":"Rajesh Kumar", "outstanding":225000, "tasksDue":8, "industry":"Construction", "email":"finance@kapoorinfra.com", "phone":"9123456789", "assigned":"Rahul Verma" },
        { "id":6, "code":"CLT-0006", "name":"Mumbai Fashion House", "entity":"Partnership", "gstin":"27AADMF2345P1ZQ", "pan":"AADMF2345P", "status":"inactive", "partner":"Anjali Mehta", "outstanding":0, "tasksDue":0, "industry":"Retail", "email":"fashion@mumbaifh.com", "phone":"9871234560", "assigned":"Amit Singh" },
        { "id":7, "code":"CLT-0007", "name":"Patel Agro Exports", "entity":"Private Limited", "gstin":"24AAAPP1234E1ZB", "pan":"AAAPP1234E", "status":"active", "partner":"Vikram Nair", "outstanding":38900, "tasksDue":2, "industry":"Export", "email":"exports@patelagro.com", "phone":"9654321987", "assigned":"Priya Sharma" },
    ],
    "tasks": [
        { "id":1, "title":"GSTR-3B Filing - Apr 2025", "client":"Sharma Textiles Pvt Ltd", "status":"in_progress", "priority":"urgent", "due":"2025-05-20", "assignee":"Priya Sharma", "type":"GST", "checklist":4, "done":2 },
        { "id":2, "title":"TDS Return Q4 FY25 (26Q)", "client":"Kapoor Infrastructure Ltd", "status":"todo", "priority":"high", "due":"2025-05-31", "assignee":"Rahul Verma", "type":"TDS", "checklist":6, "done":0 },
        { "id":3, "title":"Income Tax Return FY24-25 - Sharma Textiles", "client":"Sharma Textiles Pvt Ltd", "status":"todo", "priority":"high", "due":"2025-07-31", "assignee":"Priya Sharma", "type":"ITR", "checklist":8, "done":0 },
        { "id":4, "title":"GSTR-1 Monthly - TechForge", "client":"TechForge Solutions LLP", "status":"done", "priority":"medium", "due":"2025-05-11", "assignee":"Priya Sharma", "type":"GST", "checklist":3, "done":3 },
        { "id":5, "title":"PF ECR Submission - May 2025", "client":"Kapoor Infrastructure Ltd", "status":"in_progress", "priority":"medium", "due":"2025-05-15", "assignee":"Amit Singh", "type":"PF", "checklist":2, "done":1 },
        { "id":6, "title":"Advance Tax Q1 - Mehta HUF", "client":"Mehta & Sons HUF", "status":"todo", "priority":"medium", "due":"2025-06-15", "assignee":"Rahul Verma", "type":"ADV TAX", "checklist":2, "done":0 },
        { "id":7, "title":"ROC Annual Return - Kapoor Infra", "client":"Kapoor Infrastructure Ltd", "status":"review", "priority":"high", "due":"2025-06-30", "assignee":"Rahul Verma", "type":"ROC", "checklist":10, "done":8 },
        { "id":8, "title":"MCA AOC-4 Financial Statements", "client":"TechForge Solutions LLP", "status":"backlog", "priority":"low", "due":"2025-07-30", "assignee":"Amit Singh", "type":"ROC", "checklist":5, "done":0 },
    ],
    "compliance": [
        { "id":1, "type":"GST", "client":"Sharma Textiles Pvt Ltd", "task":"GSTR-3B", "period":"Apr 2025", "due":"2025-05-20", "status":"in_progress", "assignee":"PS" },
        { "id":2, "type":"GST", "client":"TechForge Solutions LLP", "task":"GSTR-1", "period":"Apr 2025", "due":"2025-05-11", "status":"done", "assignee":"PS" },
        { "id":3, "type":"GST", "client":"Kapoor Infrastructure Ltd", "task":"GSTR-3B", "period":"Apr 2025", "due":"2025-05-20", "status":"todo", "assignee":"RV" },
        { "id":4, "type":"TDS", "client":"Kapoor Infrastructure Ltd", "task":"26Q Q4", "period":"Q4 FY25", "due":"2025-05-31", "status":"todo", "assignee":"RV" },
        { "id":5, "type":"TDS", "client":"Sharma Textiles Pvt Ltd", "task":"26Q Q4", "period":"Q4 FY25", "due":"2025-05-31", "status":"in_progress", "assignee":"PS" },
        { "id":6, "type":"PF", "client":"Kapoor Infrastructure Ltd", "task":"ECR", "period":"Apr 2025", "due":"2025-05-15", "status":"in_progress", "assignee":"AS" },
        { "id":7, "type":"ADV TAX", "client":"Mehta & Sons HUF", "task":"Q1 Advance Tax", "period":"Q1 FY26", "due":"2025-06-15", "status":"todo", "assignee":"RV" },
        { "id":8, "type":"ROC", "client":"Kapoor Infrastructure Ltd", "task":"MGT-7", "period":"FY25", "due":"2025-06-30", "status":"review", "assignee":"RV" },
        { "id":9, "type":"ITR", "client":"Patel Agro Exports", "task":"ITR-6", "period":"FY25", "due":"2025-10-31", "status":"todo", "assignee":"PS" },
    ],
    "invoices": [
        { "id":1, "no":"INV/2425/0089", "client":"Sharma Textiles Pvt Ltd", "date":"2025-05-01", "due":"2025-05-15", "amount":35400, "paid":35400, "status":"paid" },
        { "id":2, "no":"INV/2425/0090", "client":"Kapoor Infrastructure Ltd", "date":"2025-05-01", "due":"2025-05-20", "amount":118000, "paid":0, "status":"overdue" },
        { "id":3, "no":"INV/2425/0091", "client":"TechForge Solutions LLP", "date":"2025-05-03", "due":"2025-05-25", "amount":47200, "paid":23600, "status":"partial" },
        { "id":4, "no":"INV/2425/0092", "client":"Patel Agro Exports", "date":"2025-05-05", "due":"2025-05-30", "amount":28320, "paid":0, "status":"sent" },
        { "id":5, "no":"INV/2425/0093", "client":"Mehta & Sons HUF", "date":"2025-05-08", "due":"2025-05-31", "amount":15340, "paid":0, "status":"draft" },
    ],
    "revenue": [
        { "month":"Jun 24", "invoiced":250000, "collected":210000 },
        { "month":"Jul 24", "invoiced":280000, "collected":240000 },
        { "month":"Aug 24", "invoiced":310000, "collected":290000 },
        { "month":"Sep 24", "invoiced":290000, "collected":270000 },
        { "month":"Oct 24", "invoiced":350000, "collected":320000 },
        { "month":"Nov 24", "invoiced":420000, "collected":380000 },
        { "month":"Dec 24", "invoiced":380000, "collected":360000 },
        { "month":"Jan 25", "invoiced":390000, "collected":340000 },
        { "month":"Feb 25", "invoiced":450000, "collected":410000 },
        { "month":"Mar 25", "invoiced":520000, "collected":490000 },
        { "month":"Apr 25", "invoiced":380000, "collected":310000 },
        { "month":"May 25", "invoiced":428300, "collected":120000 },
    ],
    "team": [
        { "id":1, "name":"Priya Sharma", "role":"Sr. Consultant", "tasks":15, "done":11, "hours":145, "color":"#6366F1" },
        { "id":2, "name":"Rahul Verma", "role":"Tax Associate", "tasks":22, "done":14, "hours":160, "color":"#8B5CF6" },
        { "id":3, "name":"Amit Singh", "role":"Compliance Officer", "tasks":18, "done":9, "hours":135, "color":"#F59E0B" },
        { "id":4, "name":"Anjali Mehta", "role":"Partner", "tasks":8, "done":6, "hours":80, "color":"#10B981" },
    ]
}

@app.get("/api/data")
async def get_all_data():
    return DATA

@app.get("/api/clients")
async def get_clients():
    return DATA["clients"]

@app.get("/api/tasks")
async def get_tasks():
    return DATA["tasks"]

@app.get("/api/compliance")
async def get_compliance():
    return DATA["compliance"]

@app.get("/api/invoices")
async def get_invoices():
    return DATA["invoices"]

@app.get("/api/revenue")
async def get_revenue():
    return DATA["revenue"]

@app.get("/api/team")
async def get_team():
    return DATA["team"]

@app.post("/api/verify-credentials")
@limiter.limit("10/minute")
async def verify_credentials(request: Request, email: str = None, password: str = None):
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "password123")
    
    if email != admin_email or password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    payload = {
        "email": email,
        "role": "admin",
        "exp": time.time() + (30 * 24 * 60 * 60) # 30 Days Expiration Session
    }
    token = create_jwt(payload)
    return {"message": "Credentials verified", "token": token}

@app.post("/api/clients")
async def add_client(client: dict, payload: dict = Depends(verify_admin_auth)):
    new_id = max([c["id"] for c in DATA["clients"]]) + 1 if DATA["clients"] else 1
    client["id"] = new_id
    DATA["clients"].append(client)
    return {"message": "Client added successfully", "client": client}

@app.post("/api/tasks")
async def add_task(task: dict, payload: dict = Depends(verify_admin_auth)):
    new_id = max([t["id"] for t in DATA["tasks"]]) + 1 if DATA["tasks"] else 1
    task["id"] = new_id
    DATA["tasks"].append(task)
    return {"message": "Task added successfully", "task": task}

@app.post("/api/compliance")
async def add_compliance(comp: dict, payload: dict = Depends(verify_admin_auth)):
    new_id = max([c["id"] for c in DATA["compliance"]]) + 1 if DATA["compliance"] else 1
    comp["id"] = new_id
    DATA["compliance"].append(comp)
    return {"message": "Compliance task added successfully", "compliance": comp}

@app.post("/api/invoices")
async def add_invoice(invoice: dict, payload: dict = Depends(verify_admin_auth)):
    new_id = max([i["id"] for i in DATA["invoices"]]) + 1 if DATA["invoices"] else 1
    invoice["id"] = new_id
    DATA["invoices"].append(invoice)
    return {"message": "Invoice added successfully", "invoice": invoice}

@app.put("/api/clients")
async def update_client(client: dict, payload: dict = Depends(verify_admin_auth)):
    client_id = client.get("id")
    for i, c in enumerate(DATA["clients"]):
        if c["id"] == client_id:
            DATA["clients"][i] = client
            return {"message": "Client updated successfully", "client": client}
    raise HTTPException(status_code=404, detail="Client not found")

@app.put("/api/tasks")
async def update_task(task: dict, payload: dict = Depends(verify_admin_auth)):
    task_id = task.get("id")
    for i, t in enumerate(DATA["tasks"]):
        if t["id"] == task_id:
            DATA["tasks"][i] = task
            return {"message": "Task updated successfully", "task": task}
    raise HTTPException(status_code=404, detail="Task not found")

@app.put("/api/compliance")
async def update_compliance(comp: dict, payload: dict = Depends(verify_admin_auth)):
    comp_id = comp.get("id")
    for i, c in enumerate(DATA["compliance"]):
        if c["id"] == comp_id:
            DATA["compliance"][i] = comp
            return {"message": "Compliance task updated successfully", "compliance": comp}
    raise HTTPException(status_code=404, detail="Compliance task not found")

@app.put("/api/invoices")
async def update_invoice(invoice: dict, payload: dict = Depends(verify_admin_auth)):
    invoice_id = invoice.get("id")
    for i, inv in enumerate(DATA["invoices"]):
        if inv["id"] == invoice_id:
            DATA["invoices"][i] = invoice
            return {"message": "Invoice updated successfully", "invoice": invoice}
    raise HTTPException(status_code=404, detail="Invoice not found")

@app.delete("/api/tasks")
async def delete_task(task_id: int, payload: dict = Depends(verify_admin_auth)):
    for i, t in enumerate(DATA["tasks"]):
        if t["id"] == task_id:
            deleted = DATA["tasks"].pop(i)
            return {"message": "Task deleted successfully", "task": deleted}
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/api/clients")
async def delete_client(client_id: int, payload: dict = Depends(verify_admin_auth)):
    for i, c in enumerate(DATA["clients"]):
        if c["id"] == client_id:
            deleted = DATA["clients"].pop(i)
            return {"message": "Client deleted successfully", "client": deleted}
    raise HTTPException(status_code=404, detail="Client not found")

@app.delete("/api/compliance")
async def delete_compliance(comp_id: int, payload: dict = Depends(verify_admin_auth)):
    for i, c in enumerate(DATA["compliance"]):
        if c["id"] == comp_id:
            deleted = DATA["compliance"].pop(i)
            return {"message": "Compliance task deleted successfully", "compliance": deleted}
    raise HTTPException(status_code=404, detail="Compliance task not found")

@app.delete("/api/invoices")
async def delete_invoice(invoice_id: int, payload: dict = Depends(verify_admin_auth)):
    for i, inv in enumerate(DATA["invoices"]):
        if inv["id"] == invoice_id:
            deleted = DATA["invoices"].pop(i)
            return {"message": "Invoice deleted successfully", "invoice": deleted}
    raise HTTPException(status_code=404, detail="Invoice not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
