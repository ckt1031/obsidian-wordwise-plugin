// Update version with git tag in manifest.json
import { execSync } from 'node:child_process';
import fs from 'node:fs';

import manifest from '../manifest.json' with { type: 'json' };
import versions from '../versions.json' with { type: 'json' };

// Check current version in git
const currentVersion = execSync('git describe --tags').toString().trim();
const version = currentVersion.replace(/^v/, '');
manifest.version = `${version}-build`;

// Update version in manifest.json and versions.json
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
fs.writeFileSync('versions.json', JSON.stringify(versions, null, 2));
