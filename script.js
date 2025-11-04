// Tab Navigation
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Initialize IP Checker
    checkIPAddress();
    
    // Initialize text counter
    initializeTextCounter();
});

// IP Address Checker
async function checkIPAddress() {
    const ipDisplay = document.getElementById('ip-display');
    ipDisplay.innerHTML = '<div class="loading">Checking your IP address...</div>';

    try {
        // Try multiple APIs for reliability - prefer IPv4-specific endpoints first
        // Parsers should accept either object (from JSON) or string (from plain-text)
        const apis = [
            // IPv4-only JSON endpoint
            {
                url: 'https://ipv4.ip.sb/jsonip',
                parser: (data) => ({
                    ip: (typeof data === 'string' ? data.trim() : data.ip),
                    city: 'N/A',
                    region: 'N/A',
                    country: 'N/A',
                    isp: 'N/A',
                    timezone: 'N/A'
                })
            },
            // IPv4-only plain text endpoint
            {
                url: 'https://ipv4.icanhazip.com/',
                parser: (data) => ({
                    ip: (typeof data === 'string' ? data.trim() : data.ip),
                    city: 'N/A',
                    region: 'N/A',
                    country: 'N/A',
                    isp: 'N/A',
                    timezone: 'N/A'
                })
            },
            {
                url: 'https://ipapi.co/json/',
                parser: (data) => ({
                    ip: data.ip || data.query,
                    city: data.city || 'N/A',
                    region: data.region || data.regionName || 'N/A',
                    country: data.country_name || data.country || 'N/A',
                    isp: data.org || data.isp || 'N/A',
                    timezone: data.timezone || 'N/A'
                })
            },
            {
                url: 'https://ip-api.com/json/',
                parser: (data) => ({
                    ip: data.query,
                    city: data.city || 'N/A',
                    region: data.regionName || 'N/A',
                    country: data.country || 'N/A',
                    isp: data.isp || 'N/A',
                    timezone: data.timezone || 'N/A'
                })
            },
            {
                url: 'https://ipwho.is/',
                parser: (data) => ({
                    ip: data.ip,
                    city: data.city || 'N/A',
                    region: data.region || data.region_code || 'N/A',
                    country: data.country || 'N/A',
                    isp: data.connection?.isp || data.isp || 'N/A',
                    timezone: data.timezone?.id || data.timezone || 'N/A'        
                })
            },
            {
                url: 'https://api.ipify.org?format=json',
                parser: (data) => ({
                    ip: data.ip,
                    city: 'N/A',
                    region: 'N/A',
                    country: 'N/A',
                    isp: 'N/A',
                    timezone: 'N/A'
                })
            }
        ];

        let ipData = null;
        const ipv4Regex = /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
        for (const api of apis) {
            try {
                const response = await fetch(api.url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json, text/plain'
                    },
                    mode: 'cors'
                });

                if (!response.ok) {
                    console.log(`API ${api.url} returned status ${response.status}`);
                    continue;
                }

                // Try to parse JSON; if that fails, fall back to text
                let data;
                try {
                    data = await response.json();
                } catch (jsonErr) {
                    try {
                        data = await response.text();
                    } catch (textErr) {
                        console.log(`Failed to read response from ${api.url}`);
                        continue;
                    }
                }

                // If API returned an explicit error field, skip
                if (data && typeof data === 'object' && (data.status === 'fail' || data.error)) {
                    console.log(`API ${api.url} returned error:`, data.message || data.error);
                    continue;
                }

                ipData = api.parser(data);

                // Ensure we got an IPv4 address; if not, try next API
                if (!ipData || !ipData.ip || !ipv4Regex.test(String(ipData.ip).trim())) {
                    console.log(`API ${api.url} returned non-IPv4 or invalid IP:`, ipData && ipData.ip);
                    continue;
                }

                // Accept the result (we prefer any valid IPv4 even if city is N/A)
                break;
            } catch (e) {
                console.log(`API ${api.url} failed:`, e && e.message ? e.message : e);
                continue;
            }
        }

        if (ipData) {
            ipDisplay.innerHTML = `
                <div class="ip-info">
                    <div class="ip-item">
                        <div class="ip-label">IP Address</div>
                        <div class="ip-value">${ipData.ip}</div>
                    </div>
                    <div class="ip-item">
                        <div class="ip-label">City</div>
                        <div class="ip-value">${ipData.city}</div>
                    </div>
                    <div class="ip-item">
                        <div class="ip-label">Region</div>
                        <div class="ip-value">${ipData.region}</div>
                    </div>
                    <div class="ip-item">
                        <div class="ip-label">Country</div>
                        <div class="ip-value">${ipData.country}</div>
                    </div>
                    <div class="ip-item">
                        <div class="ip-label">ISP</div>
                        <div class="ip-value">${ipData.isp}</div>
                    </div>
                    <div class="ip-item">
                        <div class="ip-label">Timezone</div>
                        <div class="ip-value">${ipData.timezone}</div>
                    </div>
                </div>
            `;
        } else {
            throw new Error('Failed to fetch IP data');
        }
    } catch (error) {
        ipDisplay.innerHTML = `
            <div style="color: var(--error);">
                Error: Unable to fetch IP address. Please check your internet connection.
            </div>
        `;
    }
}

document.getElementById('refresh-ip')?.addEventListener('click', checkIPAddress);

// Speed Test
let speedTestRunning = false;

document.getElementById('start-speedtest')?.addEventListener('click', async () => {
    if (speedTestRunning) return;
    
    speedTestRunning = true;
    const btn = document.getElementById('start-speedtest');
    btn.textContent = 'Testing...';
    btn.disabled = true;

    // Reset values
    document.getElementById('download-speed').textContent = '0 Mbps';
    document.getElementById('upload-speed').textContent = '0 Mbps';
    document.getElementById('ping-value').textContent = '0 ms';
    updateSpeedometer(0, 'download');

    // Measure Ping
    const ping = await measurePing();
    document.getElementById('ping-value').textContent = `${ping} ms`;

    // Measure Download Speed with progress updates
    const downloadSpeed = await measureDownloadSpeed((speed) => {
        updateSpeedometer(speed, 'download');
        document.getElementById('download-speed').textContent = `${speed.toFixed(2)} Mbps`;
    });
    document.getElementById('download-speed').textContent = `${downloadSpeed.toFixed(2)} Mbps`;
    updateSpeedometer(downloadSpeed, 'download');

    // Measure Upload Speed
    const uploadSpeed = await measureUploadSpeed((speed) => {
        document.getElementById('upload-speed').textContent = `${speed.toFixed(2)} Mbps`;
    });
    document.getElementById('upload-speed').textContent = `${uploadSpeed.toFixed(2)} Mbps`;

    speedTestRunning = false;
    btn.textContent = 'Start Speed Test';
    btn.disabled = false;
});

async function measurePing() {
    const times = [];
    for (let i = 0; i < 3; i++) {
        try {
            const startTime = performance.now();
            await fetch('https://www.google.com/favicon.ico?' + Date.now(), {
                method: 'HEAD',
                cache: 'no-cache'
            });
            times.push(performance.now() - startTime);
        } catch (e) {
            // Continue to next attempt
        }
    }
    if (times.length > 0) {
        return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    }
    return 0;
}

async function measureDownloadSpeed(onProgress) {
    const testSizes = [
        { size: 1 * 1024 * 1024, url: 'https://speed.cloudflare.com/__down?bytes=' },
        { size: 2 * 1024 * 1024, url: 'https://speed.cloudflare.com/__down?bytes=' },
        { size: 5 * 1024 * 1024, url: 'https://speed.cloudflare.com/__down?bytes=' }
    ];

    const speeds = [];

    for (const test of testSizes) {
        try {
            const startTime = performance.now();
            const response = await fetch(test.url + test.size + '&nocache=' + Date.now());
            if (!response.ok) continue;

            const reader = response.body.getReader();
            let receivedLength = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                receivedLength += value.length;

                const elapsed = (performance.now() - startTime) / 1000;
                if (elapsed > 0 && onProgress) {
                    const currentSpeed = (receivedLength * 8) / (elapsed * 1000000);
                    onProgress(currentSpeed);
                }
            }

            const duration = (performance.now() - startTime) / 1000;
            const speedMbps = (receivedLength * 8) / (duration * 1000000);
            speeds.push(speedMbps);
        } catch (e) {
            // Ignore and continue with next test size
            continue;
        }
    }

    if (speeds.length > 0) {
        return speeds.reduce((a, b) => a + b, 0) / speeds.length;
    }

    // Fallback: try a single fetch and measure
    try {
        const fileSize = 2 * 1024 * 1024;
        const startTime = performance.now();
        const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${fileSize}&nocache=${Date.now()}`);
        const blob = await response.blob();
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000;
        return (blob.size * 8) / (duration * 1000000);
    } catch {
        return 0;
    }
}

async function measureUploadSpeed(onProgress) {
    const testSizes = [0.5 * 1024 * 1024, 1 * 1024 * 1024];
    const speeds = [];
    
    for (const size of testSizes) {
        try {
            const testData = new Uint8Array(size);
            const blob = new Blob([testData]);
            const formData = new FormData();
            formData.append('file', blob);
            
            const startTime = performance.now();
            const response = await fetch('https://httpbin.org/post', {
                method: 'POST',
                body: formData,
                cache: 'no-cache'
            });
            
            if (!response.ok) continue;
            
            await response.json();
            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000;
            const speedMbps = (size * 8) / (duration * 1000000);
            speeds.push(speedMbps);
            
            if (onProgress) onProgress(speedMbps);
        } catch (e) {
            console.log('Upload test error:', e);
            continue;
        }
    }
    
    if (speeds.length > 0) {
        return speeds.reduce((a, b) => a + b, 0) / speeds.length;
    }
    return 0;
}

function updateSpeedometer(speed, type) {
    const needle = document.getElementById('speedometer-needle');
    const number = document.getElementById('speed-number');
    const progressArc = document.getElementById('speed-progress-arc');
    const maxSpeed = 200; // Max speed for gauge (200 Mbps)
    
    // Calculate angle: -90° to 90° (speedometer goes from left to right)
    // -90° = 0 Mbps, 0° = 100 Mbps, 90° = 200 Mbps
    const angle = Math.min((speed / maxSpeed) * 180 - 90, 90);
    
    if (needle) {
        needle.setAttribute('transform', `rotate(${angle} 150 150)`);
    }
    
    if (number) {
        number.textContent = speed.toFixed(1);
    }
    
    // Update progress arc
    if (progressArc) {
        const arcLength = 314; // Approximate arc length
        const progress = Math.min(speed / maxSpeed, 1);
        const offset = arcLength - (progress * arcLength);
        progressArc.style.strokeDashoffset = offset;
    }
}

// JSON Formatter
document.getElementById('format-json')?.addEventListener('click', () => {
    const input = document.getElementById('json-input').value;
    const output = document.getElementById('json-output');
    const error = document.getElementById('json-error');
    
    try {
        const parsed = JSON.parse(input);
        output.value = JSON.stringify(parsed, null, 2);
        error.classList.remove('show');
    } catch (e) {
        error.textContent = `Error: ${e.message}`;
        error.classList.add('show');
        output.value = '';
    }
});

document.getElementById('minify-json')?.addEventListener('click', () => {
    const input = document.getElementById('json-input').value;
    const output = document.getElementById('json-output');
    const error = document.getElementById('json-error');
    
    try {
        const parsed = JSON.parse(input);
        output.value = JSON.stringify(parsed);
        error.classList.remove('show');
    } catch (e) {
        error.textContent = `Error: ${e.message}`;
        error.classList.add('show');
        output.value = '';
    }
});

document.getElementById('validate-json')?.addEventListener('click', () => {
    const input = document.getElementById('json-input').value;
    const error = document.getElementById('json-error');
    const output = document.getElementById('json-output');
    
    try {
        JSON.parse(input);
        error.textContent = '✓ Valid JSON';
        error.style.color = 'var(--success)';
        error.style.background = 'rgba(16, 185, 129, 0.1)';
        error.classList.add('show');
        output.value = '';
    } catch (e) {
        error.textContent = `✗ Invalid JSON: ${e.message}`;
        error.style.color = 'var(--error)';
        error.style.background = 'rgba(239, 68, 68, 0.1)';
        error.classList.add('show');
        output.value = '';
    }
});

document.getElementById('clear-json')?.addEventListener('click', () => {
    document.getElementById('json-input').value = '';
    document.getElementById('json-output').value = '';
    document.getElementById('json-error').classList.remove('show');
});

// URL Encoder/Decoder
document.getElementById('encode-url')?.addEventListener('click', () => {
    const input = document.getElementById('url-input').value;
    const output = document.getElementById('url-output');
    output.value = encodeURIComponent(input);
});

document.getElementById('decode-url')?.addEventListener('click', () => {
    const input = document.getElementById('url-input').value;
    const output = document.getElementById('url-output');
    try {
        output.value = decodeURIComponent(input);
    } catch (e) {
        output.value = 'Error: Invalid encoded URL';
    }
});

document.getElementById('clear-url')?.addEventListener('click', () => {
    document.getElementById('url-input').value = '';
    document.getElementById('url-output').value = '';
});

// Base64 Encoder/Decoder
document.getElementById('encode-base64')?.addEventListener('click', () => {
    const input = document.getElementById('base64-input').value;
    const output = document.getElementById('base64-output');
    try {
        output.value = btoa(unescape(encodeURIComponent(input)));
    } catch (e) {
        output.value = 'Error: Unable to encode';
    }
});

document.getElementById('decode-base64')?.addEventListener('click', () => {
    const input = document.getElementById('base64-input').value;
    const output = document.getElementById('base64-output');
    try {
        output.value = decodeURIComponent(escape(atob(input)));
    } catch (e) {
        output.value = 'Error: Invalid Base64 string';
    }
});

document.getElementById('clear-base64')?.addEventListener('click', () => {
    document.getElementById('base64-input').value = '';
    document.getElementById('base64-output').value = '';
});

// Password Generator
document.getElementById('password-length')?.addEventListener('input', (e) => {
    document.getElementById('length-value').textContent = e.target.value;
});

document.getElementById('generate-password')?.addEventListener('click', () => {
    const length = parseInt(document.getElementById('password-length').value);
    const includeUpper = document.getElementById('include-uppercase').checked;
    const includeLower = document.getElementById('include-lowercase').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;

    if (!includeUpper && !includeLower && !includeNumbers && !includeSymbols) {
        alert('Please select at least one character type');
        return;
    }

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = '';
    if (includeUpper) charset += uppercase;
    if (includeLower) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    document.getElementById('generated-password').value = password;
    updatePasswordStrength(password);
});

document.getElementById('copy-password')?.addEventListener('click', async () => {
    const passwordInput = document.getElementById('generated-password');
    const password = passwordInput.value;
    
    if (!password) return;
    
    try {
        await navigator.clipboard.writeText(password);
        const btn = document.getElementById('copy-password');
        const originalText = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        passwordInput.select();
        document.execCommand('copy');
        const btn = document.getElementById('copy-password');
        const originalText = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }
});

function updatePasswordStrength(password) {
    const strengthMeter = document.getElementById('password-strength');
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    strengthMeter.className = 'strength-meter';
    if (strength <= 2) {
        strengthMeter.classList.add('weak');
    } else if (strength <= 3) {
        strengthMeter.classList.add('medium');
    } else {
        strengthMeter.classList.add('strong');
    }
}

// Text Tools
document.getElementById('uppercase')?.addEventListener('click', () => {
    const input = document.getElementById('text-input').value;
    document.getElementById('text-output').value = input.toUpperCase();
    updateTextStats();
});

document.getElementById('lowercase')?.addEventListener('click', () => {
    const input = document.getElementById('text-input').value;
    document.getElementById('text-output').value = input.toLowerCase();
    updateTextStats();
});

document.getElementById('title-case')?.addEventListener('click', () => {
    const input = document.getElementById('text-input').value;
    document.getElementById('text-output').value = input.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    updateTextStats();
});

document.getElementById('sentence-case')?.addEventListener('click', () => {
    const input = document.getElementById('text-input').value;
    document.getElementById('text-output').value = input.toLowerCase().replace(/(^\w{1}|\.\s*\w{1})/gi, (txt) => {
        return txt.toUpperCase();
    });
    updateTextStats();
});

document.getElementById('invert-case')?.addEventListener('click', () => {
    const input = document.getElementById('text-input').value;
    document.getElementById('text-output').value = input.split('').map(char => {
        return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
    }).join('');
    updateTextStats();
});

document.getElementById('clear-text')?.addEventListener('click', () => {
    document.getElementById('text-input').value = '';
    document.getElementById('text-output').value = '';
    updateTextStats();
});

function initializeTextCounter() {
    const textInput = document.getElementById('text-input');
    if (textInput) {
        textInput.addEventListener('input', updateTextStats);
    }
}

function updateTextStats() {
    const text = document.getElementById('text-input').value;
    document.getElementById('char-count').textContent = text.length;
    document.getElementById('word-count').textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('line-count').textContent = text ? text.split('\n').length : 0;
}

