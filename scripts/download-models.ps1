# 一键下载 Kokoro-82M-zh 中文语音模型（约 127MB）
# 用法（PowerShell）：
#   ./scripts/download-models.ps1
# 网络说明：
#   - 默认走 hf-mirror.com（国内镜像）；可用 $env:HF_ENDPOINT 覆盖，如 https://huggingface.co
#   - 直连不通时请先开代理：$env:HTTPS_PROXY = 'http://127.0.0.1:7897'
# 校验：下载后会自动比对 model_quantized.onnx 大小（127356597 字节），不符会报错。

$ErrorActionPreference = 'Stop'
$repo = 'onnx-community/Kokoro-82M-v1.1-zh-ONNX'
$endpoint = if ($env:HF_ENDPOINT) { $env:HF_ENDPOINT.TrimEnd('/') } else { 'https://hf-mirror.com' }
$root = Join-Path (Split-Path $PSScriptRoot -Parent) 'models'
$dest = Join-Path $root 'kokoro-zh'
New-Item -ItemType Directory -Force -Path "$dest\onnx", "$dest\voices" | Out-Null

Write-Host "使用端点: $endpoint"
$treeUrl = "$endpoint/api/models/$repo/tree/main?recursive=true"
Write-Host "拉取文件清单: $treeUrl"
$files = curl.exe -s -L -m 60 $treeUrl | ConvertFrom-Json
if (-not $files) { throw "无法获取模型文件清单，请检查网络/代理" }

$count = 0
foreach ($f in $files) {
    if ($f.type -ne 'file') { continue }
    $rel = $f.path
    if ($rel -match '^(config\.json|tokenizer\.json|tokenizer_config\.json)$' -or $rel -eq 'onnx/model_quantized.onnx' -or $rel -match '^voices/') {
        $target = Join-Path $dest ($rel -replace '/', '\')
        curl.exe -s -L -m 1800 -o $target "$endpoint/$repo/resolve/main/$rel"
        if ($LASTEXITCODE -ne 0) { throw "下载失败: $rel" }
        $count++
    }
}
# 处理器配置模板（中文仓库未提供，本仓库附带）
Copy-Item (Join-Path $PSScriptRoot 'preprocessor_config.json') "$dest\preprocessor_config.json" -Force

$model = Join-Path $dest 'onnx\model_quantized.onnx'
$size = (Get-Item $model).Length
Write-Host "已下载 $count 个文件，model_quantized.onnx = $size 字节"
if ($size -ne 127356597) { Write-Warning "模型大小与预期(127356597)不符，可能下载不完整，请重试" }
Write-Host "完成。模型目录: $dest"
