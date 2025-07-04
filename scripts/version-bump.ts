import { writeFileSync } from 'node:fs';

import manifest from '../manifest.json';
import versions from '../versions.json';

const targetVersion = process.env.npm_package_version;

// read minAppVersion from manifest.json and bump version to target version
const { minAppVersion } = manifest;
if (targetVersion !== undefined && minAppVersion !== undefined) {
	manifest.version = targetVersion;
	versions[targetVersion as keyof typeof versions] = minAppVersion;
}
writeFileSync('manifest.json', JSON.stringify(manifest, null, '\t'));

// update versions.json with target version and minAppVersion from manifest.json
writeFileSync('versions.json', JSON.stringify(versions, null, '\t'));
