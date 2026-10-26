import zipfile
import os

def create_docx(filename="CivicMind_AI_Project_Report.docx"):
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""

    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:docDefaults>
        <w:rPrDefault>
            <w:rPr>
                <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                <w:sz w:val="22"/>
                <w:color w:val="1A202C"/>
            </w:rPr>
        </w:rPrDefault>
    </w:docDefaults>
    <w:style w:type="paragraph" w:styleId="Title">
        <w:name w:val="Title"/>
        <w:rPr>
            <w:b/>
            <w:color w:val="1E3A8A"/>
            <w:sz w:val="48"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading1">
        <w:name w:val="Heading 1"/>
        <w:pPr><w:spacing w:before="360" w:after="120"/></w:pPr>
        <w:rPr>
            <w:b/>
            <w:color w:val="1E40AF"/>
            <w:sz w:val="32"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading2">
        <w:name w:val="Heading 2"/>
        <w:pPr><w:spacing w:before="240" w:after="80"/></w:pPr>
        <w:rPr>
            <w:b/>
            <w:color w:val="0F172A"/>
            <w:sz w:val="26"/>
        </w:rPr>
    </w:style>
</w:styles>"""

    body_elements = []

    def p(text, style=None, bold=False, italic=False, color=None, size=None):
        r_pr = ""
        if bold: r_pr += "<w:b/>"
        if italic: r_pr += "<w:i/>"
        if color: r_pr += f'<w:color w:val="{color}"/>'
        if size: r_pr += f'<w:sz w:val="{size}"/>'
        
        p_pr = ""
        if style: p_pr += f'<w:pStyle w:val="{style}"/>'
        
        return f'<w:p><w:pPr>{p_pr}</w:pPr><w:r><w:rPr>{r_pr}</w:rPr><w:t xml:space="preserve">{text}</w:t></w:r></w:p>'

    body_elements.append(p("CIVICMIND AI", style="Title"))
    body_elements.append(p('"Predict • Prioritize • Prevent" — Technical Project Report', italic=True, color="4B5563", size=26))
    body_elements.append(p("System Name: CivicMind AI (Full-Stack Municipal Grievance & Spatial Intelligence Platform)", bold=True))
    body_elements.append(p("Architecture: React 18 (Vite) + FastAPI (Python 3.12) + SQLite (SQLAlchemy) + Scikit-Learn (TF-IDF & DBSCAN)"))
    body_elements.append(p("--------------------------------------------------------------------------------------------------------", color="CBD5E1"))

    # Section 1
    body_elements.append(p("1. Technical Architecture and Design", style="Heading1"))
    body_elements.append(p("CivicMind AI is implemented as a decoupled, asynchronous Full-Stack Web Application."))
    body_elements.append(p("• Presentation Tier: React 18 Single Page Application bundled with Vite, styled via Tailwind CSS, and embedded with Leaflet mapping."))
    body_elements.append(p("• Application Tier: Asynchronous FastAPI Python backend handling auth, complaints, and dashboard routes."))
    body_elements.append(p("• Intelligence Tier: Scikit-Learn TF-IDF NLP vectorizer + Multinomial Naive Bayes classifier and DBSCAN spatial clustering."))
    body_elements.append(p("• Data Persistence Tier: Relational SQLite storage (civic_app.db) orchestrated via SQLAlchemy 2.0 ORM."))
    body_elements.append(p("Database Schemas Implemented:", bold=True))
    body_elements.append(p("1. users: id, name, first_name, last_name, contact_number, occupation, email, password_hash, role (CITIZEN, OFFICER, ADMIN)."))
    body_elements.append(p("2. departments: id, name (Roads, Electricity, Water & Sanitation, Waste Management)."))
    body_elements.append(p("3. complaints: id, citizen_id, description, address, image_url, latitude, longitude, department_id, status (Pending, In Progress, Resolved), created_at."))
    body_elements.append(p("4. hotspots: id, center_latitude, center_longitude, complaint_count, severity (High, Medium), created_at."))
    body_elements.append(p("Security & RBAC:", bold=True))
    body_elements.append(p("• Passwords are encrypted with bcrypt with salt via passlib."))
    body_elements.append(p("• User sessions issue cryptographic JSON Web Tokens (JWT) signed with HS256 algorithm and 24-hr expiration."))
    body_elements.append(p("• Axios request interceptor injects Bearer JWT into all outgoing requests."))

    # Section 2
    body_elements.append(p("2. Implementation and Prototype Development", style="Heading1"))
    body_elements.append(p("Frontend User Interface Modules:", bold=True))
    body_elements.append(p("• Auth Portal: Dual-tab Sign In / Create Account with complete citizen profiling (First Name, Last Name, Phone, Email, Password, Occupation). Automatically logs in on registration."))
    body_elements.append(p("• Citizen Dashboard: Leaflet map locked to India [20.5937, 78.9629], HTML5 Geolocation detect location, Nominatim reverse geocoding to address, in-browser WebRTC camera photo capture, and form validation (10+ chars + location)."))
    body_elements.append(p("• Isolated My History: Queries /api/complaints/my ensuring citizens exclusively see their own submitted issues in an expandable accordion view."))
    body_elements.append(p("• Manager Dashboard: City-wide complaint queue with Citizen Contact Cards (direct clickable tel: and email: links), 1-click Google Maps turn-by-turn routing, and live status updater."))
    body_elements.append(p("• Admin Master Panel: Real-time metric counters, interactive AI Hotspot Heatmap over India with DBSCAN circle markers, split user tables (Managers vs Citizens) with role update and delete, and paginated Master Database."))
    body_elements.append(p("AI & Machine Learning Subsystems:", bold=True))
    body_elements.append(p("• NLP Department Router: TfidfVectorizer + MultinomialNB pipeline automatically classifying complaints into municipal departments. Caches model as nlp_model.pkl."))
    body_elements.append(p("• DBSCAN Hotspot Clustering: Groups unresolved complaints within 500m (eps=0.005, min_samples=3). Calculates cluster centroids, assigns severity (High >= 5, Medium 3-4), and purges hotspots in real-time when complaints are marked Resolved."))

    # Section 3
    body_elements.append(p("3. Tools Integration, Testing, Performance Validation", style="Heading1"))
    body_elements.append(p("Integrated Toolstack: React 18, Vite, Tailwind CSS, React-Leaflet, Lucide React, Axios, FastAPI, Uvicorn, SQLAlchemy, SQLite, Scikit-Learn, NumPy, Bcrypt, PyJWT."))
    body_elements.append(p("Testing Scenarios Conducted:", bold=True))
    body_elements.append(p("1. Role-based login verified with seed accounts (admin@city.com, manager@city.com, alice@test.com). Unauthorized roles blocked from Admin view."))
    body_elements.append(p("2. Citizen isolation verified: /api/complaints/my strictly returns records where citizen_id matches the logged-in user."))
    body_elements.append(p("3. Hotspot lifecycle verified: Marking complaints Resolved immediately recalculates clusters and removes the hotspot circle from the heatmap."))
    body_elements.append(p("4. WebRTC camera & GPS tested: Confirmed video capture, Base64 conversion, and street-name reverse geocoding."))
    body_elements.append(p("Performance Enhancements Implemented:", bold=True))
    body_elements.append(p("• Custom asynchronous Toast notification engine replacing blocking alert() popups."))
    body_elements.append(p("• Disabled button states with Loader2 animated spinners preventing double-click submissions."))
    body_elements.append(p("• Startup auto-migrations running safe ALTER TABLE checks so new columns never crash existing SQLite databases."))
    body_elements.append(p("• Client-side pagination in Admin Master Database displaying 10 rows per page."))

    # Section 4
    body_elements.append(p("4. Industry Readiness and Refinement", style="Heading1"))
    body_elements.append(p("Codebase Refinements Implemented:", bold=True))
    body_elements.append(p("• Clear separation of concerns into dedicated directories (routes/, ai/, pages/, context/)."))
    body_elements.append(p("• Data sanitization: /dashboard/users strips password_hash and detaches circular ORM relationships to prevent FastAPI serialization errors."))
    body_elements.append(p("• Safe auth token lookup: get_current_user checks both id and email claims for robust session continuity."))
    body_elements.append(p("• Complete Windows automation scripts: seed.py, start_backend.ps1, start_frontend.ps1, requirements.txt, and .gitignore."))

    # Section 5
    body_elements.append(p("5. Project Outcome", style="Heading1"))
    body_elements.append(p("Core Deliverables Realized:", bold=True))
    body_elements.append(p("• Predict: DBSCAN spatial density clustering identifies recurring infrastructure failure clusters (>= 3 unresolved issues within 500m) in real-time on a live visual heatmap."))
    body_elements.append(p("• Prioritize: Automated NLP text classification categorizes complaints into departments with zero human latency."))
    body_elements.append(p("• Prevent: Role-based dashboards, Leaflet maps, WebRTC camera proof, citizen contact cards, and Google Maps routing provide transparency and field efficiency."))
    body_elements.append(p("Final Verification:", bold=True))
    body_elements.append(p("CivicMind AI is 100% operational on localhost (Ports 5173 and 8000), delivering a verified, ready-to-present municipal intelligence platform."))

    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        {''.join(body_elements)}
        <w:sectPr>
            <w:pgSz w:w="11906" w:h="16838"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
        </w:sectPr>
    </w:body>
</w:document>"""

    with zipfile.ZipFile(filename, "w", compression=zipfile.ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", content_types)
        docx.writestr("_rels/.rels", rels)
        docx.writestr("word/_rels/document.xml.rels", doc_rels)
        docx.writestr("word/styles.xml", styles)
        docx.writestr("word/document.xml", document_xml)

    print(f"Successfully generated: {filename}")

if __name__ == "__main__":
    create_docx()
