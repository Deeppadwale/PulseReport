# import os
# import uuid
# from fastapi import UploadFile

# # Directory to store uploaded reports
# UPLOAD_DIR = "upload/Report"

# async def save_report_file(file: UploadFile) -> str:
#     """
#     Save an uploaded file to UPLOAD_DIR with a unique UUID filename.
#     Returns the relative path to save in the database.
#     """
#     # Ensure upload directory exists
#     os.makedirs(UPLOAD_DIR, exist_ok=True)

#     # Extract file extension
#     ext = file.filename.split(".")[-1]

#     # Generate unique filename
#     filename = f"{uuid.uuid4()}.{ext}"
#     path = os.path.join(UPLOAD_DIR, filename)

#     # Write file to disk asynchronously
#     contents = await file.read()
#     with open(path, "wb") as f:
#         f.write(contents)

#     # Return relative path for database storage
#     return os.path.join(UPLOAD_DIR, filename)


# def delete_report_file(file_path: str):
#     """
#     Delete a file from disk if it exists.
#     """
#     if file_path and os.path.exists(file_path):
#         os.remove(file_path)



import os
import uuid
from fastapi import UploadFile

UPLOAD_DIR = "upload/Report"


def get_file_path(filename: str) -> str:
    """
    Safely get absolute file path for preview/download
    """
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise FileNotFoundError("File not found")
    return file_path


async def save_report_file(file: UploadFile) -> str:
    """
    Save uploaded file with UUID name
    Returns relative path to store in DB
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    contents = await file.read()
    with open(path, "wb") as f:
        f.write(contents)

    return path  # save this in DB


def delete_report_file(file_path: str):
    """
    Delete file from OS
    """
    if file_path and os.path.exists(file_path):
        os.remove(file_path)


# 