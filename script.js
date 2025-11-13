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

    // Initialize JSON Tab Navigation
    initializeJsonTabs();

    // Initialize IP Checker
    checkIPAddress();
    
    // Initialize text counter
    initializeTextCounter();
});

// JSON Tab Navigation
function initializeJsonTabs() {
    const jsonTabBtns = document.querySelectorAll('.json-tab-btn');
    const jsonTabContents = document.querySelectorAll('.json-tab-content');

    jsonTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-json-tab');
            
            // Remove active class from all tabs and contents
            jsonTabBtns.forEach(b => b.classList.remove('active'));
            jsonTabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

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
    const originalText = btn.textContent;
    btn.textContent = '⏳ Testing... Please wait';
    btn.disabled = true;

    // Reset values
    document.getElementById('download-speed').textContent = '⏳ Testing...';
    document.getElementById('upload-speed').textContent = '⏳ Testing...';
    document.getElementById('ping-value').textContent = '⏳ Testing...';
    updateSpeedometer(0);

    try {
        // Measure Ping first
        document.getElementById('ping-value').textContent = '⏳ Testing ping...';
        const ping = await measurePing();
        document.getElementById('ping-value').textContent = `${ping} ms`;

        // Measure Download Speed
        document.getElementById('download-speed').textContent = '⏳ Testing download...';
        updateSpeedometer(0);
        const downloadSpeed = await measureDownloadSpeed();
        document.getElementById('download-speed').textContent = `${downloadSpeed.toFixed(2)} Mbps`;
        updateSpeedometer(Math.min(downloadSpeed, 200));

        // Measure Upload Speed with activity indicator
        document.getElementById('upload-speed').textContent = '⏳ Testing upload...';
        updateSpeedometer(0);
        
        const uploadSpeed = await measureUploadSpeed();
        document.getElementById('upload-speed').textContent = `${uploadSpeed.toFixed(2)} Mbps`;
        updateSpeedometer(Math.min(uploadSpeed, 200));
        
        // Reset speedometer after a brief delay
        setTimeout(() => {
            updateSpeedometer(0);
        }, 1500);
        
    } catch (error) {
        console.error('Speed test error:', error);
        document.getElementById('download-speed').textContent = '❌ Error';
        document.getElementById('upload-speed').textContent = '❌ Error';
        updateSpeedometer(0);
    }

    speedTestRunning = false;
    btn.textContent = originalText;
    btn.disabled = false;
});

async function measurePing() {
    const times = [];
    const pingAttempts = 5;
    
    for (let i = 0; i < pingAttempts; i++) {
        try {
            const startTime = performance.now();
            await fetch('https://www.google.com/favicon.ico?' + Math.random(), {
                method: 'HEAD',
                cache: 'no-cache',
                mode: 'no-cors',
                timeout: 5000
            });
            const pingTime = performance.now() - startTime;
            if (pingTime > 0) {
                times.push(pingTime);
            }
        } catch (e) {
            // Try alternative ping endpoint
            try {
                const startTime = performance.now();
                await fetch('https://cloudflare.com?' + Math.random(), {
                    method: 'HEAD',
                    cache: 'no-cache',
                    mode: 'no-cors',
                    timeout: 5000
                });
                const pingTime = performance.now() - startTime;
                if (pingTime > 0) {
                    times.push(pingTime);
                }
            } catch (err) {
                // Continue to next attempt
            }
        }
    }
    
    if (times.length > 0) {
        // Sort and remove outliers
        times.sort((a, b) => a - b);
        const median = times[Math.floor(times.length / 2)];
        return Math.round(median);
    }
    return 0;
}

async function measureDownloadSpeed() {
    const testDuration = 8000; // 8 seconds test
    const startTime = performance.now();
    let totalBytes = 0;
    let updateCount = 0;

    try {
        const response = await fetch(
            `https://speed.cloudflare.com/__down?bytes=100000000&nocache=${Math.random()}`,
            { cache: 'no-cache' }
        );
        
        if (!response.ok) throw new Error('Download test failed');

        const reader = response.body.getReader();
        let lastUpdateTime = startTime;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            totalBytes += value.length;
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;

            // Update display every 400ms for smooth animation
            if (currentTime - lastUpdateTime > 400) {
                if (elapsedTime > 500) { // Start showing speed after 0.5s
                    const seconds = elapsedTime / 1000;
                    const speedMbps = (totalBytes * 8) / (seconds * 1000000);
                    updateSpeedometer(Math.min(speedMbps, 200));
                    updateCount++;
                }
                lastUpdateTime = currentTime;
            }

            // Stop after test duration or if we have enough data
            if (elapsedTime > testDuration) {
                reader.cancel();
                break;
            }
        }

        // Final calculation
        const totalSeconds = (performance.now() - startTime) / 1000;
        const finalSpeed = (totalBytes * 8) / (totalSeconds * 1000000);
        
        console.log(`Download: ${totalBytes} bytes in ${totalSeconds.toFixed(2)}s = ${finalSpeed.toFixed(2)} Mbps`);
        return Math.max(0.1, finalSpeed);
    } catch (error) {
        console.log('Download test error:', error);
        return 0;
    }
}

async function measureUploadSpeed() {
    try {
        // Use multiple small uploads to simulate a real test
        const chunkSize = 256 * 1024; // 256KB chunks
        const totalChunks = 8; // 8 chunks = 2MB total
        const startTime = performance.now();
        let totalBytes = 0;

        for (let i = 0; i < totalChunks; i++) {
            try {
                const chunkData = new Uint8Array(chunkSize);
                // Fill with random data to prevent compression
                for (let j = 0; j < chunkSize; j += 1024) {
                    chunkData[j] = Math.floor(Math.random() * 256);
                }

                const blob = new Blob([chunkData], { type: 'application/octet-stream' });
                const formData = new FormData();
                formData.append('file', blob, `chunk_${i}.bin`);

                const response = await fetch('https://httpbin.org/post', {
                    method: 'POST',
                    body: formData,
                    cache: 'no-cache'
                });

                if (response.ok) {
                    totalBytes += chunkSize;
                    const elapsed = (performance.now() - startTime) / 1000;
                    
                    // Show progress on speedometer
                    if (elapsed > 0.5 && totalBytes > 0) {
                        const currentSpeed = (totalBytes * 8) / (elapsed * 1000000);
                        updateSpeedometer(Math.min(currentSpeed, 200));
                    }
                }
            } catch (chunkError) {
                console.log(`Chunk ${i} upload failed:`, chunkError);
                if (totalBytes === 0) {
                    // If first chunk failed, try smaller upload
                    break;
                }
            }
        }

        if (totalBytes > 0) {
            const totalTime = (performance.now() - startTime) / 1000;
            const uploadSpeed = (totalBytes * 8) / (totalTime * 1000000);
            console.log(`Upload: ${totalBytes} bytes in ${totalTime.toFixed(2)}s = ${uploadSpeed.toFixed(2)} Mbps`);
            return Math.max(0.1, uploadSpeed);
        }

        // Fallback: single smaller upload
        const fallbackSize = 512 * 1024; // 512KB
        const fallbackData = new Uint8Array(fallbackSize);
        const blob = new Blob([fallbackData], { type: 'application/octet-stream' });
        const formData = new FormData();
        formData.append('file', blob, 'test.bin');

        const startTime2 = performance.now();
        const response = await fetch('https://httpbin.org/post', {
            method: 'POST',
            body: formData,
            cache: 'no-cache'
        });

        if (response.ok) {
            const duration = (performance.now() - startTime2) / 1000;
            if (duration > 0.1) {
                const uploadSpeed = (fallbackSize * 8) / (duration * 1000000);
                console.log(`Fallback upload: ${fallbackSize} bytes in ${duration.toFixed(2)}s = ${uploadSpeed.toFixed(2)} Mbps`);
                return Math.max(0.1, uploadSpeed);
            }
        }

        return 0;
    } catch (error) {
        console.log('Upload test failed:', error);
        return 0;
    }
}

function updateSpeedometer(speed) {
    const needle = document.getElementById('speedometer-needle');
    const number = document.getElementById('speed-number');
    const progressArc = document.getElementById('speed-progress-arc');
    const maxSpeed = 200; // Max speed for gauge (200 Mbps)
    
    // Clamp speed between 0 and maxSpeed
    const clampedSpeed = Math.max(0, Math.min(speed, maxSpeed));
    
    // Calculate angle: -90° to 90° (speedometer goes from left to right)
    // -90° = 0 Mbps, 0° = 100 Mbps, 90° = 200 Mbps
    const angle = (clampedSpeed / maxSpeed) * 180 - 90;
    
    if (needle) {
        needle.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        needle.setAttribute('transform', `rotate(${angle} 150 150)`);
    }
    
    if (number) {
        number.textContent = clampedSpeed.toFixed(1);
        number.style.transition = 'color 0.3s ease';
        // Color change based on speed
        if (clampedSpeed < 50) {
            number.style.color = '#ef4444'; // Red for slow
        } else if (clampedSpeed < 100) {
            number.style.color = '#f59e0b'; // Orange for medium
        } else {
            number.style.color = '#7c3aed'; // Purple for fast
        }
    }
    
    // Update progress arc smoothly
    if (progressArc) {
        const arcLength = 314; // Approximate arc length
        const progress = clampedSpeed / maxSpeed;
        const offset = arcLength * (1 - progress);
        progressArc.style.transition = 'stroke-dashoffset 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
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


// JSON Viewer
let jsonTree = {};

function formatJsonValue(value, depth = 0) {
    const indent = '  '.repeat(depth);
    const nextIndent = '  '.repeat(depth + 1);

    if (value === null) {
        return `<span class="json-null">null</span>`;
    }

    if (typeof value === 'boolean') {
        return `<span class="json-boolean">${value}</span>`;
    }

    if (typeof value === 'number') {
        return `<span class="json-number">${value}</span>`;
    }

    if (typeof value === 'string') {
        return `<span class="json-string">"${escapeHtml(value)}"</span>`;
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return `<span class="json-bracket">[]</span>`;
        }

        const id = 'array-' + Math.random().toString(36).substr(2, 9);
        let html = `<button class="json-toggle expanded" onclick="toggleJsonNode('${id}')"></button><span class="json-bracket">[</span>`;
        html += `<div id="${id}" class="json-content">`;

        value.forEach((item, index) => {
            html += `<div class="json-tree-item">${formatJsonValue(item, depth + 1)}${index < value.length - 1 ? ',' : ''}</div>`;
        });

        html += `</div><span class="json-bracket">]</span>`;
        return html;
    }

    if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) {
            return `<span class="json-bracket">{}</span>`;
        }

        const id = 'obj-' + Math.random().toString(36).substr(2, 9);
        let html = `<button class="json-toggle expanded" onclick="toggleJsonNode('${id}')"></button><span class="json-bracket">{</span>`;
        html += `<div id="${id}" class="json-content">`;

        keys.forEach((key, index) => {
            html += `<div class="json-tree-item"><span class="json-key">"${escapeHtml(key)}"</span>: ${formatJsonValue(value[key], depth + 1)}${index < keys.length - 1 ? ',' : ''}</div>`;
        });

        html += `</div><span class="json-bracket">}</span>`;
        return html;
    }

    return String(value);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function toggleJsonNode(id) {
    const node = document.getElementById(id);
    const button = event.target;

    if (node) {
        node.classList.toggle('hidden');
        button.classList.toggle('collapsed');
        button.classList.toggle('expanded');
    }
}

function expandAllJsonNodes() {
    const contents = document.querySelectorAll('#json-viewer-output .json-content');
    const buttons = document.querySelectorAll('#json-viewer-output .json-toggle');

    contents.forEach(content => {
        content.classList.remove('hidden');
    });

    buttons.forEach(button => {
        button.classList.remove('collapsed');
        button.classList.add('expanded');
    });
}

function collapseAllJsonNodes() {
    const contents = document.querySelectorAll('#json-viewer-output .json-content');
    const buttons = document.querySelectorAll('#json-viewer-output .json-toggle');

    contents.forEach(content => {
        content.classList.add('hidden');
    });

    buttons.forEach(button => {
        button.classList.add('collapsed');
        button.classList.remove('expanded');
    });
}

document.getElementById('view-json')?.addEventListener('click', () => {
    const input = document.getElementById('json-viewer-input').value;
    const output = document.getElementById('json-viewer-output');
    const error = document.getElementById('json-viewer-error');
    const emptyState = document.getElementById('json-empty-state');

    try {
        const parsed = JSON.parse(input);
        jsonTree = parsed;
        output.innerHTML = formatJsonValue(parsed);
        error.classList.remove('show');
        if (emptyState) emptyState.style.display = 'none';
    } catch (e) {
        error.textContent = `⚠️ Error: ${e.message}`;
        error.classList.add('show');
        output.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
    }
});

document.getElementById('expand-all-json')?.addEventListener('click', () => {
    const output = document.getElementById('json-viewer-output');
    if (output.innerHTML.trim() === '') {
        alert('👆 Please click "View" first to parse JSON');
        return;
    }
    expandAllJsonNodes();
});

document.getElementById('collapse-all-json')?.addEventListener('click', () => {
    const output = document.getElementById('json-viewer-output');
    if (output.innerHTML.trim() === '') {
        alert('👆 Please click "View" first to parse JSON');
        return;
    }
    collapseAllJsonNodes();
});

document.getElementById('copy-json-viewer')?.addEventListener('click', async () => {
    const input = document.getElementById('json-viewer-input').value;
    
    if (!input) {
        alert('📋 Please enter JSON first');
        return;
    }
    
    try {
        const parsed = JSON.parse(input);
        await navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
        const btn = document.getElementById('copy-json-viewer');
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    } catch (err) {
        alert('❌ Invalid JSON - Cannot copy');
    }
});

document.getElementById('clear-json-viewer')?.addEventListener('click', () => {
    document.getElementById('json-viewer-input').value = '';
    document.getElementById('json-viewer-output').innerHTML = '';
    document.getElementById('json-viewer-error').classList.remove('show');
    const emptyState = document.getElementById('json-empty-state');
    if (emptyState) emptyState.style.display = 'block';
});

