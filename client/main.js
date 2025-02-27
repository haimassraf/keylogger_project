// Simple date display for footer
document.getElementById('current-date').textContent = new Date().toISOString().split('T')[0];

// Matrix effect for background
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.getElementById('matrixCanvas').appendChild(canvas);

const ctx = canvas.getContext('2d');
const characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789';
const columns = Math.floor(canvas.width / 20);
const drops = [];

for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f0';
    ctx.font = '15px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

setInterval(drawMatrix, 50);

// Manager popup functionality
document.addEventListener('DOMContentLoaded', function () {
    const managerBtn = document.getElementById('managerName');
    const popup = document.querySelector('.popup');
    const popupUsername = document.getElementById('popupUsername');

    // Set the popup username to match the manager name
    function updateUsername() {
        const manager = localStorage.getItem('loggedInUser') || 'User';
        // if (managerBtn) managerBtn.textContent = manager;
        if (popupUsername) popupUsername.textContent = manager;
    }

    // Initial update
    updateUsername();

    // Toggle popup when manager button is clicked
    if (managerBtn) {
        managerBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            popup.classList.toggle('active');
        });
    }

    // Close popup when clicking outside
    document.addEventListener('click', function (e) {
        if (popup && popup.classList.contains('active') && !popup.contains(e.target)) {
            popup.classList.remove('active');
        }
    });

    // Handle logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('loggedInUser');
            alert('Logged out successfully!');
            window.location.href = 'login.html'; // Redirect to login page or reload
        });
    }

    // Handle edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function () {
            const currentUsername = localStorage.getItem('loggedInUser') || 'User';
            const newUsername = prompt('Edit your username:', currentUsername);

            if (newUsername && newUsername.trim() !== '') {
                localStorage.setItem('loggedInUser', newUsername.trim());
                updateUsername();
                alert('Profile updated successfully!');
                popup.classList.remove('active');
            }
        });
    }

    // Handle add user button
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function () {
            const newUser = prompt('Enter new user name:');

            if (newUser && newUser.trim() !== '') {
                // Get existing users from select element
                const userSelect = document.getElementById('userSelect');

                // Create new option
                const option = document.createElement('option');
                option.value = newUser.trim();
                option.textContent = newUser.trim();

                // Add to select
                if (userSelect) {
                    userSelect.appendChild(option);
                    alert(`New user "${newUser.trim()}" added successfully!`);

                    // Update users count
                    const activeUsersElement = document.getElementById('activeUsers');
                    if (activeUsersElement) {
                        const currentCount = parseInt(activeUsersElement.textContent) || 0;
                        activeUsersElement.textContent = currentCount + 1;
                    }
                } else {
                    alert('Could not add user. User selection element not found.');
                }

                popup.classList.remove('active');
            }
        });
    }
});

function exportData() {
    if (!gridApi) {
        alert("No data to export.");
        return;
    }

    const rowData = [];
    gridApi.forEachNode((node) => rowData.push(node.data));

    if (rowData.length === 0) {
        alert("No data available for export.");
        return;
    }

    // קבלת שם המשתמש שנבחר מהתפריט
    const userSelect = document.querySelector('#userSelect');
    const selectedUser = userSelect.value || "All Users";

    // כותרת עליונה עם שם המשתמש
    const title = `Data Export for: ${selectedUser}\n`;

    // כותרות העמודות
    const headers = ["ID", "Window", "Timestamp", "Logs"];

    // המרת הנתונים לפורמט CSV
    const csvContent = [
        title, // שורה ראשונה - כותרת עם שם המשתמש
        headers.join(","), // שורה שנייה - כותרות העמודות
        ...rowData.map((row, index) =>
            [index + 1, row.window, row.timestamp, `"${row.logs.replace(/"/g, '""')}"`].join(",") // המרת כל שורה למערך
        )
    ].join("\n");

    // יצירת קובץ והורדתו
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exported_data_${selectedUser.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}


let gridApi;

async function fetchData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/data');
        const data = await response.json();

        const users = [...new Set(data.map(entry => entry.user))];

        const userSelect = document.querySelector('#userSelect');
        userSelect.innerHTML = '<option value="">Select User</option>' +
            users.map(user => `<option value="${user}">${user}</option>`).join('');

        function parseCustomTimestamp(timestamp) {
            const parts = timestamp.split(' '); // מפריד תאריך ושעה
            const dateParts = parts[0].split('/'); // מפריד יום/חודש/שנה
            const timeParts = parts[1].split(':'); // מפריד שעה/דקות

            const day = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1; // חודשים ב-JavaScript הם 0-11
            const year = 2000 + parseInt(dateParts[2], 10); // מוסיפים 2000 לשנה כדי לקבל שנה מלאה

            const hours = parseInt(timeParts[0], 10);
            const minutes = parseInt(timeParts[1], 10);

            return new Date(year, month, day, hours, minutes).getTime(); // מחזיר timestamp תקני
        }

        function updateGrid(selectedUser) {
            document.querySelector('#user').innerHTML = selectedUser ? `${selectedUser}'s all data:` : 'All Users data:';

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

            // עדכון מספר ההקלדות
            document.querySelector('#keystrokeCount').textContent = rowData.length;

            // עדכון מספר המשתמשים הפעילים (מספר המשתמשים הכולל)
            const activeUsersCount = users.length;
            document.querySelector('#activeUsers').textContent = activeUsersCount;

            // חישוב זמן הסשן
            if (rowData.length > 0) {
                const sessionStartTime = parseCustomTimestamp(rowData[0].timestamp);
                const sessionEndTime = Math.max(...rowData.map(entry => parseCustomTimestamp(entry.timestamp)));

                if (!isNaN(sessionStartTime) && !isNaN(sessionEndTime)) {
                    const sessionDuration = Math.floor((sessionEndTime - sessionStartTime) / 60000);
                    document.querySelector('#sessionTime').textContent = `${sessionDuration}m`;
                } else {
                    document.querySelector('#sessionTime').textContent = `0m`;
                }
            } else {
                document.querySelector('#sessionTime').textContent = `0m`;
            }
        }

        const gridOptions = {
            columnDefs: [
                { headerName: "ID", valueGetter: (params) => params.node.rowIndex + 1, flex: 1 },
                { headerName: 'Window', field: 'window', filter: 'agTextColumnFilter', flex: 2 },
                { headerName: 'Timestamp', field: 'timestamp', filter: 'agTextColumnFilter', flex: 2 },
                { headerName: 'Logs', field: 'logs', filter: 'agTextColumnFilter', flex: 9 }
            ],
            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true,
                headerClass: 'header-center'
            },
            onCellClicked: function (event) {
                showData(event.data.logs);
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
    const text = hexToUtf8(hexText);
    const keyCycle = key.repeat(Math.ceil(text.length / key.length)).slice(0, text.length);
    return text.split('').map((char, i) =>
        String.fromCharCode(char.charCodeAt(0) ^ keyCycle.charCodeAt(i))
    ).join('');
}

function hexToUtf8(hex) {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return new TextDecoder("utf-8").decode(bytes);
}

window.addEventListener('load', function () {
    fetchData();
});

function reload() {
    window.location.reload();
}

function showData(vlaue) {
    document.getElementById('chooseLog').innerText = vlaue;
}
