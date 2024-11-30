// Global variables
let totalMemorySize = 0;
let remainingMemorySize = 0;
let memoryBlocks = [];
let lastAllocatedIndex = -1;
let isSimulating = false;

// Default memory configuration
const DEFAULT_MEMORY_SIZE = 1650;
const DEFAULT_BLOCKS = [
    { size: 120 },
    { size: 250 },
    { size: 75 },
    { size: 400 },
    { size: 90 },
    { size: 200 },
    { size: 50 },
    { size: 315 },
    { size: 150 }
];

// Initialize with default setup or show custom setup
function useDefaultSetup() {
    // Hide setup panel
    document.getElementById('setupPanel').style.display = 'none';
    document.getElementById('simulationPanel').style.display = 'block';
    
    // Set default memory size
    totalMemorySize = DEFAULT_MEMORY_SIZE;
    remainingMemorySize = 0;
    
    // Create default blocks
    memoryBlocks = DEFAULT_BLOCKS.map((block, index) => ({
        id: index + 1,
        size: block.size,
        free: block.size,
        allocated: 0
    }));
    
    // Initialize simulation
    updateMemoryVisualization();
    updateStats();
    showMessage('Default memory configuration loaded!', 'success');
}

function showCustomSetup() {
    document.getElementById('setupPanel').style.display = 'block';
    document.getElementById('simulationPanel').style.display = 'none';
    resetSetup();
}

// Setup phase functions
function setTotalMemory() {
    const totalMemoryInput = document.getElementById('totalMemorySize');
    const size = parseInt(totalMemoryInput.value);
    
    if (!size || size <= 0) {
        showMessage('Please enter a valid memory size!', 'error');
        return;
    }

    totalMemorySize = size;
    remainingMemorySize = size;
    document.getElementById('blockSetup').style.display = 'block';
    updateRemainingMemory();
    showMessage('Total memory size set successfully!', 'success');
}

function updateRemainingMemory() {
    const remainingMemoryElement = document.getElementById('remainingMemory');
    remainingMemoryElement.textContent = `Remaining Memory: ${remainingMemorySize} KB`;
}

function addBlock() {
    const blockSizeInput = document.getElementById('blockSize');
    const size = parseInt(blockSizeInput.value);

    if (!size || size <= 0) {
        showMessage('Please enter a valid block size!', 'error');
        return;
    }

    if (size > remainingMemorySize) {
        showMessage(`Block size exceeds remaining memory (${remainingMemorySize} KB)!`, 'error');
        return;
    }

    const blockId = memoryBlocks.length + 1;
    const newBlock = {
        id: blockId,
        size: size,
        free: size,
        allocated: 0
    };

    memoryBlocks.push(newBlock);
    remainingMemorySize -= size;
    updateRemainingMemory();
    updateBlockList();
    blockSizeInput.value = '';

    // Show start simulation button if at least one block is added
    if (memoryBlocks.length > 0) {
        document.getElementById('startSimBtn').style.display = 'block';
    }

    showMessage('Block added successfully!', 'success');
}

function removeBlock(blockId) {
    const blockIndex = memoryBlocks.findIndex(block => block.id === blockId);
    if (blockIndex !== -1) {
        remainingMemorySize += memoryBlocks[blockIndex].size;
        memoryBlocks.splice(blockIndex, 1);
        // Reassign IDs
        memoryBlocks.forEach((block, index) => {
            block.id = index + 1;
        });
        updateRemainingMemory();
        updateBlockList();
        
        // Hide start simulation button if no blocks remain
        if (memoryBlocks.length === 0) {
            document.getElementById('startSimBtn').style.display = 'none';
        }
    }
}

function updateBlockList() {
    const blockList = document.getElementById('blockList');
    blockList.innerHTML = '';

    memoryBlocks.forEach(block => {
        const blockItem = document.createElement('div');
        blockItem.className = 'block-item';
        blockItem.innerHTML = `
            <span>Block ${block.id}: ${block.size} KB</span>
            <button onclick="removeBlock(${block.id})">Remove</button>
        `;
        blockList.appendChild(blockItem);
    });
}

function startSimulation() {
    if (memoryBlocks.length === 0) {
        showMessage('Please add at least one memory block!', 'error');
        return;
    }

    if (remainingMemorySize === totalMemorySize) {
        showMessage('Please add some memory blocks before starting!', 'error');
        return;
    }

    document.getElementById('setupPanel').style.display = 'none';
    document.getElementById('simulationPanel').style.display = 'block';
    
    // Initialize simulation view
    updateMemoryVisualization();
    updateStats();
    showMessage('Simulation started! You can now allocate processes.', 'success');
}

function resetAll() {
    // Show setup choice buttons
    document.getElementById('setupPanel').style.display = 'none';
    document.getElementById('simulationPanel').style.display = 'block';
    
    // Reset all variables
    totalMemorySize = 0;
    remainingMemorySize = 0;
    memoryBlocks = [];
    lastAllocatedIndex = -1;
    isSimulating = false;

    // Reset UI
    document.getElementById('totalMemorySize').value = '';
    document.getElementById('blockSize').value = '';
    document.getElementById('blockSetup').style.display = 'none';
    document.getElementById('startSimBtn').style.display = 'none';
    document.getElementById('blockList').innerHTML = '';
    
    // Reload the page to show setup choice
    location.reload();
}

// Simulation phase functions
function updateMemoryVisualization() {
    const memoryVisualization = document.getElementById('memoryBlocks');
    memoryVisualization.innerHTML = '';

    memoryBlocks.forEach(block => {
        const blockElement = document.createElement('div');
        blockElement.className = 'memory-block';
        if (block.allocated > 0) {
            blockElement.classList.add('allocated');
        }

        blockElement.innerHTML = `
            <div class="block-info">
                <span class="block-id">Block ${block.id}</span>
                <span class="block-size">${block.size} KB</span>
                <span class="block-free">Free: ${block.free} KB</span>
            </div>
        `;

        memoryVisualization.appendChild(blockElement);
    });
}

function updateStats() {
    const totalMemoryElement = document.getElementById('totalMemoryStats');
    const allocatedMemoryElement = document.getElementById('allocatedMemory');
    const freeMemoryElement = document.getElementById('freeMemory');

    const allocatedMemory = memoryBlocks.reduce((sum, block) => sum + block.allocated, 0);
    const freeMemory = memoryBlocks.reduce((sum, block) => sum + block.free, 0);

    totalMemoryElement.textContent = `${totalMemorySize} KB`;
    allocatedMemoryElement.textContent = `${allocatedMemory} KB`;
    freeMemoryElement.textContent = `${freeMemory} KB`;
}

function showMessage(text, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main allocation function
async function allocateMemory() {
    if (isSimulating) return;
    isSimulating = true;

    const processSizeInput = document.getElementById('processSize');
    const processSize = parseInt(processSizeInput.value);

    // Validate input
    if (!processSize || processSize <= 0) {
        showMessage('Please enter a valid process size!', 'error');
        isSimulating = false;
        return;
    }

    // Start searching from last allocated position
    let startIndex = lastAllocatedIndex === -1 ? 0 : lastAllocatedIndex;
    let currentIndex = startIndex;
    let found = false;
    let firstIteration = true;

    do {
        const block = memoryBlocks[currentIndex];
        
        // Only check and highlight blocks that are completely free
        if (block.free === block.size) {
            // Highlight current block being checked
            updateBlockVisualization(block, 'checking');
            await sleep(500);

            if (block.free >= processSize) {
                // Allocate memory
                block.allocated += processSize;
                block.free -= processSize;
                lastAllocatedIndex = currentIndex;
                found = true;

                // Update visualization
                updateBlockVisualization(block, 'allocated');
                showMessage(`Successfully allocated ${processSize} KB to Block ${block.id}`, 'success');
                break;
            }

            // Reset visualization for blocks that weren't suitable
            updateBlockVisualization(block, '');
        }

        // Move to next block
        currentIndex = (currentIndex + 1) % memoryBlocks.length;
        
        // Check if we've completed one full iteration
        if (currentIndex === startIndex) {
            if (firstIteration) {
                firstIteration = false;
            } else {
                break;
            }
        }

        await sleep(300);
    } while (!found);

    if (!found) {
        showMessage('Process cannot be allocated: No suitable block found!', 'error');
    }

    updateStats();
    isSimulating = false;
}

function updateBlockVisualization(block, state) {
    const blocks = document.querySelectorAll('.memory-block');
    const blockElement = blocks[block.id - 1];
    
    // Remove all state classes
    blockElement.classList.remove('checking', 'allocated');
    
    // Add new state class if specified
    if (state) {
        blockElement.classList.add(state);
    }

    // Update block info
    const blockInfo = blockElement.querySelector('.block-info');
    blockInfo.innerHTML = `
        <span class="block-id">Block ${block.id}</span>
        <span class="block-size">${block.size} KB</span>
        <span class="block-free">Free: ${block.free} KB</span>
    `;
}

function resetMemory() {
    memoryBlocks.forEach(block => {
        block.allocated = 0;
        block.free = block.size;
    });
    lastAllocatedIndex = -1;
    updateMemoryVisualization();
    updateStats();
    showMessage('Memory reset successfully!', 'success');
}

function resetSetup() {
    // Reset all variables
    totalMemorySize = 0;
    remainingMemorySize = 0;
    memoryBlocks = [];
    lastAllocatedIndex = -1;
    isSimulating = false;

    // Reset UI
    document.getElementById('totalMemorySize').value = '';
    document.getElementById('blockSize').value = '';
    document.getElementById('blockSetup').style.display = 'none';
    document.getElementById('setupPanel').style.display = 'block';
    document.getElementById('simulationPanel').style.display = 'none';
    document.getElementById('startSimBtn').style.display = 'none';
    document.getElementById('blockList').innerHTML = '';
    
    showMessage('Setup reset. You can start fresh!', 'success');
}

// Initialize the simulation
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
});
