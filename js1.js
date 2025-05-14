document.addEventListener("DOMContentLoaded", (event) => {
    const canvas = document.getElementById("memoryCanvas");
    const ctx = canvas.getContext("2d");
    const ramSize = 8; // Smaller RAM size for demonstration
    const storageSize = 16; // Example storage size
    const pageSize = 20; // Example page size for visualization
    const ramStartX = 50;
    const storageStartX = 450;
    const startY = 50;
  
    const appData = {
      "App A": { size: 4, color: "red" },
      "App B": { size: 3, color: "blue" },
      "App C": { size: 5, color: "green" },
      "App D": { size: 2, color: "purple" },
      "App E": { size: 6, color: "orange" },
    };
  
    let ram = Array(ramSize).fill(null);
    let storage = Array(storageSize).fill(null);
    let selectedAlgorithm = "FIFO";
    let fifoQueue = [];
    let lruStack = [];
    let futureReferences = [];
    let accessFrequency = {};
    let runningApps = {};
  
    function drawMemoryDiagram(startX, startY, size, title) {
      ctx.fillStyle = "black";
      ctx.font = "16px Arial";
      ctx.fillText(title, startX, startY - 10);
  
      for (let i = 0; i < size; i++) {
        ctx.strokeStyle = "black";
        ctx.strokeRect(startX, startY + i * pageSize, pageSize, pageSize);
        ctx.fillStyle = "white";
        ctx.fillRect(startX, startY + i * pageSize, pageSize, pageSize);
      }
    }
  
    function initializeDiagrams() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawMemoryDiagram(ramStartX, startY, ramSize, "RAM");
      drawMemoryDiagram(storageStartX, startY, storageSize, "Storage");
    }
  
    function updateDiagram(memoryArray, startX, startY) {
      for (let i = 0; i < memoryArray.length; i++) {
        if (memoryArray[i] === null) {
          ctx.fillStyle = "white";
        } else {
          ctx.fillStyle = memoryArray[i].color;
        }
        ctx.fillRect(startX, startY + i * pageSize, pageSize, pageSize);
        ctx.strokeRect(startX, startY + i * pageSize, pageSize, pageSize);
      }
    }
  
    function getOptimalReplacementIndex(app) {
      let farthestIndex = -1;
      let farthestDistance = -1;
  
      for (let i = 0; i < ram.length; i++) {
        if (ram[i] !== null && ram[i].app === app) {
          let distance = futureReferences.slice(0).indexOf(ram[i].app);
          if (distance === -1) distance = futureReferences.length;
          if (distance > farthestDistance) {
            farthestDistance = distance;
            farthestIndex = i;
          }
        }
      }
  
      return farthestIndex;
    }
  
    function getLFUReplacementIndex(app) {
      let minFrequency = Infinity;
      let lfuIndex = -1;
  
      for (let i = 0; i < ram.length; i++) {
        if (ram[i] !== null && ram[i].app === app) {
          let frequency = accessFrequency[ram[i].app] || 0;
          if (frequency < minFrequency) {
            minFrequency = frequency;
            lfuIndex = i;
          }
        }
      }
  
      return lfuIndex;
    }
  
    function allocateMemory(app) {
      let allocated = false;
      let requiredPages = app.size;
      let availablePages = ram.reduce(
        (acc, curr) => (curr === null ? acc + 1 : acc),
        0
      );
  
      if (availablePages >= requiredPages) {
        for (let i = 0; i < ram.length && requiredPages > 0; i++) {
          if (ram[i] === null) {
            ram[i] = { app, color: app.color };
            accessFrequency[app] = (accessFrequency[app] || 0) + 1;
            if (selectedAlgorithm === "FIFO") {
              fifoQueue.push(i);
            } else if (selectedAlgorithm === "LRU") {
              lruStack.push(i);
            }
            requiredPages--;
          }
        }
        allocated = true;
      }
  
      if (!allocated) {
        // Page replacement logic
        let pagesToFree = app.size;
        while (pagesToFree > 0) {
          let pageIndex;
          if (selectedAlgorithm === "FIFO") {
            pageIndex = fifoQueue.shift();
          } else if (selectedAlgorithm === "LRU") {
            pageIndex = lruStack.shift();
          } else if (selectedAlgorithm === "Optimal") {
            pageIndex = getOptimalReplacementIndex(app);
          } else if (selectedAlgorithm === "LFU") {
            pageIndex = getLFUReplacementIndex(app);
          }
  
          let evictedApp = ram[pageIndex].app;
          for (let i = 0; i < storage.length; i++) {
            if (storage[i] === null) {
              storage[i] = { app: evictedApp, color: evictedApp.color };
              break;
            }
          }
  
          ram[pageIndex] = { app, color: app.color };
          accessFrequency[app] = (accessFrequency[app] || 0) + 1;
          if (selectedAlgorithm === "FIFO") {
            fifoQueue.push(pageIndex);
          } else if (selectedAlgorithm === "LRU") {
            lruStack.push(pageIndex);
          }
          pagesToFree--;
        }
      }
  
      updateDiagram(ram, ramStartX, startY);
      updateDiagram(storage, storageStartX, startY);
    }
  
    function deallocateMemory(app) {
      for (let i = 0; i < ram.length; i++) {
        if (ram[i] !== null && ram[i].app === app) {
          ram[i] = null;
        }
      }
  
      for (let i = 0; i < storage.length; i++) {
        if (storage[i] !== null && storage[i].app === app) {
          storage[i] = null;
        }
      }
  
      updateDiagram(ram, ramStartX, startY);
      updateDiagram(storage, storageStartX, startY);
    }
  
    function startSimulation() {
      const selectedApp = document.getElementById("appSelect").value;
      const app = appData[selectedApp];
      runningApps[selectedApp] = app;
      futureReferences.push(app); // Simulate future references for the Optimal algorithm
      allocateMemory(app);
    }
  
    function stopSimulation() {
      const selectedApp = document.getElementById("appSelect").value;
      const app = runningApps[selectedApp];
      if (app) {
        deallocateMemory(app);
        delete runningApps[selectedApp];
      }
    }
  
    function changeAlgorithm() {
      selectedAlgorithm = document.getElementById("algorithmSelect").value;
      fifoQueue = [];
      lruStack = [];
      futureReferences = [];
      accessFrequency = {};
      ram = Array(ramSize).fill(null);
      storage = Array(storageSize).fill(null);
      runningApps = {};
      initializeDiagrams();
    }
  
    // Initial drawing of the diagrams
    initializeDiagrams();
  
    // Event listeners for simulation controls
    document
      .getElementById("startBtn")
      .addEventListener("click", startSimulation);
    document.getElementById("stopBtn").addEventListener("click", stopSimulation);
    document
      .getElementById("algorithmSelect")
      .addEventListener("change", changeAlgorithm);
  });