# deploy.ps1

# Ustaw ścieżkę roboczą na folder ze skryptem
Set-Location -Path $PSScriptRoot

# Dane do połączenia
$sshKeyPath = Join-Path $PSScriptRoot ".ssh/id_ed25519"
$remoteUser = "biycgepwzk"
$remoteHost = "s11.cyber-folks.pl"
$remotePort = 222
$remotePath = "domains/gotpage.pl/public_html"

# Commit i push do Gita (opcjonalnie)
Write-Host "Wypychanie zmian do repozytorium Git..." -ForegroundColor Cyan
git add .
git commit -m "Automatyczny commit przed wdrożeniem"
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "Nie udalo sie wypchnac zmian do Git! Przerwanie wdrazania." -ForegroundColor Red
    exit $LASTEXITCODE
}

# Budowanie Next.js
Write-Host "Budowanie aplikacji Next.js..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build nie powiodl sie! Przerwanie wdrazania." -ForegroundColor Red
    exit $LASTEXITCODE
}

# Pakowanie potrzebnych plików
Write-Host "Pakowanie plików..." -ForegroundColor Cyan
tar -czf deploy.tar.gz `
  .next `
  public `
  package.json `
  package-lock.json `
  next.config.mjs `
  ecosystem.config.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Pakowanie nie powiodlo sie! Przerwanie wdrazania." -ForegroundColor Red
    exit $LASTEXITCODE
}

# Wysyłanie archiwum na serwer
Write-Host "Przesylanie plikow na serwer..." -ForegroundColor Cyan
scp -i $sshKeyPath -P $remotePort deploy.tar.gz "$remoteUser@${remoteHost}:${remotePath}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Przesylanie plikow nie powiodlo sie! Przerwanie wdrazania." -ForegroundColor Red
    exit $LASTEXITCODE
}

$remoteCommand = "cd $remotePath && rm -rf .next && tar -xzf deploy.tar.gz && rm deploy.tar.gz && npm install --omit=dev && pm2 restart ecosystem.config.js --update-env && pm2 save"

# Zdalne rozpakowanie, usunięcie starego .next, instalacja i restart
Write-Host "Instalowanie zaleznosci i restart aplikacji..." -ForegroundColor Green
ssh -i $sshKeyPath -p $remotePort "${remoteUser}@${remoteHost}" $remoteCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "Instalacja lub restart nie powiodly sie!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Wdrazanie zakonczone pomyslnie!" -ForegroundColor Green
# Powiadomienie na koniec
[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null
if ($LASTEXITCODE -eq 0) {
    [System.Windows.Forms.MessageBox]::Show('Wdrazanie zakonczone pomyslnie!', 'Sukces', 'OK', 'Information')
} else {
    [System.Windows.Forms.MessageBox]::Show('Wystapil blad podczas wdrazania!', 'Blad', 'OK', 'Error')
}


