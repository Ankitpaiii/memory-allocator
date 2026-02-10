// Memory State Management
class MemoryBlock {
    constructor(id, size, isAllocated = false, processId = null) {
        this.id = id;
        this.size = size;
        this.isAllocated = isAllocated;
        this.processId = processId;
    }
}

class MemorySystem {
    constructor(initialState) {
        this.reset(initialState);
    }

    reset(initialState = null) {
        // If initialState is null, we might want to just reset to current totalSize?
        // But the ui.js always passes new state on init. 
        // For internal reset, we rely on the object properties if not passed.

        let newBlocks = [];
        let newTotalSize = 0;

        if (Array.isArray(initialState)) {
            // Custom partitions
            initialState.forEach((size, index) => {
                newBlocks.push(new MemoryBlock(index + 1, size, false, null)); // IDs start at 1
                newTotalSize += size;
            });
            this.totalSize = newTotalSize;
            this.blocks = newBlocks;
            this.nextBlockId = newBlocks.length + 1;
        } else if (typeof initialState === 'number') {
            // Single block
            this.totalSize = initialState;
            this.blocks = [new MemoryBlock(1, this.totalSize, false, null)];
            this.nextBlockId = 2;
        } else if (initialState === null && this.totalSize) {
            // Soft reset (keep size, clear data) - fallback to single block? 
            // Or should we remember the initial configuration?
            // For simplicity, let's assume soft reset just clears everything to one big block
            // UNLESS we want to support "Reset to initial custom partitions".
            // Implementation Plan didn't specify, but "soft reset" usually means clear allocations.
            // If we have custom partitions, a soft reset should probably restore those partitions.

            // However, the UI calls new MemorySystem() on every initialize.
            // And resetMemory() sets memorySystem = null.
            // So we actually don't need a complex soft reset for the current UI flow.
            // But let's keep it safe.
            this.blocks = [new MemoryBlock(1, this.totalSize, false, null)];
            this.nextBlockId = 2;
        }

        this.lastAllocatedIndex = 0; // For Next Fit

        // Stats
        this.allocationsAttempted = 0;
        this.allocationsSuccessful = 0;
    }

    // Allocate memory for a process using the specified algorithm
    allocate(processId, size, algorithmName) {
        this.allocationsAttempted++;
        let index = -1;

        // Check for duplicate process ID
        if (this.blocks.some(b => b.processId === processId)) {
            return { success: false, message: `Process ID ${processId} already exists.` };
        }

        // Find block based on algorithm
        switch (algorithmName) {
            case 'firstFit':
                index = Algorithms.firstFit(this.blocks, size);
                break;
            case 'bestFit':
                index = Algorithms.bestFit(this.blocks, size);
                break;
            case 'worstFit':
                index = Algorithms.worstFit(this.blocks, size);
                break;
            case 'nextFit':
                index = Algorithms.nextFit(this.blocks, size, this.lastAllocatedIndex);
                break;
            default:
                return { success: false, message: "Unknown algorithm." };
        }

        if (index === -1) {
            return { success: false, message: `Allocation failed: No suitable block found using ${algorithmName}.` };
        }

        this.allocationsSuccessful++;
        const block = this.blocks[index];

        // If block is larger than requested, split it
        if (block.size > size) {
            const remainingSize = block.size - size;
            const newBlock = new MemoryBlock(this.nextBlockId++, remainingSize, false, null);

            // shrink current block
            block.size = size;

            // insert new block after current
            this.blocks.splice(index + 1, 0, newBlock);
        }

        // Allocate the block
        block.isAllocated = true;
        block.processId = processId;

        // Update lastAllocatedIndex for Next Fit
        // Point to the block *after* the one just allocated, wrapping if needed?
        // Standard Next Fit usually starts searching from where it left off.
        // If we split, the next block is at index + 1.
        // If we didn't split, the next block is at index + 1.
        this.lastAllocatedIndex = (index + 1) % this.blocks.length;

        return { success: true, message: `Allocated ${size}KB for ${processId} at Block ${block.id}.` };
    }

    deallocate(processId) {
        const blockIndex = this.blocks.findIndex(b => b.processId === processId);

        if (blockIndex === -1) {
            return { success: false, message: `Process ID ${processId} not found.` };
        }

        const block = this.blocks[blockIndex];
        block.isAllocated = false;
        block.processId = null;

        const size = block.size;

        // Merge adjacent free blocks
        this.mergeFreeBlocks();

        // Reset lastAllocatedIndex if it's out of bounds after merge
        if (this.lastAllocatedIndex >= this.blocks.length) {
            this.lastAllocatedIndex = 0;
        }

        return { success: true, message: `Deallocated ${processId} (${size}KB).` };
    }

    mergeFreeBlocks() {
        for (let i = 0; i < this.blocks.length - 1; i++) {
            if (!this.blocks[i].isAllocated && !this.blocks[i + 1].isAllocated) {
                // Merge i and i+1
                this.blocks[i].size += this.blocks[i + 1].size;
                // Remove i+1
                this.blocks.splice(i + 1, 1);
                // Decrement i to checking this new merged block with the next one
                i--;
            }
        }
    }

    getStats() {
        const total = this.totalSize;
        let used = 0;
        let free = 0;
        let largestFree = 0;
        let freeBlocksCount = 0;

        this.blocks.forEach(b => {
            if (b.isAllocated) {
                used += b.size;
            } else {
                free += b.size;
                freeBlocksCount++;
                if (b.size > largestFree) largestFree = b.size;
            }
        });

        const utilization = ((used / total) * 100).toFixed(1);
        // External fragmentation: Total free memory - Largest free block
        // (If a process needs > largestFree but < totalFree, it fails due to ext frag)
        // A common simple metric is just "Total Free Memory" that is fragmented (failed to alloc).
        // But here we can just show total free vs largest contiguous.

        // Another definition: Ext Frag = 1 - (Largest Free Block / Total Free Memory)
        // But the user UI asks for "External Fragmentation (KB)".
        // Usually, external fragmentation is the sum of free memory that *cannot* be used because it's not contiguous.
        // A simple representation is just Total Free Memory. But to be specific,
        // if we consider "Total Free Memory" as potential, then "Largest Free Block" is the max we can alloc.
        // So Ext Frag could be (Total Free - Largest Free).

        let extFrag = free - largestFree;

        // Fix: If no memory is used, or if we just initialized with partitions, 
        // the user might find "Fragmentation" confusing. 
        // Technically it IS fragmented, but for the simulator UX, we can hide it 
        // until operations start, OR just leave it. 
        // User specifically reported this as a logical error. 
        // Let's set it to 0 if used === 0, assuming "fresh" state means "no fragmentation incurred by processs yet".
        if (used === 0) {
            extFrag = 0;
        }

        const successRate = this.allocationsAttempted === 0 ? 100 : ((this.allocationsSuccessful / this.allocationsAttempted) * 100).toFixed(1);

        return {
            total,
            used,
            free,
            utilization,
            extFrag,
            largestFree,
            blockCount: this.blocks.length,
            successRate
        };
    }
}
