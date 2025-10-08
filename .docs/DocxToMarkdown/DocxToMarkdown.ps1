# Converts one or more .docx files to Markdown using pandoc with GitHub-flavored output.
# Usage: ./DocxToMarkdown.ps1 [-InputPath <path>] [-OutputDirectory <path>] [-Recursive] [-Overwrite] [-MediaFolder <name>]

param(
	[Parameter(Position = 0)]
	[string]$InputPath = (Join-Path -Path $PSScriptRoot -ChildPath "..\thesis\source"),

	[Parameter(Position = 1)]
	[string]$OutputDirectory,

	[switch]$Recursive,

	[switch]$Overwrite,

	[string]$MediaFolder = "media"
)

function Get-DocxFiles {
	param(
		[string]$Path,
		[switch]$Recurse
	)

	$resolved = Resolve-Path -LiteralPath $Path -ErrorAction Stop
	$item = Get-Item -LiteralPath $resolved -ErrorAction Stop

	if ($item.PSIsContainer) {
		$docxFiles = Get-ChildItem -LiteralPath $item.FullName -Filter "*.docx" -File -Force -ErrorAction Stop -Recurse:$Recurse
		return $docxFiles
	}

	if ($item.Extension -ieq ".docx") {
		return ,$item
	}

	throw "InputPath must be a .docx file or directory containing .docx files."
}

function Get-OutputPath {
	param(
		[System.IO.FileInfo]$Docx,
		[string]$OutputDir,
		[string]$DefaultMediaFolder
	)

	if ([string]::IsNullOrWhiteSpace($OutputDir)) {
		$defaultOutput = Join-Path -Path $PSScriptRoot -ChildPath "..\thesis\output"
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

	$markdownFile = Join-Path -Path $targetDir -ChildPath ("{0}.md" -f $Docx.BaseName)
	$mediaDir = Join-Path -Path $targetDir -ChildPath ("{0}_{1}" -f $Docx.BaseName, $DefaultMediaFolder)

	return [PSCustomObject]@{
		MarkdownPath = $markdownFile
		MediaDirectory = $mediaDir
	}
}

function Assert-Pandoc {
	$pandoc = Get-Command -Name pandoc -ErrorAction SilentlyContinue
	if (-not $pandoc) {
		throw "pandoc is required but was not found. Install it from https://pandoc.org/installing.html"
	}

	return $pandoc.Source
}

function Convert-DocxToMarkdown {
	param(
		[System.IO.FileInfo]$DocxFile,
		[string]$MarkdownOutput,
		[string]$MediaOutput,
		[switch]$AllowOverwrite,
		[string]$PandocPath
	)

	if (-not $AllowOverwrite -and (Test-Path -LiteralPath $MarkdownOutput)) {
		throw "Output file already exists: $MarkdownOutput. Use -Overwrite to replace it."
	}

	if (-not (Test-Path -LiteralPath $MediaOutput)) {
		New-Item -ItemType Directory -Path $MediaOutput -Force | Out-Null
	}

	$arguments = @(
		$DocxFile.FullName
		'-f'
		'docx'
		'-t'
		'gfm'
		('--extract-media=' + $MediaOutput)
		'--wrap=none'
		'-o'
		$MarkdownOutput
	)

	$output = & $PandocPath @arguments 2>&1

	if ($LASTEXITCODE -ne 0) {
		throw "pandoc failed for $($DocxFile.FullName): $output"
	}

	if ($output) {
		Write-Host $output -ForegroundColor DarkGray
	}

	Write-Host "Converted $($DocxFile.Name) -> $MarkdownOutput"
}

try {
	$pandocPath = Assert-Pandoc
	$files = Get-DocxFiles -Path $InputPath -Recurse:$Recursive

	if (-not $files -or $files.Count -eq 0) {
		Write-Warning "No .docx files found to convert."
		return
	}

	foreach ($file in $files) {
		$paths = Get-OutputPath -Docx $file -OutputDir $OutputDirectory -DefaultMediaFolder $MediaFolder

		try {
			Convert-DocxToMarkdown -DocxFile $file -MarkdownOutput $paths.MarkdownPath -MediaOutput $paths.MediaDirectory -AllowOverwrite:$Overwrite -PandocPath $pandocPath
		}
		catch {
			Write-Warning $_.Exception.Message
		}
	}
}
catch {
	Write-Error $_.Exception.Message
	exit 1
}
