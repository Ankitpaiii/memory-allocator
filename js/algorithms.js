// Allocation Algorithms

const Algorithms = {
    // Returns the index of the first block that fits, or -1
    firstFit: (blocks, size) => {
        for (let i = 0; i < blocks.length; i++) {
            if (!blocks[i].isAllocated && blocks[i].size >= size) {
                return i;
            }
        }
        return -1;
    },

    // Returns the index of the smallest block that fits, or -1
    bestFit: (blocks, size) => {
        let bestIdx = -1;
        let minSize = Infinity;

        for (let i = 0; i < blocks.length; i++) {
            if (!blocks[i].isAllocated && blocks[i].size >= size) {
                if (blocks[i].size < minSize) {
                    minSize = blocks[i].size;
                    bestIdx = i;
                }
            }
        }
        return bestIdx;
    },

    // Returns the index of the largest block that fits, or -1
    worstFit: (blocks, size) => {
        let worstIdx = -1;
        let maxSize = -1;

        for (let i = 0; i < blocks.length; i++) {
            if (!blocks[i].isAllocated && blocks[i].size >= size) {
                if (blocks[i].size > maxSize) {
                    maxSize = blocks[i].size;
                    worstIdx = i;
                }
            }
        }
        return worstIdx;
    },

    // Returns the index of the next block that fits, starting from lastIndex
    nextFit: (blocks, size, lastIndex) => {
        const n = blocks.length;
        // Start searching from lastIndex
        for (let i = 0; i < n; i++) {
            // Calculate effective index with wrap-around
            const idx = (lastIndex + i) % n;

            if (!blocks[idx].isAllocated && blocks[idx].size >= size) {
                return idx;
            }
        }
        return -1;
    }
};
