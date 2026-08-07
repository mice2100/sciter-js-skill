#!/usr/bin/env python3
"""
Sciter C++ Application Scaffolding Script

Generates a new Sciter C++ project from the template.

Usage:
    python create_sciter_app.py <ProjectName> [output_dir]

Example:
    python create_sciter_app.py MyApp ../my-app
"""

import os
import sys
import shutil
import argparse
from pathlib import Path
from datetime import datetime

# Template markers
PROJECT_NAME_MARKER = "{{PROJECT_NAME}}"
PROJECT_NAME_UPPER_MARKER = "{{PROJECT_NAME|UPPER}}"


def to_upper_case(s):
    """Convert string to upper case with underscores."""
    return s.replace("-", "_").replace(" ", "_").upper()


def replace_template_markers(content, project_name):
    """Replace template markers in content."""
    content = content.replace(PROJECT_NAME_MARKER, project_name)
    content = content.replace(PROJECT_NAME_UPPER_MARKER, to_upper_case(project_name))
    return content


def process_file(input_path, output_path, project_name):
    """Process a single file, replacing markers and creating output."""
    # Read input file
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace markers
    content = replace_template_markers(content, project_name)

    # Create output directory if needed
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write output file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)


def is_template_file(filename):
    """Check if file needs template processing."""
    # Files with .in extension or common text files
    text_extensions = {'.txt', '.md', '.css', '.js', '.htm', '.html', '.xml', '.plist', '.h', '.cpp', '.c', '.py', '.sh'}
    return filename.endswith('.in') or Path(filename).suffix in text_extensions


def create_project(project_name, output_dir, template_dir):
    """Create a new Sciter project from template."""
    output_path = Path(output_dir) / project_name

    # Check if output already exists
    if output_path.exists():
        response = input(f"Directory '{output_path}' already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Cancelled.")
            return False

    # Create project structure
    print(f"Creating Sciter project '{project_name}' in {output_path}")

    # Map of template files to output files
    file_mappings = [
        ("CMakeLists.txt", "CMakeLists.txt"),
        ("src/mainWnd.h", "src/mainWnd.h"),
        ("src/AppMain.cpp", "src/AppMain.cpp"),
        ("ui/main.htm", "ui/main.htm"),
        ("ui/common.css", "ui/common.css"),
        ("res/resource.h.in", "res/resource.h"),
        ("res/info.plist.in", "res/info.plist"),
    ]

    # Process each file
    for template_file, output_file in file_mappings:
        input_path = template_dir / template_file
        out_path = output_path / output_file

        if is_template_file(str(input_path)):
            process_file(input_path, out_path, project_name)
            print(f"  Created: {output_file}")
        else:
            # Binary file - just copy
            out_path.parent.mkdir(parents=True, exist_ok=True)
            if input_path.exists():
                shutil.copy2(input_path, out_path)
                print(f"  Copied: {output_file}")

    # Create empty placeholder files if needed
    placeholder_files = [
        "src/resources.cpp",
        "ui/script.js",
    ]

    for placeholder in placeholder_files:
        out_path = output_path / placeholder
        out_path.parent.mkdir(parents=True, exist_ok=True)

        if placeholder == "src/resources.cpp":
            content = f"""// Auto-generated resources file for {project_name}
// This file will be populated by Sciter's resource compiler
// For LOCAL_MODE, this file is not used

#ifdef LOCAL_MODE
const unsigned char resources[] = {{0x00}};
#else
// Resources will be compiled here by Sciter resource compiler
const unsigned char resources[] = {{
    // Resource data
}};
#endif
"""
        else:
            content = f"""// {project_name} JavaScript module
// Add your custom scripts here
"""

        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Created: {placeholder}")

    # Create .gitignore
    gitignore_path = output_path / ".gitignore"
    with open(gitignore_path, 'w') as f:
        f.write(f"""# Build directories
build-*/
bin/
out/

# IDE
.vs/
.vscode/
*.user
*.suo
*.sln.docstates

# CMake
CMakeCache.txt
CMakeFiles/
cmake_install.cmake
Makefile

# macOS
.DS_Store
*.app/Contents/MacOS/*.dSYM/

# Windows
*.exe
*.dll
*.obj
*.lib
*.pdb
""")
    print("  Created: .gitignore")

    # Create README
    readme_path = output_path / "README.md"
    with open(readme_path, 'w') as f:
        f.write(f"""# {project_name}

A Sciter.js desktop application built with C++.

## Building

### Prerequisites

- CMake 3.20+
- C++17 compiler
- Sciter SDK (update SCITER_DIR in CMakeLists.txt)
- spdlog and fmt libraries (via vcpkg or system)

### Build Steps

```bash
# Configure
mkdir build && cd build
cmake ..

# Build
cmake --build .

# Run (from build directory)
./{project_name}  # Linux/macOS
{project_name}.exe  # Windows
```

### Build Options

```bash
# Local mode (load UI from files)
cmake -DLOCALMODE=ON ..

# Release build
cmake -DCMAKE_BUILD_TYPE=Release ..

# Enable debug console
cmake -DCONSOLE=ON ..
```

## Project Structure

```
{project_name}/
├── CMakeLists.txt      # Build configuration
├── src/
│   ├── AppMain.cpp     # Application entry point
│   ├── mainWnd.h       # Main window class & C++/JS bridge
│   └── resources.cpp   # Compiled resources (production)
├── ui/
│   ├── main.htm        # Main UI file
│   ├── common.css      # Common styles
│   └── script.js       # JavaScript modules
└── res/
    ├── resource.h      # Windows resources
    └── info.plist     # macOS app info
```

## Development

### Local Mode

For development, use LOCAL_MODE to load UI from files:

```bash
cmake -DLOCALMODE=ON ..
```

UI files are loaded from the `ui/` directory.

### Production Mode

For production, resources are compiled into the binary:

```bash
cmake -DLOCALMODE=OFF ..
```

## License

Copyright (c) {datetime.now().year}
""")
    print("  Created: README.md")

    print(f"\nProject '{project_name}' created successfully!")
    print(f"\nNext steps:")
    print(f"  1. cd {output_path}")
    print(f"  2. Update SCITER_DIR in CMakeLists.txt")
    print(f"  3. mkdir build && cd build")
    print(f"  4. cmake ..")
    print(f"  5. cmake --build .")

    return True


def main():
    parser = argparse.ArgumentParser(
        description='Create a new Sciter C++ project from template',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python create_sciter_app.py MyApp
  python create_sciter_app.py MyApp ../projects
  python create_sciter_app.py "My App" ./my-app
        """
    )
    parser.add_argument('name', help='Project name')
    parser.add_argument('output_dir', nargs='?', default='.',
                        help='Output directory (default: current directory)')
    parser.add_argument('--template-dir', default=None,
                        help='Template directory (default: ../assets/template)')

    args = parser.parse_args()

    # Determine template directory
    if args.template_dir:
        template_dir = Path(args.template_dir)
    else:
        script_dir = Path(__file__).parent
        template_dir = script_dir.parent / "assets" / "template"

    if not template_dir.exists():
        print(f"Error: Template directory not found: {template_dir}")
        sys.exit(1)

    # Validate project name
    project_name = args.name.strip()
    if not project_name:
        print("Error: Project name cannot be empty")
        sys.exit(1)

    # Create project
    success = create_project(project_name, args.output_dir, template_dir)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
