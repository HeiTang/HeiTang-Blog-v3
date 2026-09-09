import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

test('GA4 loads asynchronously only on the production hostname', async () => {
  const source = await readFile(new URL('./GoogleAnalytics.astro', import.meta.url), 'utf8');
  const script = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);

  for (const hostname of ['localhost', '127.0.0.1', 'preview.example.com', 'purr.tw']) {
    const scripts: { async?: boolean; src?: string }[] = [];
    const context = {
      hostname: 'purr.tw',
      measurementId: 'G-TEST123456',
      location: { hostname },
      window: {} as { dataLayer?: IArguments[] },
      document: {
        createElement: () => ({}),
        head: { appendChild: (element: { async?: boolean; src?: string }) => scripts.push(element) },
      },
    };
    vm.runInNewContext(script, context);
    if (hostname === 'purr.tw') {
      assert.deepEqual(scripts, [{ async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-TEST123456' }]);
      assert.equal(context.window.dataLayer?.length, 2);
      assert.deepEqual(Array.from(context.window.dataLayer![1]), ['config', 'G-TEST123456']);
    } else {
      assert.equal(scripts.length, 0);
      assert.equal(context.window.dataLayer, undefined);
    }
  }
});
