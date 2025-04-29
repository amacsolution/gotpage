# deploy.ps1

# Sprawdź, czy build się powiódł
Write-Host "Budowanie aplikacji Next.js..." -ForegroundColor Cyan
npm run build

# Sprawdź kod wyjścia ostatniej komendy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build nie powiodl sie! Przerwanie wdrazania." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Build zakonczony pomyslnie. Rozpoczynam wdrazanie..." -ForegroundColor Green

# Synchronizuj pliki z serwerem
Write-Host "Przesylanie plikow na serwer..." -ForegroundColor Cyan
scp -P 222 -i "C:/Users/Antek/gotpage/.ssh/id_ed25519" -r `
    .next `
    public `
    app `
    lib `
    components `
    middleware.ts `
    next.config.mjs `
    package.json `
    package-lock.json `
    biycgepwzk@s11.cyber-folks.pl:domains/gotpage.pl/public_html

# Sprawdź, czy przesyłanie się powiodło
if ($LASTEXITCODE -ne 0) {
    Write-Host "Przesylanie plikow nie powiodlo sie! Przerwanie wdrazania." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Pliki przeslane pomyslnie. Instalowanie zaleznosci i restart aplikacji..." -ForegroundColor Green

# Uruchom komendy na serwerze - używamy średników zamiast && dla komend bash
ssh -i "C:/Users/Antek/gotpage/.ssh/id_ed25519" -p 222 biycgepwzk@gotpage.pl 'cd domains/gotpage.pl/public_html; npm install; pm2 restart gotpage.pl'

# Sprawdź, czy komendy na serwerze się powiodły
if ($LASTEXITCODE -ne 0) {
    Write-Host "Instalacja zaleznosci lub restart aplikacji nie powiodly sie!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Wdrazanie zakonczone pomyslnie!" -ForegroundColor Green

# Na końcu skryptu
if ($LASTEXITCODE -eq 0) {
    # Powiadomienie o sukcesie
    [System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null
    [System.Windows.Forms.MessageBox]::Show('Wdrazanie zakonczone pomyslnie!', 'Sukces', 'OK', 'Information')
} else {
    # Powiadomienie o błędzie
    [System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null
    [System.Windows.Forms.MessageBox]::Show('Wystapil blad podczas wdrazania!', 'Blad', 'OK', 'Error')
}