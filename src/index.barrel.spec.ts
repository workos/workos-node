import * as fs from 'node:fs';
import * as path from 'node:path';

describe('src/index.ts barrel', () => {
  const srcDir = path.join(__dirname);
  const indexPath = path.join(srcDir, 'index.ts');

  it('re-exports every service interfaces/ directory', () => {
    const indexContent = fs.readFileSync(indexPath, 'utf8');

    const serviceDirs = fs
      .readdirSync(srcDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => fs.existsSync(path.join(srcDir, name, 'interfaces')));

    const missing = serviceDirs.filter((dir) => {
      const exportLine = `export * from './${dir}/interfaces'`;
      return !indexContent.includes(exportLine);
    });

    expect(missing).toEqual([]);
  });
});
