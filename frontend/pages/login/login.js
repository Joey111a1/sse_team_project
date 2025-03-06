// Toggle between Login and Register sections
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
});

// Login Functionality
document.getElementById('login-button').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    console.log("Sending login request:", { email, password });

    try {
        // 发送登录请求
        const response = await fetch('https://pixel-art.azurewebsites.net/api/users/login', {
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

        // 检查响应状态
        if (response.ok) {
            // 解析响应数据
            const data = await response.json();
            console.log("Login successful:", data);
            const { access_token, user_id, username } = data;

            // 保存访问令牌到 localStorage
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user_id', user_id);
            localStorage.setItem('username', username);

            // 跳转到欢迎页面
            window.location.href = `../welcome/welcome.html?username=${username}`;
;
        } else {
            const error = await response.json();
            console.error("Login failed:", error);
        
            if (Array.isArray(error.detail)) {
                const messages = error.detail.map(err => err.msg).join('; ');
                document.getElementById('login-error').textContent = messages;
              } else if (typeof error.detail === 'string') {
                document.getElementById('login-error').textContent = error.detail;
              } else {
                document.getElementById('login-error').textContent = JSON.stringify(error);
              }
        }        
    } catch (error) {
        // 捕获并处理异常
        console.error("Login error:", error);
        document.getElementById('login-error').textContent = "An error occurred. Please try again.";
    }
});

// Register Functionality
document.getElementById('register-button').addEventListener('click', async () => {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
		const response = await fetch('https://pixel-art.azurewebsites.net/api/users/register', {
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
	
		if (response.ok) {
			const data = await response.json();
			console.log("Registration successful:", data);
			localStorage.setItem('access_token', data.access_token);
            window.location.href = "login.html";
		} else {
            const error = await response.json();
            console.error("Registration failed:", error);
        
            if (Array.isArray(error.detail)) {
                const messages = error.detail.map(err => err.msg).join('; ');
                document.getElementById('registration-error').textContent = messages;
              } else if (typeof error.detail === 'string') {
                document.getElementById('registration-error').textContent = error.detail;
              } else {
                document.getElementById('registration-error').textContent = JSON.stringify(error);
              }
        }        
	} catch (error) {
		console.error("Register error:", error);
		document.getElementById('register-error').textContent = "An error occurred. Please try again.";
	}
});

function setupTogglePassword(passwordInputId, toggleIconId, openIconPath, closeIconPath) {
    const toggleButton = document.getElementById(toggleIconId).parentElement;
    toggleButton.addEventListener('click', function () {
        const passwordInput = document.getElementById(passwordInputId);
        const toggleIcon = document.getElementById(toggleIconId);

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.src = closeIconPath;
        } else {
            passwordInput.type = 'password';
            toggleIcon.src = openIconPath;
        }
    });
}

// 设置登录部分的切换按钮
setupTogglePassword(
    'login-password',
    'login-toggle-icon',
    '../../assets/icons/eye-open.png',
    '../../assets/icons/eye-close.png'
);

// 设置注册部分的切换按钮
setupTogglePassword(
    'register-password',
    'register-toggle-icon',
    '../../assets/icons/eye-open.png',
    '../../assets/icons/eye-close.png'
);