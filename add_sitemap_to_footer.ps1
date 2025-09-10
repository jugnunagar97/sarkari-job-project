param(
    [string]$SitemapHref = '/sitemap.xml'
)

$ErrorActionPreference = 'Stop'

Set-Location -LiteralPath (Split-Path -Parent $MyInvocation.MyCommand.Path)

$workspace = Get-Location
$timestamp = Get-Date -Format 'yyyyMMddHHmmss'
$backupDir = Join-Path $workspace ("footer-edit-backup-" + $timestamp)
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$htmlFiles = Get-ChildItem -LiteralPath $workspace -Filter '*.html' -File

$updatedCount = 0
foreach ($file in $htmlFiles) {
    $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8

    if ($content -notmatch '</footer>') { continue }
    if ($content -match [regex]::Escape("href=\"$SitemapHref\"") -or $content -match 'href=\"https?://[^\"]+/sitemap\.xml\"') { continue }

    # Insert before the first closing </footer>
    $insertion = "        <div class=\"footer-sitemap\"><a href=\"$SitemapHref\" rel=\"sitemap\">Sitemap</a></div>`r`n</footer>"
    $newContent = [regex]::Replace($content, '</footer>', $insertion, 1)

    if ($newContent -ne $content) {
        Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $backupDir $file.Name) -Force
        Set-Content -LiteralPath $file.FullName -Value $newContent -Encoding UTF8
        $updatedCount++
    }
}

Write-Output ("Files scanned: " + $htmlFiles.Count)
Write-Output ("Files updated: " + $updatedCount)
Write-Output ("Backup directory: " + $backupDir)

