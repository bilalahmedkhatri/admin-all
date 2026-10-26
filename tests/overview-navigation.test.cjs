const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canViewOverviewSection, overviewSections } = require('../src/lib/gateway/overview-navigation.ts');
const { pageForPath } = require('../src/lib/gateway/permissions.ts');
test('Overview child URLs retain the existing overview permission boundary', () => {
 for (const entry of overviewSections) assert.equal(pageForPath(entry.path), 'overview');
 const limited = { role: 'viewer', page_permissions: '["overview"]' };
 assert.equal(canViewOverviewSection(limited, 'summary'), true);
 assert.equal(canViewOverviewSection(limited, 'analytics'), true);
 assert.equal(canViewOverviewSection(limited, 'collections'), false);
 assert.equal(canViewOverviewSection(limited, 'recent-activity'), false);
 const foreign = { role: 'viewer', page_permissions: '["endpoints","activity"]' };
 for (const entry of overviewSections) assert.equal(canViewOverviewSection(foreign, entry.id), false);
 const admin = { role: 'admin', page_permissions: '[]' };
 for (const entry of overviewSections) assert.equal(canViewOverviewSection(admin, entry.id), true);
});
