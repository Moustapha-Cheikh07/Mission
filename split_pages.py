#!/usr/bin/env python3
"""
Script pour séparer index.html en plusieurs pages
"""

def read_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return f.readlines()

def write_file(filename, lines):
    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(lines)

def main():
    lines = read_file('index_old.html')

    # Header (lignes 1-62)
    header = lines[0:62]

    # Dashboard section (lignes 63-384) + closing </section>
    dashboard_content = lines[62:385]
    # Dashboard a deja la classe active, pas de modification necessaire
    dashboard_content.append('    </main>\n')

    # Documents section (lignes 456-588) + closing </section>
    documents_content = list(lines[455:589])  # Convertir en liste mutable
    # Ajouter la classe active a la section documents (ligne 1 = ligne 456 dans le fichier)
    for i, line in enumerate(documents_content):
        if '<section id="documents"' in line:
            documents_content[i] = line.replace('class="content-section"', 'class="content-section active"')
            break
    documents_content.append('    </main>\n')

    # Forms section (lignes 591-688) + closing </section>
    forms_content = list(lines[590:689])  # Convertir en liste mutable
    # Ajouter la classe active a la section forms
    for i, line in enumerate(forms_content):
        if '<section id="forms"' in line:
            forms_content[i] = line.replace('class="content-section"', 'class="content-section active"')
            break
    forms_content.append('    </main>\n')

    # Training section (lignes 691-753) - already includes </main> at line 754
    training_content = list(lines[690:754])  # Convertir en liste mutable
    # Ajouter la classe active a la section training
    for i, line in enumerate(training_content):
        if '<section id="training"' in line:
            training_content[i] = line.replace('class="content-section"', 'class="content-section active"')
            break

    # Footer (lignes 756-888) - Toast, scripts, closing body/html
    footer = lines[755:]

    # Fonction pour créer la navigation avec la page active
    def create_nav(active_page):
        nav_lines = []
        nav_lines.append('        <nav class="sidebar-nav px-3" aria-label="Menu principal">\n')

        pages = [
            ('dashboard', 'dashboard.html', 'speedometer2', 'Tableau de bord'),
            ('documents', 'documents.html', 'folder2-open', 'Dossiers Qualité'),
            ('forms', 'forms.html', 'file-earmark-text', 'Formulaires'),
            ('training', 'training.html', 'mortarboard', 'Formation')
        ]

        for page_id, page_url, icon, label in pages:
            active_class = ' active' if page_id == active_page else ''
            nav_lines.append(f'            <a href="{page_url}" class="nav-item{active_class}">\n')
            nav_lines.append(f'                <i class="bi bi-{icon}"></i>\n')
            nav_lines.append(f'                <span>{label}</span>\n')
            nav_lines.append('            </a>\n')

        nav_lines.append('        </nav>\n')
        return nav_lines

    # Fonction pour remplacer la navigation
    def replace_nav(header_lines, active_page):
        new_header = []
        skip_nav = False
        for line in header_lines:
            if '<nav class="sidebar-nav' in line:
                skip_nav = True
                new_header.extend(create_nav(active_page))
            elif skip_nav and '</nav>' in line:
                skip_nav = False
                continue
            elif not skip_nav:
                new_header.append(line)
        return new_header

    # Créer dashboard.html
    print("Creation de dashboard.html...")
    dashboard_header = replace_nav(header, 'dashboard')
    dashboard_page = dashboard_header + dashboard_content + footer
    write_file('dashboard.html', dashboard_page)
    print("[OK] dashboard.html cree")

    # Créer documents.html
    print("Creation de documents.html...")
    documents_header = replace_nav(header, 'documents')
    documents_page = documents_header + documents_content + footer
    write_file('documents.html', documents_page)
    print("[OK] documents.html cree")

    # Créer forms.html
    print("Creation de forms.html...")
    forms_header = replace_nav(header, 'forms')
    forms_page = forms_header + forms_content + footer
    write_file('forms.html', forms_page)
    print("[OK] forms.html cree")

    # Créer training.html
    print("Creation de training.html...")
    training_header = replace_nav(header, 'training')
    training_page = training_header + training_content + footer
    write_file('training.html', training_page)
    print("[OK] training.html cree")

    print("\n[SUCCESS] Toutes les pages ont ete creees avec succes!")
    print("\nPages créées:")
    print("  - dashboard.html (Tableau de bord)")
    print("  - documents.html (Dossiers Qualité)")
    print("  - forms.html (Formulaires)")
    print("  - training.html (Formation)")

if __name__ == '__main__':
    main()
