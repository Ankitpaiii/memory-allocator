<div align="center">

# 🧠 OS Memory Management Simulator

### Interactive Visualization of Memory Allocation & Page Replacement Algorithms

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br/>

*A comprehensive, browser-based simulator for studying core OS memory management concepts — no installation required.*

---

[**Memory Allocator**](#-memory-allocation-simulator) · [**Paging Simulator**](#-page-replacement-simulator) · [**Theory & Concepts**](#-theory--concepts) · [**Getting Started**](#-getting-started)

</div>

<br/>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Memory Allocation Simulator](#-memory-allocation-simulator)
- [Page Replacement Simulator](#-page-replacement-simulator)
- [Theory & Concepts](#-theory--concepts)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

This project is an **interactive web-based simulator** designed to help students and enthusiasts understand two fundamental concepts in Operating Systems:

| Module | Description |
|--------|-------------|
| **Memory Allocation** | Visualize how contiguous memory is allocated and deallocated using classic fit algorithms |
| **Page Replacement** | Simulate page frame allocation with a textbook-style step-by-step grid view |

The simulator features **real-time visualizations**, **statistics dashboards**, **algorithm comparison**, and a built-in **theory reference** — all in a clean, modern UI.

---

## ✨ Features

### 🎯 Core Capabilities

| Feature | Description |
|---------|-------------|
| 🔀 **Multiple Algorithms** | 4 memory allocation + 3 page replacement algorithms |
| 📊 **Live Statistics** | Real-time utilization, fragmentation, hit/fault ratios |
| 🎨 **Visual Memory Bar** | Color-coded blocks showing allocated vs free memory |
| 📋 **Textbook Grid View** | Classic OS-style paging grid with HIT/MISS indicators |
| 📈 **Utilization Chart** | Line chart tracking memory usage over time |
| 🔄 **Algorithm Replay** | Switch algorithms and instantly see different outcomes |
| ⚡ **Step-by-Step Mode** | Step through page references one at a time |
| 📝 **Algorithm Logs** | Detailed decision logs for each operation |
| 🧩 **Custom Partitions** | Initialize memory with custom partition sizes |

---

## 💾 Memory Allocation Simulator

Simulate how an OS allocates contiguous memory blocks to processes.

### Supported Algorithms

| Algorithm | Strategy | Time Complexity |
|-----------|----------|-----------------|
| **First Fit** | Allocates the *first* hole that is big enough | O(n) |
| **Best Fit** | Allocates the *smallest* hole that fits | O(n) |
| **Worst Fit** | Allocates the *largest* hole available | O(n) |
| **Next Fit** | Like First Fit, but starts from the last allocation point | O(n) |

### Key Features
- 🎨 **Visual Memory Bar** — Color-coded blocks (yellow = free, salmon = allocated)
- 📊 **Statistics Dashboard** — Total, used, free memory, utilization %, fragmentation, success rate
- 📈 **Utilization Chart** — Tracks memory usage over time with Chart.js
- 📝 **Block Table** — Detailed view of all memory blocks with status
- 🔄 **Auto-Replay** — Switch algorithms and the same operations are replayed instantly
- 🧩 **Two Init Modes** — Total memory size OR custom partition sizes

---

## 📄 Page Replacement Simulator

Simulate how an OS decides which page to evict when a page fault occurs.

### Supported Algorithms

| Algorithm | Strategy | Bélády's Anomaly |
|-----------|----------|:----------------:|
| **FIFO** | Evicts the *oldest* page in memory | ⚠️ Yes |
| **LRU** | Evicts the *least recently used* page | ✅ No |
| **Optimal** | Evicts the page *not used for the longest future time* | ✅ No |

### Key Features
- 📋 **Textbook-Style Grid** — Classic OS reference table with:
  - **Reference row** — Page numbers across the top
  - **Frame rows** — Page content in each frame at every step
  - **Status row** — HIT (green) / MISS (red) for each reference
- 🎨 **Color-Coded Cells** — Red cells for faults, green cells for hits
- 📊 **Statistics** — Total references, hits, faults, hit ratio, fault ratio
- ⚡ **Step Mode** — Advance one reference at a time to study the algorithm
- 🚀 **Run All** — Execute the entire reference string at once
- 🔄 **Auto-Replay** — Switch algorithms to compare results instantly

---

## 📚 Theory & Concepts

The built-in **Theory & Concepts** page provides a side-by-side reference:

| Left Column | Right Column |
|-------------|-------------|
| Memory Allocation Algorithms | Page Replacement Algorithms |
| First Fit, Best Fit, Worst Fit, Next Fit | FIFO, LRU, Optimal |
| Pros & Cons for each | Pros & Cons for each |

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic structure & layout |
| **CSS3** | Modern design with custom properties, grid, flexbox |
| **Vanilla JavaScript** | Simulation logic, DOM manipulation, event handling |
| **Chart.js** | Memory utilization line chart |
| **Google Fonts (Inter)** | Clean, modern typography |

> 💡 **Zero dependencies to install** — runs entirely in the browser with CDN-loaded libraries.

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- *(Optional)* A local server for development

### Quick Start

**Option 1: Open directly**
```
Just double-click index.html in your file explorer!
```

**Option 2: Local server (recommended)**
```bash
# Clone the repository
git clone https://github.com/Ankitpaiii/memory-allocator.git

# Navigate to the project
cd memory-allocator

# Start a local server
npx -y serve .

# Open in browser
# → http://localhost:3000
```

### Pages

| URL | Description |
|-----|-------------|
| `/index.html` | Memory Allocation Simulator |
| `/paging.html` | Page Replacement Simulator |
| `/about.html` | Theory & Concepts Reference |

---

## 📁 Project Structure

```
memory-allocator/
│
├── index.html              # Memory Allocation Simulator (main page)
├── paging.html             # Page Replacement Simulator
├── about.html              # Theory & Concepts (two-column layout)
│
├── css/
│   └── style.css           # Complete design system & all styles
│
├── js/
│   ├── memory.js           # MemoryBlock & MemorySystem classes
│   ├── algorithms.js       # First Fit, Best Fit, Worst Fit, Next Fit
│   ├── charts.js           # Chart.js utilization chart wrapper
│   ├── ui.js               # Memory allocator UI controller
│   ├── paging.js           # PagingSimulator class (FIFO, LRU, Optimal)
│   └── paging-ui.js        # Paging simulator UI controller & grid renderer
│
└── README.md               # This file
```

---

## 📖 Usage Guide

### Memory Allocator

1. **Initialize Memory**
   - Choose *Total Size* (e.g., 1000 KB) or *Custom Partitions* (e.g., `100, 200, 300, 400`)
   - Click **Initialize Memory**

2. **Allocate Processes**
   - Enter a Process ID (e.g., `P1`) and Size (e.g., `200`)
   - Select an algorithm (First Fit, Best Fit, etc.)
   - Click **Allocate**

3. **Deallocate**
   - Enter the Process ID and click **Deallocate ID**
   - Adjacent free blocks are automatically merged

4. **Compare Algorithms**
   - After allocating several processes, switch the algorithm radio button
   - The simulator **replays all operations** with the new algorithm instantly

### Paging Simulator

1. **Configure**
   - Set the number of frames (1–10)
   - Enter a reference string (e.g., `7 0 1 2 0 3 0 4 2 3`)

2. **Simulate**
   - Click **Step** to advance one reference at a time
   - Click **Run All** to execute the entire string

3. **Analyze**
   - Study the **grid** — red cells show page faults, green cells show hits
   - Check the **stats dashboard** for hit/fault ratios
   - Read the **step log** for detailed algorithm decisions

4. **Compare**
   - Switch between FIFO, LRU, and Optimal
   - The simulation automatically re-runs for comparison

---

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- [ ] Add more page replacement algorithms (Clock, LFU, MFU)
- [ ] Add Belady's anomaly demonstration
- [ ] Add memory compaction visualization
- [ ] Add dark mode toggle
- [ ] Mobile responsive design improvements
- [ ] Export simulation results as PDF

### Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for OS students everywhere**

⭐ Star this repo if you found it helpful!

</div>
