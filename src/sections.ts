import { strict as assert } from 'assert';

const NONCE_DATE = '0';

type Attrs = Record<string, string>;

export type Item = {
  date: string,
  file: string,
  body: string,
  meta?: string,
  attrs: Attrs,
};

export type RichItem = {
  item: Item,
  canonicalId?: string,
}

const delim = /((?:^===.*$)|(?:^---$)|(?:^--- META: .*$))\n/m;

function parseMeta(meta: string): Record<string, string> {
  const rv: Record<string, string> = {};
  const withoutParens = meta.match(/^\((.*)\)$/);
  if (withoutParens == null) {
    throw `weird metadata ${meta}, expected parens around it`;
  }
  const parts = withoutParens[1].split(/\s+/);
  for (let i = 0; i < parts.length; i += 2) {
    rv[parts[i].replace(/^:/, '')] = parts[i + 1];
  }
  return rv;
}

export function struct_of_notes(file: string, text: string): RichItem[] {
  const parts = text.split(delim);
  const rv: Item[] = [];

  // drop anything before first delimiter
  if (!parts[0].match(delim))
    parts.shift();

  // should now only have headers and bodies
  assert.equal(parts.length % 2, 0);

  let date = NONCE_DATE;

  for (let i = 0; i < parts.length; i += 2) {
    let body = parts[i + 1];
    let header = parts[i];
    let attrs: Attrs = {};
    let meta: string | undefined = undefined;

    // extract attrs from body
    {
      const m = body.match(/^((?:@(?:[a-z-]+): [^\n]*\n)+)\n(.*)$/s);
      if (m) {
        m[1].split('\n').forEach(x => {
          const mm = x.match(/^@([a-z-]+): (.*)$/);
          if (mm) {
            attrs[mm[1]] = mm[2];
          }
        });
        body = m[2];
      }
    }

    // trim whitespace from body
    body = body.replace(/^\n+/, '');
    body = body.replace(/\n+$/, '');

    {
      const m = header.match(/^(=== (?:.*)|---) META: (.*)$/);
      if (m) {
        header = m[1];
        meta = m[2];
      }
    }

    {
      const m = header.match(/^=== ([\d.]+)$/);
      if (m) {
        date = m[1];
      }
    }
    const item: Item = { date, body, file, meta, attrs };
    rv.push(item);
  }
  return rv.map(enrich_item);
}

function enrich_item(item: Item): RichItem {
  let canonicalId: string | undefined = undefined;
  if (item.meta !== undefined) {
    const pm = parseMeta(item.meta);
    canonicalId = `${item.file}/${pm.id}`;
  }
  else {
    // Don't do this yet. There are still lots of NOTES entries without id.

    // if (item.file == 'NOTES') {
    //   console.log('missing meta');
    //   console.log(item);
    // }
  }
  return { item, canonicalId };
}
