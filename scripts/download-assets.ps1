# 一键恢复头像与铃声素材（约 1.2MB）
# 用法（PowerShell）：./scripts/download-assets.ps1
# 来源与版权见 NOTICE.md：均为第三方版权素材，仅限个人使用；公开发布前请替换。

$ErrorActionPreference = 'Continue'
$assets = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets'
New-Item -ItemType Directory -Force -Path $assets | Out-Null

function Get-WikiImage($title) {
    $enc = [uri]::EscapeDataString($title)
    $r = curl.exe -s -m 30 "https://zh.moegirl.org.cn/api.php?action=query&titles=$enc&prop=pageimages&piprop=original&format=json&redirects=1"
    if (-not $r) { return $null }
    try { $j = $r | ConvertFrom-Json } catch { return $null }
    foreach ($p in $j.query.pages.PSObject.Properties) {
        if ($p.Value.original) { return $p.Value.original.source }
    }
    return $null
}

$targets = @(
    @{ name = 'ginka';        title = 'GINKA' },
    @{ name = 'hachiman';     title = '比企谷八幡' },
    @{ name = 'oreki';        title = '折木奉太郎' },
    @{ name = 'chengxiaoshi'; title = '程小时' },
    @{ name = 'luguang';      title = '陆光' }
)
foreach ($t in $targets) {
    $src = Get-WikiImage $t.title
    if (-not $src) { Write-Warning "未找到 $($t.title) 的图片"; continue }
    $ext = [System.IO.Path]::GetExtension(($src -split '\?')[0])
    if (-not $ext) { $ext = '.png' }
    curl.exe -s -L -m 120 -o (Join-Path $assets ($t.name + $ext)) $src
    Write-Host "$($t.name) <- $src"
}

# 铃声：ayaho《チャイムの音で》iTunes 官方试听片段
curl.exe -s -L -m 120 -o (Join-Path $assets 'ringtone.m4a') 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/c1/49/1b/c1491bc3-9537-6f10-bbb6-23cc61af6bcb/mzaf_9638321516978476493.plus.aac.p.m4a'
Write-Host 'ringtone.m4a 完成'
Write-Host "素材目录: $assets"
