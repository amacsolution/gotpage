# deploy.ps1

Set-Location -Path $PSScriptRoot

$sshKeyPath = Join-Path $PSScriptRoot ".ssh/id_ed25519"
$remoteUser = "biycgepwzk"
$remoteHost = "s11.cyber-folks.pl"
$remotePath = "domains/gotpage.pl/public_html"
$remoteDomain = "gotpage.pl"
$remotePort = 222

Write-Host "Wypychanie zmian do repozytorium Git..." -ForegroundColor Cyan
git add .
git commit -m "Automatyczny commit przed wdrożeniem"
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "Nie udalo sie wypchnac zmian do Git! Przerwanie wdrazania." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Budowanie aplikacji Next.js..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build nie powiodl sie! Przerwanie wdrazania." -ForegroundColor Red
    exit $LASTEXITCODE
}

# Pakowanie .next do ZIP-a
Write-Host "Pakowanie katalogu .next do next.zip..." -ForegroundColor Cyan
Compress-Archive -Path ".next/*" -DestinationPath "next.zip" -Force

# Przesyłanie plików na serwer
Write-Host "Przesylanie plikow na serwer..." -ForegroundColor Cyan
scp -i $sshKeyPath -P $remotePort `
  next.zip `
  -r public app lib emails hooks components middleware.ts next.config.mjs package.json package-lock.json `
  "$remoteUser@${remoteHost}:$remotePath"


if ($LASTEXITCODE -ne 0) {
    Write-Host "Przesylanie plikow nie powiodlo sie! Przerwanie wdrazania." -ForegroundColor Red
    exit $LASTEXITCODE
}

# Rozpakowywanie i uruchomienie na serwerze
Write-Host "Rozpakowywanie next.zip i restart aplikacji..." -ForegroundColor Cyan
ssh -i $sshKeyPath -p $remotePort "$remoteUser@$remoteDomain" "
  cd $remotePath;
  unzip -o next.zip && rm next.zip;
  npm install;
  pm2 kill;
  pm2 start ecosystem.config.js;
"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Instalacja lub restart nie powiodly sie!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Wdrazanie zakonczone pomyslnie!" -ForegroundColor Green

# Powiadomienie
[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null
[System.Windows.Forms.MessageBox]::Show('Wdrazanie zakonczone pomyslnie!', 'Sukces', 'OK', 'Information')
