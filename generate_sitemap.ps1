param(
    [string]$BaseUrl = 'https://sarkaariresult.org/'
)

$ErrorActionPreference = 'Stop'

Set-Location -LiteralPath (Split-Path -Parent $MyInvocation.MyCommand.Path)

$workspace = Get-Location
$sitemapPath = Join-Path $workspace 'sitemap.xml'
$timestamp = Get-Date -Format 'yyyyMMddHHmmss'

if (Test-Path -LiteralPath $sitemapPath) {
    $backupPath = Join-Path $workspace ("sitemap.backup.$timestamp.xml")
    Copy-Item -LiteralPath $sitemapPath -Destination $backupPath -Force
}

$htmlFiles = Get-ChildItem -LiteralPath $workspace -Filter '*.html' -File | Sort-Object Name

$settings = New-Object System.Xml.XmlWriterSettings
$settings.Indent = $true
$settings.Encoding = New-Object System.Text.UTF8Encoding($false)

$writer = [System.Xml.XmlWriter]::Create($sitemapPath, $settings)
$writer.WriteStartDocument()
$writer.WriteStartElement('urlset', 'http://www.sitemaps.org/schemas/sitemap/0.9')

foreach ($file in $htmlFiles) {
    $name = $file.Name
    $lastmod = $file.LastWriteTime.ToString('yyyy-MM-dd')
    $priority = if ($name -ieq 'index.html') { '1.0' } else { '0.8' }

    $writer.WriteStartElement('url')
    $writer.WriteElementString('loc', ($BaseUrl.TrimEnd('/') + '/' + $name))
    $writer.WriteElementString('lastmod', $lastmod)
    $writer.WriteElementString('priority', $priority)
    $writer.WriteEndElement() # url
}

$writer.WriteEndElement() # urlset
$writer.WriteEndDocument()
$writer.Flush()
$writer.Close()

# Validate XML structure
[xml]$xml = Get-Content -LiteralPath $sitemapPath -Encoding UTF8
if (-not $xml.urlset) { throw 'Invalid sitemap: missing urlset root' }

Write-Output ("Sitemap regenerated: " + $sitemapPath)
Write-Output ("Total URLs: " + $xml.urlset.url.Count)

