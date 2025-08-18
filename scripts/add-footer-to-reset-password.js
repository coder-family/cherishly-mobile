const fs = require('fs');

// Danh sách các file reset password cần cập nhật
const filesToUpdate = [
  'app/reset-password/reset-password-page.tsx',
  'app/reset-password/[token].tsx',
  'app/reset-password/index.tsx',
];

// Hàm cập nhật file
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Thêm import ScreenWithFooter nếu chưa có
    if (!content.includes('import ScreenWithFooter')) {
      const lastImportIndex = content.lastIndexOf('import');
      const nextLineIndex = content.indexOf('\n', lastImportIndex) + 1;
      content = content.slice(0, nextLineIndex) + 
               'import ScreenWithFooter from \'../components/layout/ScreenWithFooter\';\n' +
               content.slice(nextLineIndex);
      updated = true;
    }

    // Thay thế View wrapper bằng ScreenWithFooter
    if (content.includes('<View style={{ flex: 1 }}>') && !content.includes('ScreenWithFooter')) {
      content = content.replace(
        /<View style={{ flex: 1 }}>/g,
        '<ScreenWithFooter>'
      );
      content = content.replace(
        /<\/View>\s*\);\s*}/g,
        '</ScreenWithFooter>\n  );'
      );
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Chạy cập nhật cho tất cả files
console.log('🔄 Adding footer to reset password screens...\n');

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    updateFile(file);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✅ Finished updating reset password files!');
