# deploy.ps1

# Ustaw ścieżkę roboczą na folder, w którym znajduje się skrypt
Set-Location -Path $PSScriptRoot

# Wczytaj dane
$sshKeyPath = Join-Path $PSScriptRoot ".ssh/id_ed25519"
$remoteUser = "biycgepwzk"
$remoteHost = "s11.cyber-folks.pl"
$remotePath = "domains/gotpage.pl/public_html"
$remoteDomain = "gotpage.pl"
$remotePort = 222

# Wypchnij zmiany do repozytorium
Write-Host "Wypychanie zmian do repozytorium Git..." -ForegroundColor Cyan
git add .
git commit -m "Automatyczny commit przed wdrożeniem"
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "Nie udalo sie wypchnac zmian do Git! Przerwanie wdrazania." -ForegroundColor Red
    exit $LASTEXITCODE
}

# Budowanie aplikacji
Write-Host "Budowanie aplikacji Next.js..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build nie powiodl sie! Przerwanie wdrazania." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Build zakonczony pomyslnie. Rozpoczynam wdrazanie..." -ForegroundColor Green

# Przesyłanie plików
Write-Host "Przesylanie plikow na serwer..." -ForegroundColor Cyan
scp -i $sshKeyPath -P $remotePort -r `
  .next `
  public `
  app `
  lib `
  emails `
  components `
  middleware.ts `
  next.config.mjs `
  package.json `
  package-lock.json `
  "$remoteUser@${remoteHost}:${remotePath}"



if ($LASTEXITCODE -ne 0) {
    Write-Host "Przesylanie plikow nie powiodlo sie! Przerwanie wdrazania." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Pliki przeslane pomyslnie. Instalowanie zaleznosci i restart aplikacji..." -ForegroundColor Green

ssh -i $sshKeyPath -p 222 "$remoteUser@$remoteDomain" "cd $remotePath; npm install; pm2 kill pm2 start ecosystem.config.js"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Instalacja zaleznosci lub restart aplikacji nie powiodly sie!" -ForegroundColor Red
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
