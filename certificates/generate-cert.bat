@echo off
echo 🔐 Generating SSL Certificate for BhekOS Local Development
echo =======================================================

REM Check if OpenSSL is installed
where openssl >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ OpenSSL not found!
    echo.
    echo Please install OpenSSL:
    echo 1. Download from: https://slproweb.com/products/Win32OpenSSL.html
    echo 2. Run installer
    echo 3. Add to PATH
    echo.
    pause
    exit /b
)

echo ✅ OpenSSL found

REM Generate private key
echo.
echo 📝 Generating private key...
openssl genrsa -out localhost.key 2048
echo ✅ Private key created: localhost.key

REM Generate certificate signing request
echo.
echo 📝 Generating certificate signing request...
openssl req -new -key localhost.key -out localhost.csr -subj "/C=GH/ST=Greater Accra/L=Accra/O=Bhek Network/OU=Development/CN=localhost"
echo ✅ CSR created: localhost.csr

REM Generate certificate
echo.
echo 📝 Generating certificate...
openssl x509 -req -days 365 -in localhost.csr -signkey localhost.key -out localhost.crt -extfile <(
echo authorityKeyIdentifier=keyid,issuer
echo basicConstraints=CA:FALSE
echo keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
echo subjectAltName = @alt_names
echo [alt_names]
echo DNS.1 = localhost
echo DNS.2 = 127.0.0.1
echo DNS.3 = ::1
)
echo ✅ Certificate created: localhost.crt

REM Create PEM file (combined)
echo.
echo 📝 Creating PEM file...
copy /b localhost.key + localhost.crt localhost.pem >nul
echo ✅ PEM file created: localhost.pem

REM Clean up CSR
del localhost.csr

echo.
echo =======================================================
echo ✅ SSL Certificate Generation Complete!
echo =======================================================
echo.
echo 📁 Generated Files:
echo    - localhost.key  (Private Key)
echo    - localhost.crt  (Certificate)
echo    - localhost.pem  (Combined PEM)
echo.
echo 🔧 To use in Node.js server:
echo    const https = require('https');
echo    const fs = require('fs');
echo    const options = {
echo        key: fs.readFileSync('certificates/localhost.key'),
echo        cert: fs.readFileSync('certificates/localhost.crt')
echo    };
echo.
echo 🌐 To trust this certificate:
echo    Windows: Import localhost.crt into "Trusted Root Certification Authorities"
echo    Mac: Drag localhost.crt into Keychain Access, set to "Always Trust"
echo    Linux: Copy to /usr/local/share/ca-certificates/ and run sudo update-ca-certificates
echo.
echo 🚀 Ready for HTTPS development!
echo.
pause
