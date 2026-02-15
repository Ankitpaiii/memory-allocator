// Paging Simulation Logic

class PagingSimulator {
    constructor(numFrames, refString, algorithm) {
        this.numFrames = numFrames;
        this.refString = refString; // Array of page numbers
        this.algorithm = algorithm;
        this.frames = new Array(numFrames).fill(null);
        this.history = []; // Array of step results
        this.currentStep = 0;
        this.hits = 0;
        this.faults = 0;

        // Algorithm-specific state
        this.fifoQueue = []; // FIFO: queue of frame indices (order of insertion)
        this.lruTimestamps = new Array(numFrames).fill(-1); // LRU: last-used time per frame
        this.clockPointer = 0; // Clock: current pointer position
        this.clockBits = new Array(numFrames).fill(0); // Clock: reference bits
    }

    step() {
        if (this.currentStep >= this.refString.length) return null;

        const ref = this.refString[this.currentStep];
        const frameIndex = this.frames.indexOf(ref);
        let result;

        if (frameIndex !== -1) {
            // HIT
            this.hits++;
            result = {
                ref,
                hit: true,
                evicted: null,
                placedInFrame: frameIndex,
                frames: [...this.frames],
                reason: `Page ${ref} is already in Frame ${frameIndex} → HIT`
            };
            // Update algorithm state for hit
            this._onHit(frameIndex);
        } else {
            // FAULT
            this.faults++;
            const evictInfo = this._findVictim();
            const evicted = this.frames[evictInfo.frameIndex];
            this.frames[evictInfo.frameIndex] = ref;

            result = {
                ref,
                hit: false,
                evicted: evicted,
                placedInFrame: evictInfo.frameIndex,
                frames: [...this.frames],
                reason: evictInfo.reason
            };
            // Update algorithm state for fault
            this._onFault(evictInfo.frameIndex);
        }

        this.currentStep++;
        this.history.push(result);
        return result;
    }

    runAll() {
        while (this.currentStep < this.refString.length) {
            this.step();
        }
        return this.history;
    }

    _onHit(frameIndex) {
        switch (this.algorithm) {
            case 'lru':
                this.lruTimestamps[frameIndex] = this.currentStep;
                break;
            case 'clock':
                this.clockBits[frameIndex] = 1;
                break;
        }
    }

    _onFault(frameIndex) {
        switch (this.algorithm) {
            case 'fifo':
                // Remove old position if exists, push new
                const oldPos = this.fifoQueue.indexOf(frameIndex);
                if (oldPos !== -1) this.fifoQueue.splice(oldPos, 1);
                this.fifoQueue.push(frameIndex);
                break;
            case 'lru':
                this.lruTimestamps[frameIndex] = this.currentStep;
                break;
            case 'clock':
                this.clockBits[frameIndex] = 1;
                // Advance pointer past the just-placed frame
                this.clockPointer = (frameIndex + 1) % this.numFrames;
                break;
        }
    }

    _findVictim() {
        // Check for empty frame first
        const emptyIndex = this.frames.indexOf(null);
        if (emptyIndex !== -1) {
            return { frameIndex: emptyIndex, reason: `Frame ${emptyIndex} is empty → placed Page ${this.refString[this.currentStep]}` };
        }

        switch (this.algorithm) {
            case 'fifo': return this._fifoVictim();
            case 'lru': return this._lruVictim();
            case 'optimal': return this._optimalVictim();
            case 'clock': return this._clockVictim();
            default: return this._fifoVictim();
        }
    }

    _fifoVictim() {
        const victimFrame = this.fifoQueue[0]; // Oldest inserted
        const evictedPage = this.frames[victimFrame];
        return {
            frameIndex: victimFrame,
            reason: `FIFO: Page ${evictedPage} (Frame ${victimFrame}) is oldest → evicted, placed Page ${this.refString[this.currentStep]}`
        };
    }

    _lruVictim() {
        let minTime = Infinity;
        let victimFrame = 0;
        for (let i = 0; i < this.numFrames; i++) {
            if (this.lruTimestamps[i] < minTime) {
                minTime = this.lruTimestamps[i];
                victimFrame = i;
            }
        }
        const evictedPage = this.frames[victimFrame];
        return {
            frameIndex: victimFrame,
            reason: `LRU: Page ${evictedPage} (Frame ${victimFrame}) was least recently used → evicted, placed Page ${this.refString[this.currentStep]}`
        };
    }

    _optimalVictim() {
        let farthest = -1;
        let victimFrame = 0;
        const future = this.refString.slice(this.currentStep + 1);

        for (let i = 0; i < this.numFrames; i++) {
            const nextUse = future.indexOf(this.frames[i]);
            if (nextUse === -1) {
                // Page not used again — best candidate
                victimFrame = i;
                break;
            }
            if (nextUse > farthest) {
                farthest = nextUse;
                victimFrame = i;
            }
        }
        const evictedPage = this.frames[victimFrame];
        return {
            frameIndex: victimFrame,
            reason: `Optimal: Page ${evictedPage} (Frame ${victimFrame}) won't be used longest → evicted, placed Page ${this.refString[this.currentStep]}`
        };
    }

    _clockVictim() {
        // Second chance / Clock algorithm
        while (true) {
            if (this.clockBits[this.clockPointer] === 0) {
                const victimFrame = this.clockPointer;
                const evictedPage = this.frames[victimFrame];
                return {
                    frameIndex: victimFrame,
                    reason: `Clock: Page ${evictedPage} (Frame ${victimFrame}) has ref bit 0 → evicted, placed Page ${this.refString[this.currentStep]}`
                };
            } else {
                // Give second chance
                this.clockBits[this.clockPointer] = 0;
                this.clockPointer = (this.clockPointer + 1) % this.numFrames;
            }
        }
    }

    getStats() {
        const total = this.currentStep;
        return {
            totalRefs: total,
            hits: this.hits,
            faults: this.faults,
            hitRatio: total === 0 ? '0.0' : ((this.hits / total) * 100).toFixed(1),
            faultRatio: total === 0 ? '0.0' : ((this.faults / total) * 100).toFixed(1)
        };
    }
}
