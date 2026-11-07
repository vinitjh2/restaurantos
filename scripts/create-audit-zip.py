#!/usr/bin/env python3
"""
RestaurantOS — Comprehensive Source Code Audit Package Zipper
Creates a clean, production-sanitized ZIP package: RestaurantOS_Source_For_Audit.zip
Excludes node_modules, .next, .git, caches, .db binary files, and secret files.
Includes full source code, Prisma schema, tests, configs, and AUDIT_PACKAGE documentation.
"""

import os
import zipfile
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ZIP_NAME = "RestaurantOS_Source_For_Audit.zip"
TARGET_ROOT_ZIP = os.path.join(ROOT_DIR, ZIP_NAME)
TARGET_RELEASE_ZIP = os.path.join(ROOT_DIR, "release", ZIP_NAME)
ARTIFACT_DIR = r"C:\Users\vinee\.gemini\antigravity\brain\5b63f706-50f4-4a3d-9b73-ba22646c97ac"
TARGET_ARTIFACT_ZIP = os.path.join(ARTIFACT_DIR, ZIP_NAME)

EXCLUDE_DIRS = {
    "node_modules", ".next", ".git", "build", "dist", ".turbo",
    ".cache", "__pycache__", ".system_generated", "target", ".gradle"
}

EXCLUDE_EXTS = {
    ".tsbuildinfo", ".log", ".tmp", ".db", ".db-journal", ".db-wal"
}

EXCLUDE_FILES = {
    ZIP_NAME, ".env", "dev.db", "dev.db-journal",
    "restaurantos_pre_multitenant_backup.db"
}

def should_include(rel_path):
    parts = rel_path.replace("\\", "/").split("/")
    
    # Check directory exclusion
    for p in parts[:-1]:
        if p in EXCLUDE_DIRS or p.startswith(".next"):
            return False
            
    fname = parts[-1]
    if fname in EXCLUDE_FILES or fname.startswith(".env.") and fname != ".env.example":
        return False
        
    for ext in EXCLUDE_EXTS:
        if fname.endswith(ext):
            return False
            
    return True

def create_audit_zip():
    print("===============================================================================")
    print("  RESTAURANTOS — SOURCE CODE PACKAGING FOR EXTERNAL AUDIT")
    print("===============================================================================\n")

    files_added = []
    total_bytes = 0

    print(f">>> Creating archive: {TARGET_ROOT_ZIP}...")
    with zipfile.ZipFile(TARGET_ROOT_ZIP, "w", zipfile.ZIP_DEFLATED) as zip_out:
        for dirpath, dirnames, filenames in os.walk(ROOT_DIR):
            # filter directories in-place
            dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS and not d.startswith(".next")]
            
            for f in sorted(filenames):
                full_path = os.path.join(dirpath, f)
                rel_path = os.path.relpath(full_path, ROOT_DIR)
                
                if should_include(rel_path):
                    # Write with forward slashes for cross-platform compatibility
                    archive_name = os.path.join("restaurantos", rel_path).replace("\\", "/")
                    zip_out.write(full_path, archive_name)
                    size = os.path.getsize(full_path)
                    files_added.append((archive_name, size))
                    total_bytes += size

    zip_size = os.path.getsize(TARGET_ROOT_ZIP)
    print(f"\n[SUCCESS] Archive generated: {TARGET_ROOT_ZIP}")
    print(f"  Total Files Packaged : {len(files_added)}")
    print(f"  Uncompressed Size    : {(total_bytes / (1024 * 1024)):.2f} MB")
    print(f"  Compressed ZIP Size  : {(zip_size / (1024 * 1024)):.2f} MB")

    # Mirror to release/ and artifact directory
    os.makedirs(os.path.dirname(TARGET_RELEASE_ZIP), exist_ok=True)
    shutil.copyfile(TARGET_ROOT_ZIP, TARGET_RELEASE_ZIP)
    print(f"  Mirrored to Release  : {TARGET_RELEASE_ZIP}")

    if os.path.exists(ARTIFACT_DIR):
        shutil.copyfile(TARGET_ROOT_ZIP, TARGET_ARTIFACT_ZIP)
        print(f"  Mirrored to Artifact : {TARGET_ARTIFACT_ZIP}")

    print("\n===============================================================================\n")

if __name__ == "__main__":
    create_audit_zip()
