#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Generating SSL Certificate for BhekOS Local Development${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}❌ OpenSSL not found!${NC}"
    echo ""
    echo "Please install OpenSSL:"
    echo "  Mac:     brew install openssl"
    echo "  Ubuntu:  sudo apt-get install openssl"
    echo "  CentOS:  sudo yum install openssl"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ OpenSSL found${NC}"

# Generate private key
echo ""
echo -e "${YELLOW}📝 Generating private key...${NC}"
openssl genrsa -out localhost.key 2048
echo -e "${GREEN}✅ Private key created: localhost.key${NC}"

# Generate certificate signing request
echo ""
echo -e "${YELLOW}📝 Generating certificate signing request...${NC}"
openssl req -new -key localhost.key -out localhost.csr -subj "/C=GH/ST=Greater Accra/L=Accra/O=Bhek Network/OU=Development/CN=localhost"
echo -e "${GREEN}✅ CSR created: localhost.csr${NC}"

# Generate certificate with SAN
echo ""
echo -e "${YELLOW}📝 Generating certificate with Subject Alternative Names...${NC}"
cat > localhost.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = 127.0.0.1
DNS.3 = ::1
EOF

openssl x509 -req -days 365 -in localhost.csr -signkey localhost.key -out localhost.crt -extfile localhost.ext
echo -e "${GREEN}✅ Certificate created: localhost.crt${NC}"

# Create PEM file (combined)
echo ""
echo -e "${YELLOW}📝 Creating PEM file...${NC}"
cat localhost.key localhost.crt > localhost.pem
echo -e "${GREEN}✅ PEM file created: localhost.pem${NC}"

# Clean up
rm localhost.csr localhost.ext

echo ""
echo -e "${BLUE}=======================================================${NC}"
echo -e "${GREEN}✅ SSL Certificate Generation Complete!${NC}"
echo -e "${BLUE}=======================================================${NC}"
echo ""
echo -e "${YELLOW}📁 Generated Files:${NC}"
echo "    - localhost.key  (Private Key)"
echo "    - localhost.crt  (Certificate)"
echo "    - localhost.pem  (Combined PEM)"
echo ""
echo -e "${YELLOW}🔧 To use in Node.js server:${NC}"
echo "    const https = require('https');"
echo "    const fs = require('fs');"
echo "    const options = {"
echo "        key: fs.readFileSync('certificates/localhost.key'),"
echo "        cert: fs.readFileSync('certificates/localhost.crt')"
echo "    };"
echo ""
echo -e "${YELLOW}🌐 To trust this certificate:${NC}"
echo "    Mac:    Drag localhost.crt into Keychain Access, set to 'Always Trust'"
echo "    Linux:  sudo cp localhost.crt /usr/local/share/ca-certificates/"
echo "            sudo update-ca-certificates"
echo "    Windows: Import into 'Trusted Root Certification Authorities'"
echo ""
echo -e "${GREEN}🚀 Ready for HTTPS development!${NC}"
echo ""
