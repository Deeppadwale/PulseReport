from dotenv import load_dotenv
load_dotenv() 

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .Models.database import engine, Base
from .Controller import user_controller,memberMaster_controller,reportMaster_Controller,optVerification_controller,memberReport_controller,familyMasterMain_controller,uploaded_file_prescription_Controller,dashboard_Controller
import asyncio
import os

app = FastAPI()


UPLOAD_FOLDER = "upload/medical_report"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


app.mount("/files", StaticFiles(directory=UPLOAD_FOLDER), name="files")

app.include_router(user_controller.router)
app.include_router(memberMaster_controller.router)
app.include_router(reportMaster_Controller.router)
app.include_router(optVerification_controller.router)
app.include_router(memberReport_controller.router)
app.include_router(familyMasterMain_controller.router)
app.include_router(uploaded_file_prescription_Controller.router)
app.include_router(dashboard_Controller.router)



# CORS settings

app.add_middleware(    
    CORSMiddleware,  
    allow_origins=["http://localhost:5173"],
    # allow_origins=["https://pulsereport.in"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# app.include_router(auth_controller.router)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def read_root():
    return {"message": "Welcome to FastAPI with Async MSSQL"}

@app.get("/ping")
async def ping():
    print("PING RECEIVED")
    return {"status": "alive"}


