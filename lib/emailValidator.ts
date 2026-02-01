export const validTlds = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'name', 'pro', 'coop', 'aero', 'museum', 'travel', 'cat', 'jobs', 'mobi', 'tel', 'asia', 'post', 'coop', 'arpa', 'root', 'pl', 'uk', 'de', 'fr', 'it', 'es', 'au', 'ca', 'jp', 'cn', 'in', 'br', 'mx', 'ru', 'nl', 'se', 'no', 'fi', 'dk', 'be', 'at', 'ch', 'pt', 'cz', 'sk', 'hu', 'si', 'hr', 'ba', 'me', 'rs', 'mk', 'al', 'bg', 'ro', 'gr', 'tr', 'il', 'sa', 'ae', 'qa', 'kw', 'bh', 'om', 'ye', 'jo', 'lb', 'sy', 'iq', 'ir', 'pk', 'bd', 'lk', 'np', 'mm', 'th', 'vn', 'my', 'sg', 'id', 'ph', 'kr', 'tw', 'hk', 'mo', 'us', 'ca', 'mx', 'bz', 'gt', 'hn', 'ni', 'cr', 'pa', 'sv', 'ht', 'do', 'cu', 'jm', 'tt', 'gy', 'sr', 'gf', 'fk', 'gs', 'sh', 'io', 'ac', 'uk', 'gg', 'je', 'im', 'gi', 'pt', 'es', 'ad', 'al', 'am', 'at', 'az', 'be', 'bg', 'by', 'ch', 'cy', 'cz', 'de', 'dk', 'ee', 'es', 'fi', 'fo', 'fr', 'ge', 'gr', 'hr', 'hu', 'ie', 'is', 'it', 'li', 'lt', 'lu', 'lv', 'mc', 'md', 'me', 'mk', 'mt', 'nl', 'no', 'pl', 'pt', 'ro', 'rs', 'ru', 'se', 'si', 'sj', 'sk', 'sm', 'tr', 'ua', 'va'];

export function getSuggestedEmailForCommonDomainTypos(rawEmail: string): string | null {
    const trimmed = rawEmail.trim();
    const atIndex = trimmed.lastIndexOf('@');
    if (atIndex <= 0 || atIndex === trimmed.length - 1) return null;

    const localPart = trimmed.slice(0, atIndex);
    const domainRaw = trimmed.slice(atIndex + 1);
    const domain = domainRaw.toLowerCase().replace(/^\s+|\s+$/g, '').replace(/\.+$/g, '');

    const directMap: Record<string, string> = {
      // gmail.com
      'gnail.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmali.com': 'gmail.com',
      'gmaik.com': 'gmail.com',
      'gmaio.com': 'gmail.com',
      'gmaol.com': 'gmail.com',
      'gmaul.com': 'gmail.com',
      'gmil.com': 'gmail.com',
      'gmaii.com': 'gmail.com',
      'gmaiil.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'gmail.cm': 'gmail.com',
      'gmail.con': 'gmail.com',
      'gmail.cmo': 'gmail.com',
      'gmail.om': 'gmail.com',
      'gmailcom': 'gmail.com',
      'gmail.comm': 'gmail.com',
      'gmail.comn': 'gmail.com',
      'gmail.cpm': 'gmail.com',
      'gmail.vom': 'gmail.com',
      'gmail.xom': 'gmail.com',
      'gmail.pl': 'gmail.com',

      // icloud.com
      'ikloud.com': 'icloud.com',
      'iclud.com': 'icloud.com',
      'iclod.com': 'icloud.com',
      'icloid.com': 'icloud.com',
      'iclould.com': 'icloud.com',
      'icloud.co': 'icloud.com',
      'icloud.cm': 'icloud.com',
      'icloud.con': 'icloud.com',
      'icloud.cmo': 'icloud.com',
      'icloud.om': 'icloud.com',
      'icloudcom': 'icloud.com',
      'icloud.comm': 'icloud.com',
      'icloud.comn': 'icloud.com',
      'icloud.cpm': 'icloud.com',
      'icloud.vom': 'icloud.com',
      'icloud.xom': 'icloud.com',
      'icloud.pl': 'icloud.com',

      // outlook.com
      'outlok.com': 'outlook.com',
      'otlook.com': 'outlook.com',
      'outllok.com': 'outlook.com',
      'outloook.com': 'outlook.com',
      'outlook.om': 'outlook.com',
      'outlook.co': 'outlook.com',
      'outlook.con': 'outlook.com',
      'outlook.cmo': 'outlook.com',
      'outlook.cm': 'outlook.com',
      'outlookcom': 'outlook.com',
      'outlook.comm': 'outlook.com',
      'outlook.comn': 'outlook.com',
      'outlook.cpm': 'outlook.com',
      'outlook.vom': 'outlook.com',
      'outlook.xom': 'outlook.com',
      'outlook.pl': 'outlook.com',

      // hotmail.com
      'hotnail.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com',
      'hotmial.com': 'hotmail.com',
      'hotmal.com': 'hotmail.com',
      'hotmaill.com': 'hotmail.com',
      'hotmail.om': 'hotmail.com',
      'hotmail.co': 'hotmail.com',
      'hotmail.con': 'hotmail.com',
      'hotmail.cmo': 'hotmail.com',
      'hotmail.cm': 'hotmail.com',
      'hotmailcom': 'hotmail.com',
      'hotmail.comm': 'hotmail.com',
      'hotmail.comn': 'hotmail.com',
      'hotmail.cpm': 'hotmail.com',
      'hotmail.vom': 'hotmail.com',
      'hotmail.xom': 'hotmail.com',
      'hotmail.pl': 'hotmail.com',

      // yahoo.com
      'yaho.com': 'yahoo.com',
      'yhoo.com': 'yahoo.com',
      'yahho.com': 'yahoo.com',
      'yaoo.com': 'yahoo.com',
      'yahoo.om': 'yahoo.com',
      'yahoo.co': 'yahoo.com',
      'yahoo.con': 'yahoo.com',
      'yahoo.cmo': 'yahoo.com',
      'yahoo.cm': 'yahoo.com',
      'yahoocom': 'yahoo.com',
      'yahoo.comm': 'yahoo.com',
      'yahoo.comn': 'yahoo.com',
      'yahoo.cpm': 'yahoo.com',
      'yahoo.vom': 'yahoo.com',
      'yahoo.xom': 'yahoo.com',
      'yahoo.pl': 'yahoo.com',

      // protonmail.com
      'protonmai.com': 'protonmail.com',
      'protonnmail.com': 'protonmail.com',
      'protonmaill.com': 'protonmail.com',
      'protonmail.om': 'protonmail.com',
      'protonmail.co': 'protonmail.com',
      'protonmail.con': 'protonmail.com',
      'protonmail.cmo': 'protonmail.com',
      'protonmail.cm': 'protonmail.com',
      'protonmailcom': 'protonmail.com',
      'protonmail.comm': 'protonmail.com',
      'protonmail.comn': 'protonmail.com',
      'protonmail.cpm': 'protonmail.com',
      'protonmail.vom': 'protonmail.com',
      'protonmail.xom': 'protonmail.com',
      'protonmail.pl': 'protonmail.com',

      // Polish providers (.pl)
      // onet.pl
      'onett.pl': 'onet.pl',
      'onnet.pl': 'onet.pl',
      'oneet.pl': 'onet.pl',
      'onet.lp': 'onet.pl',
      'onet.pll': 'onet.pl',
      'onet.p': 'onet.pl',
      'onet.com': 'onet.pl',
      'onet.co': 'onet.pl',
      'onet.con': 'onet.pl',
      'onet.cmo': 'onet.pl',
      'onet.cm': 'onet.pl',
      'onetpl': 'onet.pl',

      // wp.pl
      'wpp.pl': 'wp.pl',
      'wp.lp': 'wp.pl',
      'wp.pll': 'wp.pl',
      'wp.p': 'wp.pl',
      'wp.com': 'wp.pl',
      'wp.co': 'wp.pl',
      'wp.con': 'wp.pl',
      'wp.cmo': 'wp.pl',
      'wp.cm': 'wp.pl',
      'wppl': 'wp.pl',

      // interia.pl
      'interria.pl': 'interia.pl',
      'interai.pl': 'interia.pl',
      'interia.lp': 'interia.pl',
      'interia.pll': 'interia.pl',
      'interia.p': 'interia.pl',
      'interia.com': 'interia.pl',
      'interia.co': 'interia.pl',
      'interia.con': 'interia.pl',
      'interia.cmo': 'interia.pl',
      'interia.cm': 'interia.pl',
      'interiapl': 'interia.pl',

      // o2.pl
      '02.pl': 'o2.pl',
      'o-2.pl': 'o2.pl',
      'o2.lp': 'o2.pl',
      'o2.pll': 'o2.pl',
      'o2.p': 'o2.pl',
      'o2.com': 'o2.pl',
      'o2.co': 'o2.pl',
      'o2.con': 'o2.pl',
      'o2.cmo': 'o2.pl',
      'o2.cm': 'o2.pl',
      'o2pl': 'o2.pl',

      // op.pl
      '0p.pl': 'op.pl',
      'opp.pl': 'op.pl',
      'op.lp': 'op.pl',
      'op.pll': 'op.pl',
      'op.p': 'op.pl',
      'op.com': 'op.pl',
      'op.co': 'op.pl',
      'op.con': 'op.pl',
      'op.cmo': 'op.pl',
      'op.cm': 'op.pl',
      'oppl': 'op.pl',
    };

    const mapped = directMap[domain];
    if (mapped) return `${localPart}@${mapped}`;

    // Common TLD slip-ups for popular providers (mostly .com mistakes)
    const commonProvidersCom = ['gmail', 'icloud', 'outlook', 'hotmail', 'yahoo', 'protonmail'];
    const comEndingTypos = ['con', 'cmo', 'cm', 'co', 'comm', 'comn', 'cpm', 'vom', 'xom'];
    for (const provider of commonProvidersCom) {
      for (const typo of comEndingTypos) {
        if (domain === `${provider}.${typo}`) {
          return `${localPart}@${provider}.com`;
        }
      }
      // Missing dot (e.g. gmailcom)
      if (domain === `${provider}com` || domain === `${provider}comm`) {
        return `${localPart}@${provider}.com`;
      }
    }

    // Common TLD slip-ups for Polish providers (.pl)
    const commonProvidersPl = ['onet', 'wp', 'interia', 'o2', 'op'];
    const plEndingTypos = ['lp', 'pll', 'ppl'];
    for (const provider of commonProvidersPl) {
      // Swapped/extra letters in TLD
      for (const typo of plEndingTypos) {
        if (domain === `${provider}.${typo}`) {
          return `${localPart}@${provider}.pl`;
        }
      }
      // Common .com-ish endings mistakenly used
      for (const typo of ['com', 'co', 'con', 'cmo', 'cm']) {
        if (domain === `${provider}.${typo}`) {
          return `${localPart}@${provider}.pl`;
        }
      }
      // Missing dot (e.g. onetpl)
      if (domain === `${provider}pl` || domain === `${provider}pll`) {
        return `${localPart}@${provider}.pl`;
      }
    }

    return null;
  }
