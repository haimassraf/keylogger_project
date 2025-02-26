// Set current date
document.getElementById('current-date').textContent = new Date().toISOString().split('T')[0];
        
// Matrix effect
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Matrix characters (using katakana, numbers for cyberpunk feel)
const characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789';
const fontSize = 15;
const columns = Math.floor(canvas.width / fontSize);

// Array to store the y position of each column
const drops = [];

// Initialize all columns with random y positions above the canvas
for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
}

// Drawing the characters
function draw() {
    // Black background with opacity to create trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Green text color
    ctx.fillStyle = '#0f0';
    ctx.font = fontSize + 'px monospace';
    
    // Drawing the characters
    for (let i = 0; i < drops.length; i++) {
        // Get random character
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        
        // Draw character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Reset when hit bottom or randomly to create variations
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        
        // Move the character down
        drops[i]++;
    }
}

// Animation loop
setInterval(draw, 35);

// Form submission handler
document.querySelector('.login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }
    
    try {
        const response = await fetch('http://127.0.0.1:5000/get_managers', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const managers = await response.json();

        // בודק אם שם המשתמש והסיסמה תואמים לאחד המנהלים
        const manager = managers.find(m => m.user_name === username && m.password === password);

        if (manager) {
            alert("Login successful!");
            localStorage.setItem('loggedInUser', username); // שמירת שם המשתמש
            window.location.href = "index.html";
        } else {
            alert("Invalid credentials, please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
    }
});



// Resize canvas when window size changes
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});