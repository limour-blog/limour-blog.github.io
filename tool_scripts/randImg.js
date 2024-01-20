const fs = require('fs');
const path = require('path');

console.log('Current directory:', __dirname);

// _post 文件夹的相对路径
const postsFolder = path.join(__dirname, '..', 'source', '_posts');

fs.readdirSync(postsFolder).forEach(file => {
  const filePath = `${postsFolder}/${file}`;

  if (file.endsWith('.md')) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 匹配 metadata 部分
    const metadataRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(metadataRegex);

    if (match) {
    // 检查是否已经存在 index_img
        if (!/\bindex_img\b/.test(content)) {
            const metadata = match[1];
            const updatedMetadata = metadata.replace(/^\s*date:\s*([\d\s-:]+)$/m, "date: $1\nindex_img: https://api.limour.top/randomImg?d=$1");
    
            // 将更新后的 metadata 放回文件内容
            content = content.replace(metadata, updatedMetadata);

            // console.log(updatedMetadata);
            console.log(content);
    
            // 将更新后的内容保存回原文件
            // fs.writeFileSync(filePath, content, 'utf8');
    
            console.log(`File updated: ${filePath}`);
        } else {
        console.log(`Index_img already exists in file: ${filePath}`);
        }
    }
  }
});

console.log('Script completed.');
