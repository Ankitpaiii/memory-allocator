// Paging UI Controller

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        numFramesInput: document.getElementById('numFrames'),
        refStringInput: document.getElementById('refString'),
        algorithmRadios: document.getElementsByName('pagingAlgorithm'),

        btnRun: document.getElementById('btnRunAll'),
        btnStep: document.getElementById('btnStep'),
        btnReset: document.getElementById('btnPagingReset'),

        gridContainer: document.getElementById('paging-grid'),
        logContent: document.getElementById('paging-log-content'),
        errorMessage: document.getElementById('paging-error'),

        stats: {
            totalRefs: document.getElementById('pgStatTotal'),
            hits: document.getElementById('pgStatHits'),
            faults: document.getElementById('pgStatFaults'),
            hitRatio: document.getElementById('pgStatHitRatio'),
            faultRatio: document.getElementById('pgStatFaultRatio')
        }
    };

    let simulator = null;
    let refArray = [];
    let numFrames = 3;

    // Event Listeners
    elements.btnRun.addEventListener('click', handleRunAll);
    elements.btnStep.addEventListener('click', handleStep);
    elements.btnReset.addEventListener('click', handleReset);

    // Algorithm change → auto-reset and re-run if already has history
    Array.from(elements.algorithmRadios).forEach(radio => {
        radio.addEventListener('change', () => {
            if (simulator && simulator.history.length > 0) {
                // Re-run with new algorithm
                initSimulator();
                if (simulator) {
                    simulator.runAll();
                    renderGrid();
                    updateStats();
                    log(`Switched to ${getSelectedAlgorithm().toUpperCase()}. Re-ran simulation.`, 'system');
                }
            }
        });
    });

    function getSelectedAlgorithm() {
        for (const radio of elements.algorithmRadios) {
            if (radio.checked) return radio.value;
        }
        return 'fifo';
    }

    function parseInput() {
        numFrames = parseInt(elements.numFramesInput.value);
        if (isNaN(numFrames) || numFrames < 1 || numFrames > 10) {
            showError('Number of frames must be between 1 and 10.');
            return false;
        }

        const raw = elements.refStringInput.value.trim();
        if (!raw) {
            showError('Please enter a reference string.');
            return false;
        }

        refArray = raw.split(/[\s,]+/).map(s => parseInt(s.trim()));
        if (refArray.some(n => isNaN(n) || n < 0)) {
            showError('Reference string must contain non-negative integers separated by spaces or commas.');
            return false;
        }

        clearError();
        return true;
    }

    function initSimulator() {
        if (!parseInput()) return false;
        const algorithm = getSelectedAlgorithm();
        simulator = new PagingSimulator(numFrames, refArray, algorithm);
        return true;
    }

    function handleRunAll() {
        if (!initSimulator()) return;
        simulator.runAll();
        renderGrid();
        updateStats();
        log(`Ran ${getSelectedAlgorithm().toUpperCase()} on ${refArray.length} references with ${numFrames} frames.`, 'system');
    }

    function handleStep() {
        if (!simulator) {
            if (!initSimulator()) return;
            log(`Initialized ${getSelectedAlgorithm().toUpperCase()} with ${numFrames} frames.`, 'system');
        }

        const result = simulator.step();
        if (!result) {
            showError('All references have been processed. Click Reset to start over.');
            return;
        }

        renderGrid();
        updateStats();

        const type = result.hit ? 'alloc' : 'fail';
        log(result.reason, type);
    }

    function handleReset() {
        simulator = null;
        elements.gridContainer.innerHTML = '<div class="placeholder-text">Configure frames and reference string, then click Step or Run All.</div>';
        elements.stats.totalRefs.textContent = '0';
        elements.stats.hits.textContent = '0';
        elements.stats.faults.textContent = '0';
        elements.stats.hitRatio.textContent = '0%';
        elements.stats.faultRatio.textContent = '0%';
        clearError();
        log('Reset. Ready for new simulation.', 'system');
    }

    // ─── Grid Rendering (OS textbook style) ─────────────────────────

    function renderGrid() {
        if (!simulator || simulator.history.length === 0) return;

        const history = simulator.history;
        const nFrames = simulator.numFrames;
        const container = elements.gridContainer;
        container.innerHTML = '';

        // Build a scrollable table
        const wrapper = document.createElement('div');
        wrapper.className = 'paging-grid-wrapper';

        const table = document.createElement('table');
        table.className = 'paging-table';

        // ── Header Row: Reference String ──
        const thead = document.createElement('thead');
        const refRow = document.createElement('tr');
        const refLabel = document.createElement('th');
        refLabel.textContent = 'Reference';
        refLabel.className = 'row-label';
        refRow.appendChild(refLabel);

        history.forEach(step => {
            const th = document.createElement('th');
            th.textContent = step.ref;
            th.className = 'ref-cell';
            refRow.appendChild(th);
        });
        thead.appendChild(refRow);
        table.appendChild(thead);

        // ── Body: Frame Rows ──
        const tbody = document.createElement('tbody');

        // Build frame state at each step
        // We need to reconstruct frame snapshots from history
        for (let f = 0; f < nFrames; f++) {
            const row = document.createElement('tr');
            const label = document.createElement('td');
            label.textContent = `Frame ${f}`;
            label.className = 'row-label';
            row.appendChild(label);

            let prevValue = null;
            history.forEach((step, colIdx) => {
                const td = document.createElement('td');
                const cellValue = step.frames[f];

                if (cellValue === null) {
                    td.textContent = '-';
                    td.className = 'frame-cell empty';
                } else {
                    td.textContent = cellValue;

                    // Determine if THIS frame was the one that changed
                    if (step.placedInFrame === f && !step.hit) {
                        // This frame was written to (page fault placed here)
                        td.className = 'frame-cell fault-cell';
                    } else if (step.hit && step.placedInFrame === f) {
                        // This is the frame that had the hit
                        td.className = 'frame-cell hit-cell';
                    } else {
                        td.className = 'frame-cell neutral';
                    }
                }

                row.appendChild(td);
                prevValue = cellValue;
            });

            tbody.appendChild(row);
        }

        // ── Status Row: HIT / MISS ──
        const statusRow = document.createElement('tr');
        const statusLabel = document.createElement('td');
        statusLabel.textContent = 'Status';
        statusLabel.className = 'row-label status-label';
        statusRow.appendChild(statusLabel);

        history.forEach(step => {
            const td = document.createElement('td');
            td.textContent = step.hit ? 'HIT' : 'MISS';
            td.className = step.hit ? 'status-cell hit-status' : 'status-cell miss-status';
            statusRow.appendChild(td);
        });
        tbody.appendChild(statusRow);

        table.appendChild(tbody);
        wrapper.appendChild(table);
        container.appendChild(wrapper);
    }

    // ─── Stats ──────────────────────────────────────────────────────

    function updateStats() {
        if (!simulator) return;
        const stats = simulator.getStats();
        elements.stats.totalRefs.textContent = stats.totalRefs;
        elements.stats.hits.textContent = stats.hits;
        elements.stats.faults.textContent = stats.faults;
        elements.stats.hitRatio.textContent = stats.hitRatio + '%';
        elements.stats.faultRatio.textContent = stats.faultRatio + '%';
    }

    // ─── Helpers ────────────────────────────────────────────────────

    function showError(msg) {
        elements.errorMessage.textContent = msg;
        setTimeout(() => { elements.errorMessage.textContent = ''; }, 4000);
    }

    function clearError() {
        elements.errorMessage.textContent = '';
    }

    function log(msg, type = '') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const time = new Date().toLocaleTimeString();
        entry.textContent = `[${time}] ${msg}`;
        elements.logContent.appendChild(entry);
        elements.logContent.scrollTop = elements.logContent.scrollHeight;
    }
});
