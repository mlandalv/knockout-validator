﻿function Get-ScriptDirectory
{
    Split-Path $MyInvocation.ScriptName
}

function Build-KnockoutValidate()
{
    $baseDir = [System.IO.Path]::GetFullPath((Join-Path (Get-ScriptDirectory) ".."))
    $output = Join-Path $baseDir "build\output\knockout-validator-debug.js"
    $version = Get-Content (Join-Path $baseDir "build\fragments\version.txt")
    $header = (Get-Content (Join-Path $baseDir "build\fragments\header.txt"))
    $sourceFiles = Get-Content (Join-Path $baseDir "build\fragments\source-files.txt") | % { Join-Path $baseDir $_ }

    if (Test-Path $output)
    {
        Remove-Item $output
    }

    # Before combining the source files, add the header
    Add-Content -Encoding UTF8 $output $header

    foreach ($file in $sourceFiles)
    {
        Add-Content -Encoding UTF8 $output (Get-Content $file)
    }

    # Replace version strings with actual version
    Set-Content -Encoding UTF8 $output ((Get-Content $output) -replace "##VERSION##", "$version")
}

# Perform the build
Build-KnockoutValidate
