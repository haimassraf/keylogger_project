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

// Main functionality
document.addEventListener('DOMContentLoaded', function () {
    const managerBtn = document.getElementById('managerName');
    const popup = document.querySelector('.popup');
    const popupUsername = document.getElementById('popupUsername');

    // Set the popup username to match the manager name
    function updateUsername() {
        const manager = localStorage.getItem('loggedInUser') || 'User';
        const isAdmin = localStorage.getItem('isAdmin');
        if (popupUsername) popupUsername.textContent = manager;
        if (managerBtn) managerBtn.textContent = manager;
        if(isAdmin == 'true'){
            document.getElementById('addUserBtn').style.display = 'block';
        }
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
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('email');
            alert('Logged out successfully!');
            window.location.href = 'login.html';
        });
    }

    // Handle edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function () {
            const modal = document.getElementById('editProfileModal');
            const currentUsername = localStorage.getItem('loggedInUser') || 'User';
            const currentEmail = localStorage.getItem('email') || ' ';
            document.getElementById('editEmail').value = currentEmail;
            document.getElementById('editUsername').value = currentUsername;
            modal.style.display = 'flex';
            popup.classList.remove('active');
        });
    }

    // Handle add user button
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function () {
            const modal = document.getElementById('addUserModal');
            modal.style.display = 'flex';
            popup.classList.remove('active');
        });
    }

    // Handle edit profile form submission
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const currentUsername = localStorage.getItem('loggedInUser') || 'User';
            const formData = new FormData(editProfileForm);
            const updateData = {};
            
            formData.forEach((value, key) => {
                if (value && (key !== 'user_name' || value !== currentUsername)) {
                    updateData[key] = value.trim();
                }
            });

            if (Object.keys(updateData).length === 0) {
                alert('No changes to update');
                return;
            }

            try {
                const response = await fetch(`http://127.0.0.1:5000/update_manager/${currentUsername}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData)
                });

                const result = await response.json();

                if (response.ok) {
                    if (updateData.user_name){
                        localStorage.setItem('loggedInUser', updateData.user_name);
                    }
                    if ( updateData.email){
                        localStorage.setItem('email', updateData.email);
                    }
                    updateUsername();
                    alert('Profile updated successfully!');
                    closeModal('editProfileModal');
                } else {
                    alert(result.error || 'Failed to update profile');
                }
            } catch (error) {
                console.error('Error updating manager:', error);
                alert('Error updating profile. Please try again.');
            }
        });
    }

    // Handle add user form submission
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(addUserForm);
            const newManager = {};

            formData.forEach((value, key) => {
                newManager[key] = value.trim();
            });

            try {
                const response = await fetch('http://127.0.0.1:5000/add_manager', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newManager)
                });

                const result = await response.json();

                if (response.status === 201) {
                    const userSelect = document.getElementById('userSelect');
                    if (userSelect) {
                        const option = document.createElement('option');
                        option.value = newManager.user_name;
                        option.textContent = newManager.user_name;
                        userSelect.appendChild(option);

                        const activeUsersElement = document.getElementById('activeUsers');
                        if (activeUsersElement) {
                            const currentCount = parseInt(activeUsersElement.textContent) || 0;
                            activeUsersElement.textContent = currentCount + 1;
                        }
                    }

                    alert(`Manager "${newManager.user_name}" added successfully!`);
                    closeModal('addUserModal');
                } else {
                    alert(result.error || 'Failed to add manager');
                }
            } catch (error) {
                console.error('Error adding manager:', error);
                alert('Error adding manager. Please try again.');
            }
        });
    }
});

// Function to close modals
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    if (modalId === 'editProfileModal') {
        document.getElementById('editProfileForm').reset();
        document.getElementById('editUsername').value = localStorage.getItem('loggedInUser') || 'User';
    } else if (modalId === 'addUserModal') {
        document.getElementById('addUserForm').reset();
    }
}

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    const editModal = document.getElementById('editProfileModal');
    const addModal = document.getElementById('addUserModal');
    if (event.target === editModal) {
        closeModal('editProfileModal');
    } else if (event.target === addModal) {
        closeModal('addUserModal');
    }
});

// Export data function
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

    const userSelect = document.querySelector('#userSelect');
    const selectedUser = userSelect.value || "All Users";
    const title = `Data Export for: ${selectedUser}\n`;
    const headers = ["ID", "Window", "Timestamp", "Logs"];

    const csvContent = [
        title,
        headers.join(","),
        ...rowData.map((row, index) =>
            [index + 1, row.window, row.timestamp, `"${row.logs.replace(/"/g, '""')}"`].join(",")
        )
    ].join("\n");

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
