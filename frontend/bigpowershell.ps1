$output = "output11.txt"

# تفريغ الملف
"" | Out-File $output -Encoding utf8

# جلب الملفات المطلوبة + استثناء copy
$files = Get-ChildItem -Path . -Recurse -File |
Where-Object {
    $_.Extension -in ".vue", ".js", ".ts", ".tsx" -and $_.FullName -notmatch "packag-lock.json|node_modules|dist|build"  -and
    $_.Name -notmatch "copy"
}

# بناء Tree
"=== FILTERED TREE ===" | Out-File $output -Append -Encoding utf8

$files |
Group-Object DirectoryName |
Sort-Object Name |
ForEach-Object {
    "`n[DIR] $($_.Name)" | Out-File $output -Append -Encoding utf8
    $_.Group | Sort-Object Name | ForEach-Object {
        "  |-- $($_.Name)" | Out-File $output -Append -Encoding utf8
    }
}

# محتوى الملفات بدون التعليقات
"`n=== FILE CONTENT ===" | Out-File $output -Append -Encoding utf8

$files | ForEach-Object {

    "`n===== $($_.FullName) =====" | Out-File $output -Append -Encoding utf8

    Get-Content $_.FullName | ForEach-Object {
        $_ -replace '//.*','' `
           -replace '#.*','' `
           -replace '/\*.*?\*/','' `
           -replace '<!--.*?-->',''
    } |
    Where-Object { $_.Trim() -ne "" } |
    Out-File $output -Append -Encoding utf8
}