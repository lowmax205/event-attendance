# Docx to Markdown Converter

This PowerShell script wraps `pandoc` to convert one or more `.docx` files into GitHub-flavored Markdown files. Each conversion also exports embedded media to a dedicated folder.

## Requirements

- Windows PowerShell 5.1 or PowerShell 7+
- [pandoc](https://pandoc.org/installing.html) available on your `PATH`

## Usage

Copy your `.docx` files into `../thesis/source`, open a PowerShell terminal in VS Code, and run:

```powershell
cd "d:/Shared Folder/VS Code Project/Coding 2025/School/event-attendance/.docs/DocxToMarkdown"
./DocxToMarkdown.ps1 -Recursive
```

### Common Parameters

- `-InputPath <path>`: File or directory containing `.docx` files (defaults to `../thesis/source`).
- `-OutputDirectory <path>`: Optional destination directory for generated Markdown and media (defaults to `../thesis/output`).
- `-Recursive`: Scan subdirectories when the input path is a folder.
- `-Overwrite`: Replace existing Markdown output files if present.
- `-MediaFolder <name>`: Folder suffix for extracted media (defaults to `media`).

By default the script places converted Markdown files (and `<name>_<MediaFolder>` directories) in `../thesis/output`, mirroring the source file names.
