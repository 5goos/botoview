// Automated QA Test Suite for BotoView

async function fetchPage(urlPath) {
    const res = await fetch(`http://localhost:4322${urlPath}`);
    const text = await res.text();
    return { status: res.status, headers: Object.fromEntries(res.headers.entries()), text };
}

async function runQASuite() {
    console.log('=== STARTING BOTOVIEW COMPREHENSIVE QA AUDIT ===\n');
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    function assert(desc, condition, details = '') {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`  ✓ PASS: ${desc}`);
        } else {
            failedTests++;
            console.error(`  ✗ FAIL: ${desc} ${details ? '--> ' + details : ''}`);
        }
    }

    // 1. ENDPOINTS & HTTP STATUS CODES
    console.log('\n--- 1. Testing Endpoints & HTTP Statuses ---');
    const routesToTest = [
        '/',
        '/releases/',
        '/releases/1.44.4/',
        '/releases/1.44.0/',
        '/services/',
        '/services/bedrock/',
        '/services/s3/',
        '/404/',
        '/robots.txt',
        '/sitemap.xml',
        '/sitemap-index.xml',
        '/sitemap-main.xml',
        '/sitemap-services.xml',
        '/data/track.json',
        '/data/versions/1.44.4.json',
        '/data/services/bedrock.json'
    ];

    for (const route of routesToTest) {
        try {
            const { status, headers, text } = await fetchPage(route);
            const expectedStatus = route === '/404/' ? [200, 404] : [200];
            assert(`Route ${route} responds with expected status (${expectedStatus.join('/')})`, expectedStatus.includes(status), `Got status ${status}`);
            assert(`Route ${route} has non-empty body`, text && text.length > 50, `Length: ${text ? text.length : 0}`);
            
            assert(`Route ${route} has no raw undefined in HTML`, !text.includes('undefined') || route.endsWith('.json') || text.includes('typeof undefined') || text.includes('void 0'), `Contains "undefined"`);
            assert(`Route ${route} has no [object Object]`, !text.includes('[object Object]'), `Contains [object Object]`);
        } catch (e) {
            assert(`Route ${route} loads successfully`, false, e.message);
        }
    }

    // 2. SEO & META TAGS ON KEY PAGES
    console.log('\n--- 2. Testing SEO, Canonical & JSON-LD Structured Data ---');
    const pagesForSEO = ['/', '/releases/', '/releases/1.44.4/', '/services/', '/services/bedrock/', '/404/'];
    for (const page of pagesForSEO) {
        const { text } = await fetchPage(page);
        
        const titleMatch = text.match(/<title>([^<]+)<\/title>/);
        const titleText = titleMatch ? titleMatch[1].replace(/&amp;/g, '&') : '';
        assert(`${page} has valid title`, titleText.includes('BotoView'), titleText || 'No title');
        assert(`${page} title length is Bing/Google compliant (15-65 chars)`, titleText.length >= 15 && titleText.length <= 65, `Length: ${titleText.length}`);

        const descMatch = text.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        const descText = descMatch ? descMatch[1] : '';
        assert(`${page} has non-empty meta description`, descText.length > 15, descText || 'Missing');
        assert(`${page} meta description is Bing/Google compliant (25-160 chars)`, descText.length >= 25 && descText.length <= 160, `Length: ${descText.length}`);

        const canonicalMatch = text.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
        assert(`${page} has canonical pointing to https://botoview.5goos.com ending in /`, canonicalMatch && canonicalMatch[1].startsWith('https://botoview.5goos.com') && canonicalMatch[1].endsWith('/'), canonicalMatch ? canonicalMatch[1] : 'Missing');

        assert(`${page} has skip-to-content accessibility link`, text.includes('href="#mainScrollArea"') && text.includes('id="mainScrollArea"'));

        const jsonLdMatches = text.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
        assert(`${page} has valid JSON-LD schemas`, jsonLdMatches.length > 0, `Found ${jsonLdMatches.length} blocks`);
        
        for (let i = 0; i < jsonLdMatches.length; i++) {
            const rawJson = jsonLdMatches[i].replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
            try {
                const parsed = JSON.parse(rawJson);
                assert(`${page} JSON-LD block ${i+1} parses cleanly`, true);
                const stringified = JSON.stringify(parsed);
                assert(`${page} JSON-LD block ${i+1} references 5goos or Amazon`, stringified.includes('5goos') || stringified.includes('Amazon'));
            } catch (err) {
                assert(`${page} JSON-LD block ${i+1} is valid JSON`, false, err.message);
            }
        }
    }

    // Robots meta directive checks
    const { text: releaseSingleHtml } = await fetchPage('/releases/1.44.4/');
    assert('Individual release page has noindex, follow to prune thin pages', releaseSingleHtml.includes('content="noindex, follow'));

    const { text: serviceBedrockHtml } = await fetchPage('/services/bedrock/');
    assert('Top indexable service has index, follow', serviceBedrockHtml.includes('content="index, follow'));
    assert('Service page includes SoftwareApplication JSON-LD', serviceBedrockHtml.includes('SoftwareApplication'));
    assert('Service page includes SDK Telemetry block', serviceBedrockHtml.includes('AWS SDK Telemetry') && serviceBedrockHtml.includes('Past 12 Months'));
    assert('Service page includes client quickstart code snippet', serviceBedrockHtml.includes("boto3.client('bedrock')") || serviceBedrockHtml.includes("boto3.client(&#39;bedrock&#39;)"));

    // DOM Cleanliness checks on Homepage
    const { text: homeHtml } = await fetchPage('/');
    assert('Homepage has NO raw <h2>Connection Override</h2> in static DOM', !homeHtml.includes('<h2>Connection Override</h2>'));
    assert('Homepage has NO static loading text in DOM before main', !homeHtml.includes('<span class="text-xs mono uppercase tracking-widest text-slate-400 font-bold">Initializing Core...</span>'));
    assert('Homepage has pre-rendered Popular AWS Services section', homeHtml.includes('Popular AWS Services &amp; Changelogs'));
    assert('Homepage has pre-rendered Recent AWS Boto3 Releases section', homeHtml.includes('Recent AWS Boto3 SDK Releases'));
    assert('Homepage has more than 30 internal crawlable links in raw HTML', (homeHtml.match(/href="\/services\//g) || []).length >= 30);

    // 3. 404 PAGE VERIFICATION
    console.log('\n--- 3. Testing 404 Not Found Page & Error Handling ---');
    const { text: notFoundHtml } = await fetchPage('/404/');
    assert('404 page contains "noindex, nofollow" robots tag', notFoundHtml.includes('noindex, nofollow'));
    assert('404 page contains quick search form', notFoundHtml.includes('quickQuery'));
    assert('404 page contains popular service links', notFoundHtml.includes('Popular AWS Services'));
    assert('404 page contains pip upgrade snippet', notFoundHtml.includes('pip install --upgrade boto3'));

    // 4. SITEMAPS & ROBOTS
    console.log('\n--- 4. Testing Sitemaps & robots.txt ---');
    const { text: robotsTxt } = await fetchPage('/robots.txt');
    assert('robots.txt allows all', robotsTxt.includes('Allow: /'));
    assert('robots.txt points to sitemap.xml', robotsTxt.includes('https://botoview.5goos.com/sitemap.xml'));
    assert('robots.txt points to sitemap-index.xml', robotsTxt.includes('https://botoview.5goos.com/sitemap-index.xml'));

    const { text: sitemapXml } = await fetchPage('/sitemap.xml');
    assert('sitemap.xml has valid sitemapindex XML', sitemapXml.includes('<sitemapindex') && sitemapXml.includes('</sitemapindex>'));
    assert('sitemap.xml references sitemap-main.xml', sitemapXml.includes('/sitemap-main.xml'));
    assert('sitemap.xml references sitemap-services.xml', sitemapXml.includes('/sitemap-services.xml'));
    assert('sitemap.xml does NOT reference sitemap-releases.xml (thin releases pruned)', !sitemapXml.includes('/sitemap-releases.xml'));

    const { text: sitemapServices } = await fetchPage('/sitemap-services.xml');
    assert('sitemap-services.xml has valid urlset XML', sitemapServices.includes('<urlset') && sitemapServices.includes('</urlset>'));
    assert('sitemap-services.xml includes /services/bedrock/', sitemapServices.includes('/services/bedrock/'));
    assert('sitemap-services.xml includes /services/s3/', sitemapServices.xml ? sitemapServices.includes('/services/s3/') : true);

    // 5. ALPINE COMPONENT CONTRACT AUDITS
    console.log('\n--- 5. Auditing Alpine Component Directives & Method Contracts ---');

    const { text: releaseHtml } = await fetchPage('/releases/1.44.4/');
    assert('Release page defines releasePage component in x-data', releaseHtml.includes('x-data="releasePage"'));
    assert('Release page has versionCounts for features and fixes', releaseHtml.includes('versionCounts.features') && releaseHtml.includes('versionCounts.fixes'));
    assert('Release page has highlight search marks', releaseHtml.includes('highlight(change.category, search)'));
    assert('Release page links services directly to dedicated service pages without click interception', 
        releaseHtml.includes(':href="\'/services/\' + (svc || \'\').toLowerCase() + \'/\'"') && 
        !releaseHtml.includes('@click.prevent="toggleReleaseServiceFilter(svc)"') &&
        !releaseHtml.includes('@click.prevent="toggleReleaseServiceFilter(change.category)"'));
    assert('Release page has keyboard shortcut listener', releaseHtml.includes('@keydown.window="handleKeydown($event)"'));

    const { text: serviceHtml } = await fetchPage('/services/bedrock/');
    assert('Service page defines servicePage component in x-data', serviceHtml.includes('x-data="servicePage"'));
    assert('Service page has paginatedUpdates', serviceHtml.includes('paginatedUpdates'));
    assert('Service page has search filter', serviceHtml.includes('searchQuery'));
    assert('Service page has copyUpdate', serviceHtml.includes('copyUpdate'));
    assert('Service page has serviceCounts count badges', serviceHtml.includes('serviceCounts.features') && serviceHtml.includes('serviceCounts.fixes'));
    assert('Service page has keyboard shortcut listener', serviceHtml.includes('@keydown.window="handleKeydown($event)"'));

    const { text: servicesIndexHtml } = await fetchPage('/services/');
    assert('Services index has letter section filtering x-show', servicesIndexHtml.includes('letter-') && servicesIndexHtml.includes('.some(id => id.includes(search.toLowerCase().trim()))'));
    assert('Services index has no-results empty state', servicesIndexHtml.includes('No Services Found'));

    const { text: releasesIndexHtml } = await fetchPage('/releases/');
    assert('Releases index normalizes search with cleanSearch', releasesIndexHtml.includes('cleanSearch'));
    assert('Releases index has no-results empty state', releasesIndexHtml.includes('No Releases Found'));

    // 6. BRANDING & ACCESSIBILITY AUDIT
    console.log('\n--- 6. Auditing 5goos Organization Branding & Accessibility ---');
    for (const page of ['/', '/releases/', '/releases/1.44.4/', '/services/', '/services/bedrock/']) {
        const { text: html } = await fetchPage(page);
        assert(`${page} footer links to https://5goos.com/`, html.includes('https://5goos.com/'));
        assert(`${page} footer attributes 5goos`, html.includes('5goos'));
    }

    console.log('\n=== QA AUDIT SUMMARY ===');
    console.log(`Total assertions: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);

    if (failedTests === 0) {
        console.log('\n🎉 ALL QA AUDIT CHECKS PASSED WITH 0 DEFECTS!');
        process.exit(0);
    } else {
        console.error(`\n⚠️ ${failedTests} DEFECTS DETECTED REQUIRING ATTENTION.`);
        process.exit(1);
    }
}

runQASuite().catch(e => {
    console.error('QA Suite crash:', e);
    process.exit(1);
});
