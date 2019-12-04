const { normalize, resolve, relative } = require('path');
const fs = require('fs');
const JsZip = require('jszip');

/**
 * Utilities to simplify use of the jszip library
 */
class ZipUtil {
  /**
   * Zips a directory
   */
  async zipDir(path, out, lead) {
    // we know what directory we want
    const sourceDir = resolve(path);

    let zip = new JsZip();
    this.buildZipFromDirectory(sourceDir, zip, sourceDir, lead);

    // Generate zip file content
    const zipContent = await zip.generateAsync({
      type: 'nodebuffer',
      comment: 'zip-dir',
      compression: "DEFLATE",
      compressionOptions: {
        level: 9
      }
    });

    // Create zip file
    fs.writeFileSync(resolve(out), zipContent);
  }

  /**
   * Returns a flat array of absolute paths of all files recursively contained in the dir
   */
  buildZipFromDirectory(dir, zip, root, lead) {
    try {
      const list = fs.readdirSync(dir);

      for (let file of list) {
        // Do not process node_modules folder
        if (file.indexOf('node_modules') >= 0) continue;

        file = resolve(dir, file)
        let stat = fs.statSync(file)

        if (stat && stat.isDirectory()) {
          this.buildZipFromDirectory(file, zip, root, lead)
        }

        else {
          console.log('ZIPPING:', normalize(`${lead}/${relative(root, file)}`));
          const filedata = fs.readFileSync(file);
          zip.file(normalize(`${lead}/${relative(root, file)}`), filedata);
        }
      }
    }

    catch(err) {
      console.log('Could not read and zip directory'. dir);
    }
  }
}

module.exports = ZipUtil;
