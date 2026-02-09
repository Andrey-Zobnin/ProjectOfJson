/**
 * Скрипт для создания Windows установщика
 * Использует Inno Setup для создания setup.exe
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_NAME = 'DataSort Pro';
const APP_VERSION = '2.1.0';
const APP_ID = '{8F9A2B3C-4D5E-6F7A-8B9C-0D1E2F3A4B5C}';

// Путь к Inno Setup
const INNO_PATH = 'C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe';

// Создаём ISS скрипт
const issScript = `
; DataSort Pro Installer Script
#define MyAppName "${APP_NAME}"
#define MyAppVersion "${APP_VERSION}"
#define MyAppPublisher "Andrey Zobnin"
#define MyAppURL "https://github.com/Andrey-Zobnin/ProjectOfJson"
#define MyAppExeName "DataSortPro.exe"

[Setup]
AppId=${APP_ID}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=..\\installer
OutputBaseFilename=DataSortPro_Setup_{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "russian"; MessagesFile: "compiler:Languages\\Russian.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "..\\dist\\DataSortPro\\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\\dist\\DataSortPro\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"
Name: "{group}\\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
`;

// Сохраняем ISS файл
const issPath = path.join(__dirname, 'installer.iss');
fs.writeFileSync(issPath, issScript, 'utf8');

console.log('✅ ISS скрипт создан');

// Проверяем наличие Inno Setup
if (!fs.existsSync(INNO_PATH)) {
    console.error('❌ Inno Setup не найден!');
    console.log('📥 Скачайте с https://jrsoftware.org/isdl.php');
    process.exit(1);
}

// Создаём папку для установщика
const installerDir = path.join(__dirname, '..', 'installer');
if (!fs.existsSync(installerDir)) {
    fs.mkdirSync(installerDir, { recursive: true });
}

// Запускаем Inno Setup
console.log('🔨 Создание установщика...');
try {
    execSync(`"${INNO_PATH}" "${issPath}"`, { stdio: 'inherit' });
    console.log('✅ Установщик создан!');
    console.log(`📦 Файл: installer/DataSortPro_Setup_${APP_VERSION}.exe`);
} catch (error) {
    console.error('❌ Ошибка создания установщика:', error.message);
    process.exit(1);
}

// Удаляем временный ISS файл
fs.unlinkSync(issPath);
