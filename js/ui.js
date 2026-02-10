// UI Controller

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const elements = {
        totalMemoryInput: document.getElementById('totalMemory'),
        partitionInput: document.getElementById('partitionSizes'),
        initModeRadios: document.getElementsByName('initMode'),
        inputTotalGroup: document.getElementById('input-total'),
        inputCustomGroup: document.getElementById('input-custom'),

        btnInitialize: document.getElementById('btnInitialize'),
        btnReset: document.getElementById('btnReset'),

        processIdInput: document.getElementById('processId'),
        processSizeInput: document.getElementById('processSize'),
        btnAllocate: document.getElementById('btnAllocate'),
        btnDeallocate: document.getElementById('btnDeallocate'),
        errorMessage: document.getElementById('error-message'),

        algorithmRadios: document.getElementsByName('algorithm'),

        memoryContainer: document.getElementById('memory-container'),
        tooltip: document.getElementById('memory-tooltip'),

        stats: {
            total: document.getElementById('statTotal'),
            used: document.getElementById('statUsed'),
            free: document.getElementById('statFree'),
            utilization: document.getElementById('statUtilization'),
            extFrag: document.getElementById('statExtFrag'),
            successRate: document.getElementById('statSuccessRate')
        },

        logContent: document.getElementById('log-content'),
        tableBody: document.getElementById('block-table-body')
    };

    let memorySystem = null;

    // Event Listeners
    elements.btnInitialize.addEventListener('click', initializeMemory);
    elements.btnReset.addEventListener('click', resetMemory);
    elements.btnAllocate.addEventListener('click', handleAllocation);
    elements.btnDeallocate.addEventListener('click', handleDeallocation);

    // Toggle Init Mode
    elements.initModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                elements.inputTotalGroup.classList.add('hidden');
                elements.inputCustomGroup.classList.remove('hidden');
            } else {
                elements.inputTotalGroup.classList.remove('hidden');
                elements.inputCustomGroup.classList.add('hidden');
            }
        });
    });

    // Initialization
    function initializeMemory() {
        let initData;
        const mode = Array.from(elements.initModeRadios).find(r => r.checked).value;

        if (mode === 'custom') {
            const inputStr = elements.partitionInput.value.trim();
            if (!inputStr) {
                showError("Please enter partition sizes.");
                return;
            }

            const sizes = inputStr.split(',').map(s => parseInt(s.trim()));
            if (sizes.some(s => isNaN(s) || s <= 0)) {
                showError("Invalid partition sizes. Use positive numbers separated by commas.");
                return;
            }
            initData = sizes;
            log("Initializing with custom partitions: " + sizes.join(', '), "system");
        } else {
            const size = parseInt(elements.totalMemoryInput.value);
            if (isNaN(size) || size <= 0) {
                showError("Please enter a valid memory size.");
                return;
            }
            initData = size;
            log("Initializing with total size: " + size + " KB", "system");
        }

        memorySystem = new MemorySystem(initData);

        // Enable controls
        elements.btnReset.disabled = false;
        elements.btnAllocate.disabled = false;
        elements.btnDeallocate.disabled = false;

        // Disable init controls
        elements.btnInitialize.disabled = true;
        elements.totalMemoryInput.disabled = true;
        elements.partitionInput.disabled = true;
        elements.initModeRadios.forEach(r => r.disabled = true);

        Charts.init(); // Initialize chart
        updateUI();
    }

    function resetMemory() {
        memorySystem = null;

        // Disable simulation controls
        elements.btnAllocate.disabled = true;
        elements.btnDeallocate.disabled = true;
        elements.btnReset.disabled = true;

        // Enable init controls
        elements.btnInitialize.disabled = false;
        elements.totalMemoryInput.disabled = false;
        elements.partitionInput.disabled = false;
        elements.initModeRadios.forEach(r => r.disabled = false);

        // Correct visibility based on current radio selection
        const mode = Array.from(elements.initModeRadios).find(r => r.checked).value;
        if (mode === 'custom') {
            elements.inputTotalGroup.classList.add('hidden');
            elements.inputCustomGroup.classList.remove('hidden');
        } else {
            elements.inputTotalGroup.classList.remove('hidden');
            elements.inputCustomGroup.classList.add('hidden');
        }

        // Clear UI
        elements.memoryContainer.innerHTML = '<div class="placeholder-text">Please initialize memory to begin simulation.</div>';
        elements.stats.total.textContent = "0 KB";
        elements.stats.used.textContent = "0 KB";
        elements.stats.free.textContent = "0 KB";
        elements.stats.utilization.textContent = "0%";
        elements.stats.extFrag.textContent = "0 KB";
        elements.stats.successRate.textContent = "100%";
        elements.tableBody.innerHTML = "";

        Charts.reset();
        log("System reset. Ready for initialization.", "system");
    }

    function handleAllocation() {
        if (!memorySystem) return;

        const id = elements.processIdInput.value.trim();
        const size = parseInt(elements.processSizeInput.value);
        const algorithm = getSelectedAlgorithm();

        if (!id) {
            showError("Please enter a Process ID.");
            return;
        }
        if (isNaN(size) || size <= 0) {
            showError("Please enter a valid Process Size.");
            return;
        }

        const result = memorySystem.allocate(id, size, algorithm);

        if (result.success) {
            log(result.message, "alloc");
            elements.processIdInput.value = ""; // Clear input
            // elements.processSizeInput.value = ""; // Keep size for convenience
            clearError();
            updateUI();
        } else {
            showError(result.message);
            log(result.message, "fail");
        }
    }

    function handleDeallocation() {
        if (!memorySystem) return;

        const id = elements.processIdInput.value.trim();
        if (!id) {
            showError("Please enter a Process ID to deallocate.");
            return;
        }

        const result = memorySystem.deallocate(id);

        if (result.success) {
            log(result.message, "dealloc");
            elements.processIdInput.value = "";
            clearError();
            updateUI();
        } else {
            showError(result.message);
            log(result.message, "fail");
        }
    }

    // Helpers
    function getSelectedAlgorithm() {
        for (const radio of elements.algorithmRadios) {
            if (radio.checked) return radio.value;
        }
        return 'firstFit';
    }

    function showError(msg) {
        elements.errorMessage.textContent = msg;
        setTimeout(() => {
            elements.errorMessage.textContent = "";
        }, 3000);
    }

    function clearError() {
        elements.errorMessage.textContent = "";
    }

    function log(msg, type = "") {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const time = new Date().toLocaleTimeString();
        entry.textContent = `[${time}] ${msg}`;
        elements.logContent.appendChild(entry);
        elements.logContent.scrollTop = elements.logContent.scrollHeight;
    }

    // Rendering
    function updateUI() {
        renderMemoryBars();
        updateStats();
        updateTable();
        // We handle chart updates separately to avoid re-drawing on every little thing? 
        // No, updateUI is called after alloc/dealloc, which is when stats change.
        if (memorySystem) {
            const stats = memorySystem.getStats();
            Charts.update(stats.utilization);
        }
    }

    function renderMemoryBars() {
        elements.memoryContainer.innerHTML = "";
        const totalSize = memorySystem.totalSize;

        memorySystem.blocks.forEach(block => {
            const blockDiv = document.createElement('div');
            blockDiv.className = `memory-block ${block.isAllocated ? 'allocated' : 'free'}`;

            // Calculate width percentage
            const widthPct = (block.size / totalSize) * 100;
            blockDiv.style.width = `${widthPct}%`;

            // Content
            if (block.isAllocated) {
                blockDiv.textContent = block.processId;
            } else {
                if (widthPct > 5) blockDiv.textContent = block.size; // Only show size if enough space
            }

            // Tooltip events
            blockDiv.addEventListener('mousemove', (e) => showTooltip(e, block));
            blockDiv.addEventListener('mouseleave', hideTooltip);

            elements.memoryContainer.appendChild(blockDiv);
        });
    }

    function updateStats() {
        const stats = memorySystem.getStats();

        elements.stats.total.textContent = stats.total + " KB";
        elements.stats.used.textContent = stats.used + " KB";
        elements.stats.free.textContent = stats.free + " KB";
        elements.stats.utilization.textContent = stats.utilization + "%";
        elements.stats.extFrag.textContent = stats.extFrag + " KB";
        elements.stats.successRate.textContent = stats.successRate + "%";
    }

    function updateTable() {
        elements.tableBody.innerHTML = "";

        memorySystem.blocks.forEach(block => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${block.id}</td>
                <td>${block.size}</td>
                <td><span class="dot ${block.isAllocated ? 'allocated' : 'free'}"></span> ${block.isAllocated ? 'Allocated' : 'Free'}</td>
                <td>${block.processId || '-'}</td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    function showTooltip(e, block) {
        const tooltip = elements.tooltip;
        tooltip.innerHTML = `
            <strong>Block ID:</strong> ${block.id}<br>
            <strong>Status:</strong> ${block.isAllocated ? 'Allocated' : 'Free'}<br>
            <strong>Size:</strong> ${block.size} KB<br>
            ${block.isAllocated ? `<strong>Process:</strong> ${block.processId}` : ''}
        `;
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
        tooltip.classList.remove('hidden');
    }

    function hideTooltip() {
        elements.tooltip.classList.add('hidden');
    }
});
