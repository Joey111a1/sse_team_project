// Toggle between Login and Register sections
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    // Hide the login section and show the register section
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    // Hide the register section and show the login section
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
});

// Login functionality
document.getElementById('login-button').addEventListener('click', async () => {
    // Retrieve email and password values from the input fields
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    console.log("Sending login request:", { email, password });

    try {
        // Send login request to the backend API
        const response = await fetch('http://127.0.0.1:8000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });

        console.log("Login response:", response);

        // Check if the response is OK (status code 200-299)
        if (response.ok) {
            // Parse the response data
            const data = await response.json();
            console.log("Login successful:", data);

            // Save the access token in localStorage
            localStorage.setItem('access_token', data.access_token);

            // Redirect to the welcome page, passing the username as a URL parameter
            window.location.href = `../welcome/welcome.html?username=${email}`;
        } else {
            // If response not OK, parse error message and display it
            const error = await response.json();
            console.error("Login failed:", error);
            document.getElementById('login-error').textContent = error.detail;
        }
    } catch (error) {
        // Log any network or unexpected errors and show a generic error message
        console.error("Login error:", error);
        document.getElementById('login-error').textContent = "An error occurred. Please try again.";
    }
});

// Register functionality
document.getElementById('register-button').addEventListener('click', async () => {
    // Retrieve username, email, and password from registration fields
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        // Send registration request to the backend API
        const response = await fetch('http://127.0.0.1:8000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
            }),
        });
    
        console.log("Register response:", response);
    
        // Check if registration was successful
        if (response.ok) {
            const data = await response.json();
            console.log("Registration successful:", data);
            // Save the access token if provided and redirect to welcome page
            localStorage.setItem('access_token', data.access_token);
            window.location.href = `../welcome/welcome.html?username=${username}`;
        } else {
            // Handle registration error response
            const error = await response.json();
            console.error("Registration failed:", error);
            document.getElementById('register-error').textContent = error.detail;
        }
    } catch (error) {
        // Catch and handle any errors during the registration process
        console.error("Register error:", error);
        document.getElementById('register-error').textContent = "An error occurred. Please try again.";
    }
});

// Function to set up password visibility toggle for a given password field
function setupTogglePassword(passwordInputId, toggleIconId, openIconPath, closeIconPath) {
    // Get the toggle button element (assumes the toggle icon is inside a button)
    const toggleButton = document.getElementById(toggleIconId).parentElement;
    toggleButton.addEventListener('click', function () {
        // Retrieve the password input and the icon element
        const passwordInput = document.getElementById(passwordInputId);
        const toggleIcon = document.getElementById(toggleIconId);

        // Toggle input type between 'password' and 'text' and update the icon source accordingly
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.src = closeIconPath;
        } else {
            passwordInput.type = 'password';
            toggleIcon.src = openIconPath;
        }
    });
}

// Set up password toggle for the login section
setupTogglePassword(
    'login-password',
    'login-toggle-icon',
    '../../assets/icons/eye-open.png',
    '../../assets/icons/eye-close.png'
);

// Set up password toggle for the register section
setupTogglePassword(
    'register-password',
    'register-toggle-icon',
    '../../assets/icons/eye-open.png',
    '../../assets/icons/eye-close.png'
);
