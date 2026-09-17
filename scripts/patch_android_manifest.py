#!/usr/bin/env python3
from pathlib import Path

p = Path("android/app/src/main/AndroidManifest.xml")
if not p.exists():
    raise SystemExit(f"Missing {p}")

text = p.read_text()

extra = """
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
"""

if "READ_EXTERNAL_STORAGE" not in text:
    needle = '<uses-permission android:name="android.permission.INTERNET" />'
    if needle not in text:
        raise SystemExit("INTERNET permission not found in manifest")
    text = text.replace(needle, needle + extra)

if "requestLegacyExternalStorage" not in text:
    text = text.replace("<application", '<application android:requestLegacyExternalStorage="true"', 1)

p.write_text(text)
print("AndroidManifest patched for storage permissions")
