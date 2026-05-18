from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import json
import os

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        { "month":"Jun", "invoiced":320000, "collected":280000 },
        { "month":"Jul", "invoiced":410000, "collected":350000 },
        { "month":"Aug", "invoiced":290000, "collected":310000 },
        { "month":"Sep", "invoiced":480000, "collected":420000 },
        { "month":"Oct", "invoiced":520000, "collected":460000 },
        { "month":"Nov", "invoiced":390000, "collected":380000 },
        { "month":"Dec", "invoiced":440000, "collected":400000 },
        { "month":"Jan", "invoiced":510000, "collected":470000 },
        { "month":"Feb", "invoiced":460000, "collected":490000 },
        { "month":"Mar", "invoiced":680000, "collected":580000 },
        { "month":"Apr", "invoiced":420000, "collected":350000 },
        { "month":"May", "invoiced":180000, "collected":120000 },
    ],
    "team": [
        { "id":1, "name":"Priya Sharma", "role":"Manager", "initials":"PS", "tasks":12, "done":8, "hours":142, "color":"#8B5CF6" },
        { "id":2, "name":"Rahul Verma", "role":"Senior", "initials":"RV", "tasks":9, "done":6, "hours":118, "color":"#0EA5E9" },
        { "id":3, "name":"Amit Singh", "role":"Staff", "initials":"AS", "tasks":7, "done":5, "hours":96, "color":"#F59E0B" },
        { "id":4, "name":"Divya Patel", "role":"Staff", "initials":"DP", "tasks":6, "done":4, "hours":88, "color":"#EC4899" },
    ]
}

@app.get("/")
async def root():
    return {"status": "success", "message": "CA Practice OS API is running successfully"}

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
@limiter.limit("5/minute")
async def verify_credentials(request: Request, email: str = None, password: str = None):
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "password123")
    
    if email != admin_email or password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"message": "Credentials verified"}

@app.post("/api/clients")
async def add_client(client: dict, email: str = None, password: str = None):
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "password123")
    if email != admin_email or password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    new_id = max([c["id"] for c in DATA["clients"]]) + 1 if DATA["clients"] else 1
    client["id"] = new_id
    DATA["clients"].append(client)
    return {"message": "Client added successfully", "client": client}

@app.post("/api/tasks")
async def add_task(task: dict, email: str = None, password: str = None):
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "password123")
    if email != admin_email or password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    new_id = max([t["id"] for t in DATA["tasks"]]) + 1 if DATA["tasks"] else 1
    task["id"] = new_id
    DATA["tasks"].append(task)
    return {"message": "Task added successfully", "task": task}

@app.post("/api/compliance")
async def add_compliance(comp: dict, email: str = None, password: str = None):
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "password123")
    if email != admin_email or password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    new_id = max([c["id"] for c in DATA["compliance"]]) + 1 if DATA["compliance"] else 1
    comp["id"] = new_id
    DATA["compliance"].append(comp)
    return {"message": "Compliance task added successfully", "compliance": comp}

@app.post("/api/invoices")
async def add_invoice(invoice: dict, email: str = None, password: str = None):
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "password123")
    if email != admin_email or password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    new_id = max([i["id"] for i in DATA["invoices"]]) + 1 if DATA["invoices"] else 1
    invoice["id"] = new_id
    DATA["invoices"].append(invoice)
    return {"message": "Invoice added successfully", "invoice": invoice}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

