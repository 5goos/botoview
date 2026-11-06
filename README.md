# BotoView — AWS Boto3 Changelog Explorer & Release Notes Tracker

[![Website](https://img.shields.io/badge/website-botoview.5goos.com-orange.svg)](https://botoview.5goos.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**BotoView** (`botoview`) is an interactive web application to track, filter, and explore **AWS Boto3 changelogs** and Botocore updates in real time. Designed for cloud engineers, Python developers, and DevOps practitioners seeking a lightning-fast **boto3 changelog** viewer and comprehensive **boto3 release notes** tracker.

🔗 **Live Application:** [https://botoview.5goos.com](https://botoview.5goos.com)

---

## 🚀 Key Features

- **Service-Level Filtering:** Easily use **boto3 changelog filter by service** (such as Amazon S3, Bedrock, Lambda, DynamoDB, EC2, SageMaker) to view service-specific history across all releases.
- **Categorized Release Notes:** Clearly inspect API changes, new features, and bug fixes for every **aws boto3 version update**.
- **Instant Search & Keyboard Shortcuts:** Jump directly to any version or filter logs instantly:
  - `Cmd` / `Ctrl` + `K`: Focus version search
  - `/`: Focus service directory search
  - `Esc`: Close open drawers and modals
- **Dark Mode Support:** Seamless automatic dark/light theme switching based on system preferences.

---

## 🛠️ Tech Stack

- **Framework:** [Astro](https://astro.build)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **Client Reactivity:** [Alpine.js](https://alpinejs.dev)
- **Deployment & Edge Runtime:** [Cloudflare Workers / Pages](https://developers.cloudflare.com/pages/)
- **Data Sync:** Python pipeline syncing changes directly from `botocore`

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 22.12.0
- [npm](https://npmjs.com) >= 10.0.0
- Python 3.9+ (optional, for updating changelog data)

### Installation

```bash
# Clone the repository
git clone https://github.com/5goos/botoview.git
cd botoview

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:4321` in your browser.

### Building for Production

```bash
npm run build
```

Preview locally with Wrangler:

```bash
npm run preview
```

### Changelog Data Sync

To sync the latest releases from the official Botocore repository and PyPI:

```bash
python3 scripts/sync_boto_changes.py
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Crafted with care by [Naveen Thurimerla](https://www.thurimerla.com/).
