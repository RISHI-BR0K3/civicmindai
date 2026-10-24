# Running CivicMind AI on Fedora Linux (Dual-Boot Guide)

Welcome to Linux! When dual-booting Windows and Fedora Linux, the two operating systems use different file systems:
- **Windows** stores files on an **NTFS** partition.
- **Fedora Linux** stores files on **btrfs** or **ext4**.

Because of this separation, Antigravity on Fedora won't automatically list your Windows projects unless you either **mount the Windows drive** or **clone the project onto your Linux partition**.

Here are the two easiest ways to get your project running on Fedora:

---

## Method 1: Open Your Existing Windows Project Directly in Fedora (Instant!)
Fedora can read and write to your Windows partition directly!

1. Boot into **Fedora Linux**.
2. Open the **Files** app (Nautilus).
3. On the left sidebar, click **"Other Locations"**.
4. You will see your Windows drive (e.g. `Windows`, `OS`, or a disk size matching your C: drive).
5. Click on it to mount it (it may ask for your Fedora root/user password).
6. Navigate to:
   ```bash
   /run/media/<your-linux-username>/<Drive-Name-or-UUID>/College/ISP
   ```
7. Open **Antigravity** on Fedora, click **Open Folder**, and select that `ISP` directory!
8. In the terminal in Fedora, run:
   ```bash
   chmod +x setup.sh start_backend.sh start_frontend.sh
   ./setup.sh
   ```
9. Start backend: `./start_backend.sh`
10. Start frontend: `./start_frontend.sh`

> **Tip for Windows Dual Boot:** In Windows, open **Control Panel → Power Options → Choose what the power buttons do** and uncheck **"Turn on fast startup"**. Windows Fast Startup hibernates the NTFS partition and locks it in read-only mode for Linux. Turning it off allows full read/write access from Fedora!

---

## Method 2: Let Antigravity Rebuild It Natively on Fedora (Clone Prompt)

We created a self-contained file in this directory:
**`CIVICMIND_AI_LINUX_PROMPT.txt`**

To build an exact, fresh native copy of this project on Fedora:
1. Boot into **Fedora**.
2. Open a terminal and create a folder for your project:
   ```bash
   mkdir -p ~/Projects/CivicMind-AI
   cd ~/Projects/CivicMind-AI
   ```
3. Open **Antigravity** in that folder.
4. Open the `CIVICMIND_AI_LINUX_PROMPT.txt` file (you can copy it via a USB drive, email, Google Drive, or by accessing the mounted Windows drive).
5. Paste the prompt into Antigravity!
6. Antigravity on Linux will generate all the files, configure the virtual environment, install the npm dependencies, seed the database, and launch both servers for you.

---

## Linux Startup Commands Cheatsheet

Once installed on Fedora, you can run:

```bash
# Terminal 1: Backend
source backend/venv/bin/activate
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

Or simply use the included scripts:
```bash
./start_backend.sh
./start_frontend.sh
```
