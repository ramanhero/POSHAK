const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { execSync } = require('child_process');

const PORT = 3003;

// Stop any process already running on port 3003
try {
  const pids = execSync(`lsof -ti :${PORT}`, { encoding: 'utf-8' }).trim();
  if (pids) {
    console.log(`Port ${PORT} is occupied by PID(s): ${pids.split('\n').join(', ')}. Stopping...`);
    pids.split('\n').forEach(pid => {
      try {
        process.kill(Number(pid), 'SIGKILL');
      } catch (e) {}
    });
    console.log(`Successfully freed port ${PORT}.`);
  }
} catch (e) {
  // Port is already free
}

// Load catalog data
let productsCatalog = [];
try {
  const prodRaw = fs.readFileSync(path.join(__dirname, 'products.json'), 'utf-8');
  productsCatalog = JSON.parse(prodRaw).products || [];
  console.log(`Loaded ${productsCatalog.length} products from catalog.`);
} catch (e) {
  console.warn('Could not load products.json:', e.message);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.heic': 'image/heic',
  '.ico': 'image/x-icon'
};

// Route mapper for static HTML pages
const STATIC_VIEWS = {
  '/': 'views/index.html',
  '/collections/all-products': 'views/col_all_products.html',
  '/collections/all': 'views/col_all_products.html',
  '/collections/baggy': 'views/col_baggy.html',
  '/collections/bootcut': 'views/col_bootcut.html',
  '/collections/straight': 'views/col_straight.html',
  '/collections/wide': 'views/col_wide.html',
  '/collections/tops-1': 'views/col_tops.html',
  '/collections/tops': 'views/col_tops.html',
  '/collections/accessories-1': 'views/col_accessories.html',
  '/collections/accessories': 'views/col_accessories.html',
  '/collections/denimsin-stock': 'views/col_denimsin_stock.html',
  '/collections/denims': 'views/col_denims.html',
  '/collections/originals-all-drop': 'views/col_originals_all.html',
  '/collections/originals-drop-ate': 'views/col_originals_drop_ate.html',
  '/collections/originals-new-drop': 'views/col_originals_new_drop.html',
  '/collections/originals-jeans': 'views/col_originals_jeans.html',
  '/collections/originals-tees': 'views/col_originals_tees.html',
  '/collections/flash-sale': 'views/col_flash_sale.html',
  '/collections/new-arrivals': 'views/col_new_arrivals.html',
  '/collections/top-30-best-sellers': 'views/col_top_30_best_sellers.html',
  '/collections/blurg-selects': 'views/col_blurg_selects.html',
  '/pages/contact': 'views/page_contact.html',
  '/pages/blurg-selects': 'views/page_blurg_selects.html',
  '/pages/blurg-originals': 'views/page_blurg_originals.html',
  '/policies/refund-policy': 'views/policy_refund.html',
  '/policies/shipping-policy': 'views/policy_shipping.html',
  '/policies/privacy-policy': 'views/policy_privacy.html',
  '/policies/terms-of-service': 'views/policy_terms.html',
  '/policies/contact-information': 'views/policy_contact_info.html',
  '/cart': 'views/index.html',
  '/account': 'views/index.html',
  '/account/login': 'views/index.html',
  '/account/register': 'views/index.html'
};

function serveFileWithRange(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const total = stat.size;
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const range = req.headers.range;
  if (range && ext === '.mp4') {
    const parts = range.replace(/bytes=/, '').split('-');
    const partialstart = parts[0];
    const partialend = parts[1];

    const start = parseInt(partialstart, 10);
    const end = partialend ? parseInt(partialend, 10) : total - 1;
    const chunksize = (end - start) + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType
    });
    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);
  } else {
    const isDevAsset = ext === '.js' || ext === '.css' || ext === '.html';
    res.writeHead(200, {
      'Content-Length': total,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': isDevAsset ? 'no-cache, no-store, must-revalidate' : 'public, max-age=86400'
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

function proxyAndCache(reqUrl, assetPath, res) {
  let remoteUrl = 'https://blurgvillage.com' + reqUrl;
  if (assetPath.startsWith('/s/files/')) {
    remoteUrl = 'https://cdn.shopify.com' + reqUrl;
  }

  const localFile = path.join(__dirname, 'public', assetPath.replace(/^\//, ''));
  const localDir = path.dirname(localFile);
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  const req = https.get(remoteUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  }, (remoteRes) => {
    if (remoteRes.statusCode === 200) {
      const ext = path.extname(assetPath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': remoteRes.headers['content-type'] || MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400'
      });
      const fileStream = fs.createWriteStream(localFile);
      remoteRes.pipe(fileStream);
      remoteRes.pipe(res);
    } else {
      res.writeHead(remoteRes.statusCode || 404);
      res.end('Not found');
    }
  });

  req.on('error', (err) => {
    res.writeHead(502);
    res.end('Proxy error: ' + err.message);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Normalize trailing slash
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // 1. Static APIs
  if (pathname === '/products.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    fs.createReadStream(path.join(__dirname, 'products.json')).pipe(res);
    return;
  }

  if (pathname === '/collections.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    fs.createReadStream(path.join(__dirname, 'collections.json')).pipe(res);
    return;
  }

  // Cart API endpoints
  if (pathname === '/cart.js') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      token: "bv_token_local",
      note: null,
      attributes: {},
      total_price: 0,
      total_weight: 0,
      item_count: 0,
      items: [],
      requires_shipping: true,
      currency: "INR",
      items_subtotal_price: 0
    }));
    return;
  }

  if (pathname === '/cart/add.js' || pathname === '/cart/add') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: "Item added to cart" }));
    return;
  }

  // Predictive search API
  if (pathname === '/search/suggest.json' || pathname === '/search') {
    const q = (parsedUrl.query.q || '').toLowerCase();
    const results = productsCatalog.filter(p => p.title.toLowerCase().includes(q)).slice(0, 8);
    if (parsedUrl.query.resources) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        resources: {
          results: {
            products: results.map(p => ({
              id: p.id,
              title: p.title,
              url: `/products/${p.handle}`,
              image: p.images && p.images[0] ? p.images[0].src : '',
              price: p.variants && p.variants[0] ? p.variants[0].price : '1299'
            }))
          }
        }
      }));
      return;
    }
  }

  // 2. Direct views (Homepage, Collections, Policies, Pages)
  if (STATIC_VIEWS[pathname]) {
    const filePath = path.join(__dirname, STATIC_VIEWS[pathname]);
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // Collections wildcard route
  if (pathname.startsWith('/collections/')) {
    const colHandle = pathname.replace('/collections/', '');
    const colView = path.join(__dirname, `views/col_${colHandle.replace(/-/g, '_')}.html`);
    if (fs.existsSync(colView)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(colView).pipe(res);
      return;
    } else {
      // Fallback to all products collection
      const fallback = path.join(__dirname, 'views/col_all_products.html');
      if (fs.existsSync(fallback)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(fallback).pipe(res);
        return;
      }
    }
  }

  // Products wildcard route
  if (pathname.startsWith('/products/')) {
    const handle = pathname.replace('/products/', '');
    const prodFile = path.join(__dirname, 'views/products', `${handle}.html`);
    if (fs.existsSync(prodFile)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(prodFile).pipe(res);
      return;
    }

    // If not pre-downloaded, check if product is in products.json and synthesize full product page
    const product = productsCatalog.find(p => p.handle === handle);
    if (product) {
      const baseTemplate = path.join(__dirname, 'views/products/bv-worn-dark-bootcut.html');
      if (fs.existsSync(baseTemplate)) {
        let html = fs.readFileSync(baseTemplate, 'utf-8');
        const imgUrl = (product.images && product.images[0]) ? product.images[0].src : '';
        const price = product.variants && product.variants[0] ? product.variants[0].price : '1299';
        
        html = html.replace(/BV WORN DARK BOOTCUT/g, product.title.toUpperCase());
        html = html.replace(/bv-worn-dark-bootcut/g, product.handle);
        html = html.replace(/₹\s*1,499\.00/g, `₹${price}.00`);
        if (imgUrl) {
          html = html.replace(/src="[^"]*WEBP_File_5699[^"]*"/g, `src="${imgUrl}"`);
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }
    }
  }

  // 3. Static assets (/public/..., /cdn/..., /s/files/...)
  let assetCandidate = null;
  if (pathname === '/client-enhancement.js') {
    assetCandidate = path.join(__dirname, 'public/client-enhancement.js');
  } else if (pathname.startsWith('/public/')) {
    assetCandidate = path.join(__dirname, pathname);
  } else if (pathname.startsWith('/cdn/')) {
    assetCandidate = path.join(__dirname, 'public', pathname);
  } else if (pathname.startsWith('/s/files/')) {
    assetCandidate = path.join(__dirname, 'public', pathname);
  }

  if (assetCandidate && fs.existsSync(assetCandidate) && fs.statSync(assetCandidate).isFile()) {
    // If file is valid and not a 10px placeholder (< 2000 bytes, except favicon), serve it
    const stat = fs.statSync(assetCandidate);
    const isTinyPlaceholder = stat.size < 2000 && !assetCandidate.endsWith('blurg.png') && !assetCandidate.endsWith('.ico') && !assetCandidate.endsWith('.svg') && !assetCandidate.endsWith('.css') && !assetCandidate.endsWith('.js') && !assetCandidate.endsWith('.woff2') && !assetCandidate.endsWith('.woff');
    if (!isTinyPlaceholder) {
      serveFileWithRange(req, res, assetCandidate);
      return;
    }
  }

  // On-demand asset fetching proxy for CDN assets
  if (pathname.startsWith('/cdn/') || pathname.startsWith('/s/files/')) {
    proxyAndCache(req.url, pathname, res);
    return;
  }

  // 404 Fallback to home
  const fallbackHome = path.join(__dirname, 'views/index.html');
  if (fs.existsSync(fallbackHome)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(fallbackHome).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  BLURG VILLAGE REPLICA IS RUNNING SUCCESSFULLY!`);
  console.log(`  Local URL: http://localhost:${PORT}`);
  console.log(`  Network:   http://0.0.0.0:${PORT}`);
  console.log(`=======================================================`);
});
