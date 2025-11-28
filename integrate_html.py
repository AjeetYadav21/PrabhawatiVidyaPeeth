import re

print("Starting HTML integration...")

# Read the clean HTML
with open('u:/prabhawati/index.html.before-multilingual', 'r', encoding='utf-8') as f:
    html = f.read()

# Read the new header
with open('u:/prabhawati/html_snippets_2_header.html', 'r', encoding='utf-8') as f:
    header_content = f.read()
    # Extract just the header element
    new_header = re.search(r'(<header.*?</header>)', header_content, re.DOTALL).group(1)

# Read Hall of Fame section
with open('u:/prabhawati/html_snippets_3_hall_of_fame.html', 'r', encoding='utf-8') as f:
    hall_content = f.read()
    # Extract the Hall of Fame section
    hall_fame = re.search(r'<!-- ====.*?HALL OF FAME.*?</section>', hall_content, re.DOTALL).group(0)

print("[OK] Read all snippet files")

# 1. Add Font Awesome CDN
font_awesome = '    <!-- Font Awesome Icons -->\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n    \n    <!-- Stylesheet -->'
html = html.replace('    <!-- Stylesheet -->', font_awesome)
print("[OK] Added Font Awesome CDN")

# 2. Replace header
old_header = re.search(r'<header class="header".*?</header>', html, re.DOTALL).group(0)
html = html.replace(old_header, new_header)
print("[OK] Updated header with language toggle")

# 3. Insert Hall of Fame before Gallery
gallery_marker = '    <!-- ============================================\n         GALLERY SECTION\n         ============================================ -->'
html = html.replace(gallery_marker, hall_fame + '\n\n' + gallery_marker)
print("[OK] Inserted Hall of Fame section")

# 4. Add translations.js script
script_section = '    <!-- JavaScript -->\n    <script src="script.js"></script>'
new_scripts = '    <!-- Translation System -->\n    <script src="translations.js"></script>\n    \n    <!-- JavaScript -->\n    <script src="script.js"></script>'
html = html.replace(script_section, new_scripts)
print("[OK] Added translations.js script")

# Write the final HTML
with open('u:/prabhawati/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("")
print("=" * 60)
print("SUCCESS! HTML integration complete!")
print("=" * 60)


# Write the final HTML
with open('u:/prabhawati/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("\n🎉 HTML integration complete!")
print("=" * 50)
print("✅ All 4 integrations successful:")
print("  1. Font Awesome CDN link")
print("  2. Language toggle button in header")
print("  3. Hall of Fame section")
print("  4. Translation system script")
print("=" * 50)
