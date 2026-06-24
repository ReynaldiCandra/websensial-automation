#!/bin/bash
# Run this from your project root: bash fix-logo.sh

python3 << 'EOF'
import re

# ============================================================
# 1. LANDING PAGE — navbar & footer logo
# ============================================================
with open('app/landing/page.tsx', 'r') as f:
    c = f.read()

# Navbar logo — perbesar
c = re.sub(
    r'(<div className="flex items-center">[\s\S]*?)<Image\s+src="/websensial-logo-teal\.png"\s+alt="Websensial"\s+width=\{\d+\}\s+height=\{\d+\}\s+className="[^"]*"\s+/>',
    r'\1<Image\n              src="/websensial-logo-teal.png"\n              alt="Websensial"\n              width={220}\n              height={60}\n              className="h-14 w-auto object-contain"\n            />',
    c
)

# Footer logo — perbesar
c = re.sub(
    r'(<div className="mb-4">[\s\S]*?)<Image\s+src="/websensial-logo-teal\.png"\s+alt="Websensial"\s+width=\{\d+\}\s+height=\{\d+\}\s+className="[^"]*"\s+/>',
    r'\1<Image\n                src="/websensial-logo-teal.png"\n                alt="Websensial"\n                width={200}\n                height={54}\n                className="h-12 w-auto object-contain"\n              />',
    c
)

with open('app/landing/page.tsx', 'w') as f:
    f.write(c)
print("✅ Landing page logo fixed")

# ============================================================
# 2. LOGIN PAGE — left panel logo (dark/tech) & mobile logo
# ============================================================
with open('app/auth/login/page.tsx', 'r') as f:
    c = f.read()

# Left panel logo (dark background)
c = re.sub(
    r'src="/websensial-logo-tech\.png"[\s\S]*?className="[^"]*"',
    'src="/websensial-logo-tech.png"\n            alt="Websensial"\n            width={240}\n            height={64}\n            className="h-16 w-auto object-contain mx-auto"',
    c
)

# Mobile logo (teal)
c = re.sub(
    r'src="/websensial-logo-teal\.png"[\s\S]*?className="[^"]*"',
    'src="/websensial-logo-teal.png"\n            alt="Websensial"\n            width={220}\n            height={60}\n            className="h-14 w-auto object-contain mx-auto"',
    c
)

with open('app/auth/login/page.tsx', 'w') as f:
    f.write(c)
print("✅ Login page logo fixed")

# ============================================================
# 3. SIGNUP PAGE — same treatment
# ============================================================
with open('app/auth/sign-up/page.tsx', 'r') as f:
    c = f.read()

c = re.sub(
    r'src="/websensial-logo-tech\.png"[\s\S]*?className="[^"]*"',
    'src="/websensial-logo-tech.png"\n            alt="Websensial"\n            width={240}\n            height={64}\n            className="h-16 w-auto object-contain mx-auto"',
    c
)

c = re.sub(
    r'src="/websensial-logo-teal\.png"[\s\S]*?className="[^"]*"',
    'src="/websensial-logo-teal.png"\n            alt="Websensial"\n            width={220}\n            height={60}\n            className="h-14 w-auto object-contain mx-auto"',
    c
)

with open('app/auth/sign-up/page.tsx', 'w') as f:
    f.write(c)
print("✅ Signup page logo fixed")

# ============================================================
# 4. DASHBOARD SIDEBAR — logo di sidebar
# ============================================================
with open('components/layout/dashboard-layout.tsx', 'r') as f:
    c = f.read()

c = re.sub(
    r'src="/websensial-logo-teal\.png"[\s\S]*?className="[^"]*"',
    'src="/websensial-logo-teal.png"\n            alt="Websensial"\n            width={180}\n            height={48}\n            className="h-12 w-auto object-contain"',
    c
)

with open('components/layout/dashboard-layout.tsx', 'w') as f:
    f.write(c)
print("✅ Dashboard sidebar logo fixed")

print("\n🎉 Semua logo berhasil diperbesar!")
EOF
