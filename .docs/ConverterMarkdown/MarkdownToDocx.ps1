# Converts one or more Markdown files to .docx using pandoc with GitHub-flavored Markdown input.
# Usage: ./MarkdownToDocx.ps1 [-InputPath <path>] [-OutputDirectory <path>] [-Recursive] [-Overwrite] [-ReferenceDoc <path>]

param(
	[Parameter(Position = 0)]
	[string]$InputPath = (Join-Path -Path $PSScriptRoot -ChildPath "..\thesis\Markdown"),

	[Parameter(Position = 1)]
	[string]$OutputDirectory,

	[switch]$Recursive,

	[switch]$Overwrite,

	[string]$ReferenceDoc
)

function Get-MarkdownFiles {
	param(
		[string]$Path,
		[switch]$Recurse
	)

	$resolved = Resolve-Path -LiteralPath $Path -ErrorAction Stop
	$item = Get-Item -LiteralPath $resolved -ErrorAction Stop

	if ($item.PSIsContainer) {
		$mdFiles = Get-ChildItem -LiteralPath $item.FullName -Filter "*.md" -File -Force -ErrorAction Stop -Recurse:$Recurse
		return $mdFiles
	}

	if ($item.Extension -ieq ".md") {
		return ,$item
	}

	throw "InputPath must be a .md file or directory containing .md files."
}

function Get-OutputPath {
	param(
		[System.IO.FileInfo]$Markdown,
		[string]$OutputDir
	)

	if ([string]::IsNullOrWhiteSpace($OutputDir)) {
		$defaultOutput = Join-Path -Path $PSScriptRoot -ChildPath "..\thesis\Docx"
		if (-not (Test-Path -LiteralPath $defaultOutput)) {
			New-Item -ItemType Directory -Path $defaultOutput -Force | Out-Null
		}
		$targetDir = (Resolve-Path -LiteralPath $defaultOutput -ErrorAction Stop).ProviderPath
	} else {
		if (-not (Test-Path -LiteralPath $OutputDir)) {
			New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
		}
		$targetDir = (Resolve-Path -LiteralPath $OutputDir -ErrorAction Stop).ProviderPath
	}

	$null = New-Item -ItemType Directory -Path $targetDir -Force

	$docxFile = Join-Path -Path $targetDir -ChildPath ("{0}.docx" -f $Markdown.BaseName)

	return $docxFile
}

function Assert-Pandoc {
	$pandoc = Get-Command -Name pandoc -ErrorAction SilentlyContinue
	if (-not $pandoc) {
		throw "pandoc is required but was not found. Install it from https://pandoc.org/installing.html"
	}

	return $pandoc.Source
}

function Convert-MarkdownToDocx {
	param(
		[System.IO.FileInfo]$MarkdownFile,
		[string]$DocxOutput,
		[switch]$AllowOverwrite,
		[string]$PandocPath,
		[string]$ReferenceDocument
	)

	if (-not $AllowOverwrite -and (Test-Path -LiteralPath $DocxOutput)) {
		throw "Output file already exists: $DocxOutput. Use -Overwrite to replace it."
	}

	# Save current directory and change to the Markdown file's directory
	# This ensures relative image paths are resolved correctly
	$originalLocation = Get-Location
	$markdownDir = $MarkdownFile.Directory.FullName
	Set-Location -LiteralPath $markdownDir

	try {
		$arguments = @(
			$MarkdownFile.Name
			'-f'
			'gfm'
			'-t'
			'docx'
			'-o'
			$DocxOutput
		)

		# Add reference document if provided for custom styling
		if (-not [string]::IsNullOrWhiteSpace($ReferenceDocument)) {
			if (Test-Path -LiteralPath $ReferenceDocument) {
				$arguments += '--reference-doc=' + $ReferenceDocument
			} else {
				Write-Warning "Reference document not found: $ReferenceDocument. Proceeding without it."
			}
		}

		$output = & $PandocPath @arguments 2>&1
	}
	finally {
		# Restore original directory
		Set-Location -LiteralPath $originalLocation
	}

	if ($LASTEXITCODE -ne 0) {
		throw "pandoc failed for $($MarkdownFile.FullName): $output"
	}

	if ($output) {
		Write-Host $output -ForegroundColor DarkGray
	}

	Write-Host "Converted $($MarkdownFile.Name) -> $DocxOutput" -ForegroundColor Green
}

try {
	$pandocPath = Assert-Pandoc
	$files = Get-MarkdownFiles -Path $InputPath -Recurse:$Recursive

	if (-not $files -or $files.Count -eq 0) {
		Write-Warning "No .md files found to convert."
		return
	}

	Write-Host "Found $($files.Count) Markdown file(s) to convert." -ForegroundColor Cyan

	foreach ($file in $files) {
		$outputPath = Get-OutputPath -Markdown $file -OutputDir $OutputDirectory

		try {
			Convert-MarkdownToDocx -MarkdownFile $file -DocxOutput $outputPath -AllowOverwrite:$Overwrite -PandocPath $pandocPath -ReferenceDocument $ReferenceDoc
		}
		catch {
			Write-Warning $_.Exception.Message
		}
	}

	Write-Host "`nConversion complete!" -ForegroundColor Green
}
catch {
	Write-Error $_.Exception.Message
	exit 1
}
