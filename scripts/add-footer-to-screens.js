const fs = require('fs');
const path = require('path');

// Danh sách các file cần cập nhật
const filesToUpdate = [
  'app/family/join-group.tsx',
  'app/family/join-from-invitation.tsx',
  'app/family/invite-join.tsx',
  'app/change-password.tsx',
  'app/index.tsx',
];

// Hàm cập nhật file
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Thêm import ScreenWithFooter nếu chưa có
    if (!content.includes('import ScreenWithFooter')) {
      const importMatch = content.match(/import.*ScreenWrapper.*from.*['"]/);
      if (importMatch) {
        content = content.replace(
          importMatch[0],
          importMatch[0].replace('ScreenWrapper', 'ScreenWithFooter')
        );
        updated = true;
      } else {
        // Thêm import mới
        const lastImportIndex = content.lastIndexOf('import');
        const nextLineIndex = content.indexOf('\n', lastImportIndex) + 1;
        content = content.slice(0, nextLineIndex) + 
                 'import ScreenWithFooter from \'../components/layout/ScreenWithFooter\';\n' +
                 content.slice(nextLineIndex);
        updated = true;
      }
    }

    // Thay thế ScreenWrapper bằng ScreenWithFooter
    if (content.includes('ScreenWrapper')) {
      content = content.replace(/ScreenWrapper/g, 'ScreenWithFooter');
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
console.log('🔄 Adding footer to all screens...\n');

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    updateFile(file);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✅ Finished updating files!');
