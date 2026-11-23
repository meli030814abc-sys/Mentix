/**
 * MENTIX - Renderizador fiel de PowerPoint (.pptx)
 * Copia cada diapositiva EXACTAMENTE como esta en el archivo original (posiciones, fondos, imagenes,
 * formas, tipografias, colores) y la convierte en una imagen en pantalla completa.
 * No reorganiza, no resume y no aplica formato Mentix.
 *
 *   const res = await window.PptxFaithful.renderDeck(arrayBuffer, { onProgress, maxSide });
 *   res.slides -> [{ dataUrl, width, height, title, notes, text }]
 */
(function (global) {
  'use strict';

  var EMU_PER_PX = 9525;
  var NS_XHTML = 'http://www.w3.org/1999/xhtml';

  /* ------------------------------------------------------------------ */
  /* Utilidades XML                                                      */
  /* ------------------------------------------------------------------ */
  function parseXml(str) {
    return new DOMParser().parseFromString(str || '<x/>', 'application/xml');
  }
  function kids(el, name) {
    var out = [];
    if (!el) return out;
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) {
      if (!name || c.localName === name) out.push(c);
    }
    return out;
  }
  function kid(el, name) {
    if (!el) return null;
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) {
      if (c.localName === name) return c;
    }
    return null;
  }
  function deep(el, name) {
    if (!el) return null;
    var l = el.getElementsByTagNameNS('*', name);
    return l.length ? l[0] : null;
  }
  function deepAll(el, name) {
    if (!el) return [];
    return Array.prototype.slice.call(el.getElementsByTagNameNS('*', name));
  }
  function at(el, name, def) {
    if (!el) return def;
    var v = el.getAttribute(name);
    return (v === null || v === undefined) ? def : v;
  }
  function nu(el, name, def) {
    var v = at(el, name, null);
    if (v === null || v === '') return def;
    var n = Number(v);
    return isNaN(n) ? def : n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function r2(n) { return Math.round(n * 100) / 100; }

  /* ------------------------------------------------------------------ */
  /* ZIP minimo                                                          */
  /* ------------------------------------------------------------------ */
  function MiniZip(buf) {
    this.bytes = new Uint8Array(buf);
    this.dv = new DataView(buf);
    this.entries = {};
    var b = this.bytes, dv = this.dv, eocd = -1, i;
    for (i = b.length - 22; i >= Math.max(0, b.length - 65600); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('ZIP invalido');
    var total = dv.getUint16(eocd + 10, true);
    var p = dv.getUint32(eocd + 16, true);
    var dec = new TextDecoder('utf-8');
    for (var n = 0; n < total; n++) {
      if (p + 46 > b.length || dv.getUint32(p, true) !== 0x02014b50) break;
      var method = dv.getUint16(p + 10, true);
      var csize = dv.getUint32(p + 20, true);
      var nl = dv.getUint16(p + 28, true);
      var el = dv.getUint16(p + 30, true);
      var cl = dv.getUint16(p + 32, true);
      var off = dv.getUint32(p + 42, true);
      var name = dec.decode(b.subarray(p + 46, p + 46 + nl));
      this.entries[name] = { method: method, csize: csize, off: off };
      p += 46 + nl + el + cl;
    }
  }
  MiniZip.prototype.has = function (name) { return !!this.entries[name]; };
  MiniZip.prototype.read = async function (name) {
    var en = this.entries[name];
    if (!en) return null;
    var dv = this.dv;
    var nl = dv.getUint16(en.off + 26, true);
    var el = dv.getUint16(en.off + 28, true);
    var start = en.off + 30 + nl + el;
    var data = this.bytes.subarray(start, start + en.csize);
    if (en.method === 0) return data;
    if (en.method === 8) {
      if (typeof DecompressionStream === 'undefined') throw new Error('DecompressionStream no disponible');
      var ds = new DecompressionStream('deflate-raw');
      var w = ds.writable.getWriter();
      w.write(data);
      w.close();
      return new Uint8Array(await new Response(ds.readable).arrayBuffer());
    }
    return null;
  };
  MiniZip.prototype.text = async function (name) {
    var d = await this.read(name);
    return d ? new TextDecoder('utf-8').decode(d) : '';
  };

  function resolvePath(baseDir, target) {
    if (!target) return '';
    if (target.charAt(0) === '/') return target.slice(1);
    var parts = (baseDir + '/' + target).split('/'), out = [];
    parts.forEach(function (p) {
      if (p === '..') out.pop(); else if (p && p !== '.') out.push(p);
    });
    return out.join('/');
  }
  function parseRels(xml, baseDir) {
    var rels = {};
    if (!xml) return rels;
    var doc = parseXml(xml);
    deepAll(doc, 'Relationship').forEach(function (r) {
      var id = at(r, 'Id', '');
      var type = at(r, 'Type', '');
      var target = at(r, 'Target', '');
      var ext = /external/i.test(at(r, 'TargetMode', ''));
      rels[id] = { type: type, target: ext ? target : resolvePath(baseDir, target), external: ext };
    });
    return rels;
  }
  async function readRelsFor(zip, partPath) {
    var dir = partPath.substring(0, partPath.lastIndexOf('/'));
    var file = partPath.substring(partPath.lastIndexOf('/') + 1);
    var xml = await zip.text(dir + '/_rels/' + file + '.rels');
    return parseRels(xml, dir);
  }

  /* ------------------------------------------------------------------ */
  /* Colores                                                             */
  /* ------------------------------------------------------------------ */
  var PRST = {
    black: '000000', white: 'FFFFFF', red: 'FF0000', green: '008000', blue: '0000FF', yellow: 'FFFF00',
    gray: '808080', grey: '808080', orange: 'FFA500', purple: '800080', pink: 'FFC0CB', cyan: '00FFFF',
    magenta: 'FF00FF', lime: '00FF00', navy: '000080', teal: '008080', silver: 'C0C0C0', maroon: '800000',
    olive: '808000', brown: 'A52A2A', darkblue: '00008B', darkgreen: '006400', darkred: '8B0000',
    lightgray: 'D3D3D3', lightgrey: 'D3D3D3', darkgray: 'A9A9A9', darkgrey: 'A9A9A9'
  };
  function hexToRgb(h) {
    h = String(h || '000000').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.substr(0, 2), 16) || 0, parseInt(h.substr(2, 2), 16) || 0, parseInt(h.substr(4, 2), 16) || 0];
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), h = 0, s = 0, l = (mx + mn) / 2;
    if (mx !== mn) {
      var d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }
  function hslToRgb(h, s, l) {
    function f(p, q, t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    if (s === 0) { var v = Math.round(l * 255); return [v, v, v]; }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return [Math.round(f(p, q, h + 1 / 3) * 255), Math.round(f(p, q, h) * 255), Math.round(f(p, q, h - 1 / 3) * 255)];
  }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }

  function schemeToHex(name, ctx) {
    var n = name;
    if (ctx.clrMap && ctx.clrMap[n]) n = ctx.clrMap[n];
    var alias = { tx1: 'dk1', tx2: 'dk2', bg1: 'lt1', bg2: 'lt2' };
    if (alias[n]) n = alias[n];
    return ctx.theme.colors[n] || '000000';
  }

  /** Convierte un elemento de color (srgbClr, schemeClr...) en {r,g,b,a,css,hex} */
  function colorEl(c, ctx) {
    if (!c) return null;
    var ln = c.localName, hex;
    if (ln === 'srgbClr') hex = at(c, 'val', '000000');
    else if (ln === 'schemeClr') {
      var v = at(c, 'val', 'tx1');
      hex = (v === 'phClr') ? (ctx.phClr || '000000') : schemeToHex(v, ctx);
    } else if (ln === 'sysClr') {
      hex = at(c, 'lastClr', at(c, 'val', '') === 'window' ? 'FFFFFF' : '000000');
    } else if (ln === 'prstClr') hex = PRST[at(c, 'val', 'black')] || '000000';
    else if (ln === 'scrgbClr') {
      var f = function (k) { return Math.round(clamp01(nu(c, k, 0) / 100000) * 255).toString(16).padStart(2, '0'); };
      hex = f('r') + f('g') + f('b');
    } else if (ln === 'hslClr') {
      var rgbh = hslToRgb(nu(c, 'hue', 0) / 21600000, nu(c, 'sat', 0) / 100000, nu(c, 'lum', 0) / 100000);
      hex = rgbh.map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    } else return null;
    var rgb = hexToRgb(hex), r = rgb[0], g = rgb[1], b = rgb[2], a = 1;
    kids(c).forEach(function (m) {
      var val = nu(m, 'val', 100000) / 100000, hsl;
      switch (m.localName) {
        case 'alpha': a = val; break;
        case 'alphaMod': a *= val; break;
        case 'lumMod': hsl = rgbToHsl(r, g, b); hsl[2] = clamp01(hsl[2] * val); var x1 = hslToRgb(hsl[0], hsl[1], hsl[2]); r = x1[0]; g = x1[1]; b = x1[2]; break;
        case 'lumOff': hsl = rgbToHsl(r, g, b); hsl[2] = clamp01(hsl[2] + val); var x2 = hslToRgb(hsl[0], hsl[1], hsl[2]); r = x2[0]; g = x2[1]; b = x2[2]; break;
        case 'satMod': hsl = rgbToHsl(r, g, b); hsl[1] = clamp01(hsl[1] * val); var x3 = hslToRgb(hsl[0], hsl[1], hsl[2]); r = x3[0]; g = x3[1]; b = x3[2]; break;
        case 'satOff': hsl = rgbToHsl(r, g, b); hsl[1] = clamp01(hsl[1] + val); var x4 = hslToRgb(hsl[0], hsl[1], hsl[2]); r = x4[0]; g = x4[1]; b = x4[2]; break;
        case 'tint': r = Math.round(r * val + 255 * (1 - val)); g = Math.round(g * val + 255 * (1 - val)); b = Math.round(b * val + 255 * (1 - val)); break;
        case 'shade': r = Math.round(r * val); g = Math.round(g * val); b = Math.round(b * val); break;
        default: break;
      }
    });
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return {
      r: r, g: g, b: b, a: a,
      css: a >= 1 ? 'rgb(' + r + ',' + g + ',' + b + ')' : 'rgba(' + r + ',' + g + ',' + b + ',' + r2(a) + ')',
      hex: '#' + [r, g, b].map(function (x) { return x.toString(16).padStart(2, '0'); }).join('')
    };
  }
  function colorOf(parent, ctx) {
    if (!parent) return null;
    var names = ['srgbClr', 'schemeClr', 'sysClr', 'prstClr', 'scrgbClr', 'hslClr'];
    for (var i = 0; i < names.length; i++) {
      var c = kid(parent, names[i]);
      if (c) return colorEl(c, ctx);
    }
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Tema                                                                */
  /* ------------------------------------------------------------------ */
  function parseTheme(xml) {
    var t = { colors: {}, major: 'Calibri Light', minor: 'Calibri', fillStyles: [], lnStyles: [], bgFills: [] };
    if (!xml) return t;
    var doc = parseXml(xml);
    var cs = deep(doc, 'clrScheme');
    kids(cs).forEach(function (c) {
      var v = kid(c, 'srgbClr') || kid(c, 'sysClr');
      if (!v) return;
      t.colors[c.localName] = at(v, 'val', '000000').length === 6 && v.localName === 'srgbClr' ? at(v, 'val', '000000') : at(v, 'lastClr', '000000');
    });
    var mj = deep(doc, 'majorFont'), mn = deep(doc, 'minorFont');
    if (mj && kid(mj, 'latin')) t.major = at(kid(mj, 'latin'), 'typeface', t.major);
    if (mn && kid(mn, 'latin')) t.minor = at(kn(mn), 'typeface', t.minor);
    function kn(x) { return kid(x, 'latin'); }
    t.fillStyles = kids(deep(doc, 'fillStyleLst'));
    t.lnStyles = kids(deep(doc, 'lnStyleLst'));
    t.bgFills = kids(deep(doc, 'bgFillStyleLst'));
    return t;
  }

  /* ------------------------------------------------------------------ */
  /* Rellenos y lineas                                                   */
  /* ------------------------------------------------------------------ */
  function fillFromEl(el, ctx) {
    if (!el) return null;
    var ln = el.localName;
    if (ln === 'noFill') return { type: 'none' };
    if (ln === 'solidFill') {
      var c = colorOf(el, ctx);
      return c ? { type: 'solid', color: c } : { type: 'none' };
    }
    if (ln === 'gradFill') {
      var stops = kids(kid(el, 'gsLst'), 'gs').map(function (gs) {
        return { pos: nu(gs, 'pos', 0) / 100000, color: colorOf(gs, ctx) || { css: '#000', a: 1, r: 0, g: 0, b: 0 } };
      });
      var lin = kid(el, 'lin'), path = kid(el, 'path');
      return {
        type: 'grad', stops: stops,
        ang: lin ? nu(lin, 'ang', 0) / 60000 : 90,
        radial: !!path
      };
    }
    if (ln === 'blipFill') {
      var blip = kid(el, 'blip');
      var src = kid(el, 'srcRect');
      return {
        type: 'blip',
        rid: blip ? (blip.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed') || at(blip, 'r:embed', '')) : '',
        tile: !!kid(el, 'tile'),
        src: src ? { l: nu(src, 'l', 0) / 100000, t: nu(src, 't', 0) / 100000, r: nu(src, 'r', 0) / 100000, b: nu(src, 'b', 0) / 100000 } : null
      };
    }
    if (ln === 'pattFill') {
      var fg = colorOf(kid(el, 'fgClr'), ctx);
      return fg ? { type: 'solid', color: fg } : { type: 'none' };
    }
    return null;
  }

  function fillOfSpPr(spPr, style, ctx) {
    if (spPr) {
      var names = ['noFill', 'solidFill', 'gradFill', 'blipFill', 'pattFill'];
      for (var i = 0; i < names.length; i++) {
        var e = kid(spPr, names[i]);
        if (e) return fillFromEl(e, ctx);
      }
    }
    var ref = style && kid(style, 'fillRef');
    if (ref) {
      var idx = nu(ref, 'idx', 0);
      var saved = ctx.phClr;
      var pc = colorOf(ref, ctx);
      ctx.phClr = pc ? pc.hex.replace('#', '') : saved;
      var res = null;
      if (idx >= 1001) res = fillFromEl(ctx.theme.bgFills[idx - 1001], ctx);
      else if (idx >= 1) res = fillFromEl(ctx.theme.fillStyles[idx - 1], ctx);
      ctx.phClr = saved;
      return res;
    }
    return null;
  }

  function lineOfSpPr(spPr, style, ctx) {
    var ln = spPr ? kid(spPr, 'ln') : null;
    var base = null;
    var ref = style && kid(style, 'lnRef');
    if (ref && nu(ref, 'idx', 0) > 0) {
      var saved = ctx.phClr, pc = colorOf(ref, ctx);
      ctx.phClr = pc ? pc.hex.replace('#', '') : saved;
      var sty = ctx.theme.lnStyles[nu(ref, 'idx', 1) - 1];
      if (sty) {
        base = { w: nu(sty, 'w', 9525), color: null, dash: 'solid' };
        var f = fillFromEl(kid(sty, 'solidFill'), ctx);
        base.color = f && f.type === 'solid' ? f.color : pc;
      } else {
        base = { w: 9525, color: pc, dash: 'solid' };
      }
      ctx.phClr = saved;
    }
    if (!ln) return base;
    if (kid(ln, 'noFill')) return null;
    var out = base ? { w: base.w, color: base.color, dash: base.dash } : { w: 9525, color: null, dash: 'solid' };
    if (at(ln, 'w', null) !== null) out.w = nu(ln, 'w', 9525);
    var sf = kid(ln, 'solidFill');
    if (sf) { var c = colorOf(sf, ctx); if (c) out.color = c; }
    else if (kid(ln, 'gradFill')) {
      var gs = kid(kid(kid(ln, 'gradFill'), 'gsLst'), 'gs');
      var gc = colorOf(gs, ctx); if (gc) out.color = gc;
    }
    var pd = kid(ln, 'prstDash');
    if (pd) out.dash = at(pd, 'val', 'solid');
    var he = kid(ln, 'headEnd'), te = kid(ln, 'tailEnd');
    if (he && at(he, 'type', 'none') !== 'none') out.head = at(he, 'type', 'triangle');
    if (te && at(te, 'type', 'none') !== 'none') out.tail = at(te, 'type', 'triangle');
    if (!out.color) return base && base.color ? base : null;
    return out;
  }

  function dashArray(dash, w) {
    var u = Math.max(1, w);
    switch (dash) {
      case 'dash': case 'lgDash': return (u * 4) + ',' + (u * 3);
      case 'sysDash': return (u * 3) + ',' + (u * 1);
      case 'dot': case 'sysDot': return u + ',' + (u * 2);
      case 'dashDot': case 'lgDashDot': case 'sysDashDot': return (u * 4) + ',' + (u * 2) + ',' + u + ',' + (u * 2);
      default: return '';
    }
  }

  function shadowOf(spPr, ctx, k) {
    var eff = spPr ? kid(spPr, 'effectLst') : null;
    var sh = eff ? kid(eff, 'outerShdw') : null;
    if (!sh) return null;
    var blur = nu(sh, 'blurRad', 0) * k, dist = nu(sh, 'dist', 0) * k, dir = nu(sh, 'dir', 0) / 60000 * Math.PI / 180;
    var c = colorOf(sh, ctx) || { css: 'rgba(0,0,0,0.35)' };
    return { x: r2(Math.cos(dir) * dist), y: r2(Math.sin(dir) * dist), blur: r2(blur), color: c.css };
  }

  /* ------------------------------------------------------------------ */
  /* Geometria                                                           */
  /* ------------------------------------------------------------------ */
  function xfrmOf(spPr) {
    var x = spPr ? kid(spPr, 'xfrm') : null;
    if (!x) return null;
    var off = kid(x, 'off'), ext = kid(x, 'ext');
    if (!off || !ext) return null;
    return {
      x: nu(off, 'x', 0), y: nu(off, 'y', 0), w: nu(ext, 'cx', 0), h: nu(ext, 'cy', 0),
      rot: nu(x, 'rot', 0) / 60000, flipH: at(x, 'flipH', '0') === '1' || at(x, 'flipH', '') === 'true',
      flipV: at(x, 'flipV', '0') === '1' || at(x, 'flipV', '') === 'true'
    };
  }

  function avOf(geom, name, def) {
    var lst = geom ? kid(geom, 'avLst') : null;
    var found = def;
    kids(lst, 'gd').forEach(function (g) {
      if (at(g, 'name', '') === name) {
        var m = /val\s+(-?\d+)/.exec(at(g, 'fmla', ''));
        if (m) found = Number(m[1]);
      }
    });
    return found;
  }

  function polyStar(n, w, h, innerRatio) {
    var cx = w / 2, cy = h / 2, pts = [];
    for (var i = 0; i < n * 2; i++) {
      var ang = -Math.PI / 2 + i * Math.PI / n;
      var rr = (i % 2 === 0) ? 1 : innerRatio;
      pts.push((cx + Math.cos(ang) * rr * w / 2) + ',' + (cy + Math.sin(ang) * rr * h / 2));
    }
    return 'M' + pts.join(' L') + ' Z';
  }

  /** Devuelve 'd' del path (px) para geometrias preestablecidas; null = usar rectangulo */
  function presetPath(name, w, h, geom) {
    var ss = Math.min(w, h), a;
    switch (name) {
      case 'triangle': a = avOf(geom, 'adj', 50000); return 'M0,' + h + ' L' + (w * a / 100000) + ',0 L' + w + ',' + h + ' Z';
      case 'rtTriangle': return 'M0,0 L0,' + h + ' L' + w + ',' + h + ' Z';
      case 'diamond': return 'M' + (w / 2) + ',0 L' + w + ',' + (h / 2) + ' L' + (w / 2) + ',' + h + ' L0,' + (h / 2) + ' Z';
      case 'parallelogram': a = avOf(geom, 'adj', 25000); var o = Math.min(w, ss * a / 100000); return 'M' + o + ',0 L' + w + ',0 L' + (w - o) + ',' + h + ' L0,' + h + ' Z';
      case 'trapezoid': a = avOf(geom, 'adj', 25000); var t = ss * a / 100000; return 'M0,' + h + ' L' + t + ',0 L' + (w - t) + ',0 L' + w + ',' + h + ' Z';
      case 'hexagon': a = avOf(geom, 'adj', 25000); var hx = ss * a / 100000; return 'M' + hx + ',0 L' + (w - hx) + ',0 L' + w + ',' + (h / 2) + ' L' + (w - hx) + ',' + h + ' L' + hx + ',' + h + ' L0,' + (h / 2) + ' Z';
      case 'octagon': a = avOf(geom, 'adj', 29289); var oc = ss * a / 100000; return 'M' + oc + ',0 L' + (w - oc) + ',0 L' + w + ',' + oc + ' L' + w + ',' + (h - oc) + ' L' + (w - oc) + ',' + h + ' L' + oc + ',' + h + ' L0,' + (h - oc) + ' L0,' + oc + ' Z';
      case 'pentagon': return 'M' + (w / 2) + ',0 L' + w + ',' + (h * 0.38) + ' L' + (w * 0.81) + ',' + h + ' L' + (w * 0.19) + ',' + h + ' L0,' + (h * 0.38) + ' Z';
      case 'homePlate': a = avOf(geom, 'adj', 50000); var hp = w - ss * a / 100000; return 'M0,0 L' + hp + ',0 L' + w + ',' + (h / 2) + ' L' + hp + ',' + h + ' L0,' + h + ' Z';
      case 'chevron': a = avOf(geom, 'adj', 50000); var cv = ss * a / 100000; return 'M0,0 L' + (w - cv) + ',0 L' + w + ',' + (h / 2) + ' L' + (w - cv) + ',' + h + ' L0,' + h + ' L' + cv + ',' + (h / 2) + ' Z';
      case 'rightArrow': case 'leftArrow': case 'upArrow': case 'downArrow': {
        var a1 = avOf(geom, 'adj1', 50000), a2 = avOf(geom, 'adj2', 50000);
        var horiz = (name === 'rightArrow' || name === 'leftArrow');
        var L = horiz ? w : h, T = horiz ? h : w;
        var thick = T * a1 / 100000, head = Math.min(L, (horiz ? h : w) * a2 / 100000);
        var y0 = (T - thick) / 2, y1 = (T + thick) / 2, hx2 = L - head;
        var pts = [[0, y0], [hx2, y0], [hx2, 0], [L, T / 2], [hx2, T], [hx2, y1], [0, y1]];
        pts = pts.map(function (p) {
          if (name === 'rightArrow') return [p[0], p[1]];
          if (name === 'leftArrow') return [w - p[0], p[1]];
          if (name === 'downArrow') return [p[1], p[0]];
          return [p[1], h - p[0]];
        });
        return 'M' + pts.map(function (p) { return r2(p[0]) + ',' + r2(p[1]); }).join(' L') + ' Z';
      }
      case 'star4': return polyStar(4, w, h, 0.38);
      case 'star5': return polyStar(5, w, h, 0.382);
      case 'star6': return polyStar(6, w, h, 0.6);
      case 'star8': return polyStar(8, w, h, 0.7);
      case 'star10': return polyStar(10, w, h, 0.8);
      case 'star12': return polyStar(12, w, h, 0.85);
      case 'star16': return polyStar(16, w, h, 0.88);
      case 'star24': return polyStar(24, w, h, 0.92);
      case 'plus': case 'mathPlus': a = avOf(geom, 'adj', 25000); var pl = ss * a / 100000; return 'M' + pl + ',0 L' + (w - pl) + ',0 L' + (w - pl) + ',' + pl + ' L' + w + ',' + pl + ' L' + w + ',' + (h - pl) + ' L' + (w - pl) + ',' + (h - pl) + ' L' + (w - pl) + ',' + h + ' L' + pl + ',' + h + ' L' + pl + ',' + (h - pl) + ' L0,' + (h - pl) + ' L0,' + pl + ' L' + pl + ',' + pl + ' Z';
      case 'donut': {
        a = avOf(geom, 'adj', 25000); var dt = ss * a / 100000;
        var rx = w / 2, ry = h / 2, ix = rx - dt, iy = ry - dt;
        return 'M0,' + ry + ' A' + rx + ',' + ry + ' 0 1,0 ' + w + ',' + ry + ' A' + rx + ',' + ry + ' 0 1,0 0,' + ry + ' Z M' + dt + ',' + ry + ' A' + ix + ',' + iy + ' 0 1,1 ' + (w - dt) + ',' + ry + ' A' + ix + ',' + iy + ' 0 1,1 ' + dt + ',' + ry + ' Z';
      }
      case 'heart': return 'M' + (w / 2) + ',' + h + ' C' + (-w * 0.15) + ',' + (h * 0.45) + ' ' + (w * 0.2) + ',' + (-h * 0.1) + ' ' + (w / 2) + ',' + (h * 0.28) + ' C' + (w * 0.8) + ',' + (-h * 0.1) + ' ' + (w * 1.15) + ',' + (h * 0.45) + ' ' + (w / 2) + ',' + h + ' Z';
      case 'cloud': return 'ellipse';
      case 'round2SameRect': case 'round1Rect': case 'round2DiagRect': case 'snip1Rect': case 'snip2SameRect': case 'snip2DiagRect': case 'snipRoundRect': return 'roundRect';
      default: return null;
    }
  }

  function connectorPath(name, w, h) {
    switch (name) {
      case 'bentConnector2': return 'M0,0 L' + w + ',0 L' + w + ',' + h;
      case 'bentConnector3': return 'M0,0 L' + (w / 2) + ',0 L' + (w / 2) + ',' + h + ' L' + w + ',' + h;
      case 'bentConnector4': return 'M0,0 L' + (w / 2) + ',0 L' + (w / 2) + ',' + (h / 2) + ' L' + w + ',' + (h / 2) + ' L' + w + ',' + h;
      case 'bentConnector5': return 'M0,0 L' + (w / 4) + ',0 L' + (w / 4) + ',' + (h / 2) + ' L' + (w * 3 / 4) + ',' + (h / 2) + ' L' + (w * 3 / 4) + ',' + h + ' L' + w + ',' + h;
      case 'curvedConnector2': return 'M0,0 C' + (w / 2) + ',0 ' + w + ',' + (h / 2) + ' ' + w + ',' + h;
      case 'curvedConnector3': return 'M0,0 C' + (w / 2) + ',0 ' + (w / 2) + ',' + h + ' ' + w + ',' + h;
      case 'curvedConnector4': case 'curvedConnector5': return 'M0,0 C' + (w / 2) + ',0 ' + (w / 2) + ',' + h + ' ' + w + ',' + h;
      default: return 'M0,0 L' + w + ',' + h;
    }
  }

  function custGeomSvg(cg, w, h) {
    var out = [];
    kids(kid(cg, 'pathLst'), 'path').forEach(function (p) {
      var pw = nu(p, 'w', 0) || w, ph = nu(p, 'h', 0) || h;
      var sx = w / pw, sy = h / ph;
      var d = '', cx = 0, cy = 0;
      var pt = function (e) { return [nu(e, 'x', 0), nu(e, 'y', 0)]; };
      kids(p).forEach(function (cmd) {
        var ps = kids(cmd, 'pt').map(pt), n = cmd.localName;
        if (n === 'moveTo' && ps[0]) { d += 'M' + ps[0][0] + ',' + ps[0][1] + ' '; cx = ps[0][0]; cy = ps[0][1]; }
        else if (n === 'lnTo' && ps[0]) { d += 'L' + ps[0][0] + ',' + ps[0][1] + ' '; cx = ps[0][0]; cy = ps[0][1]; }
        else if (n === 'cubicBezTo' && ps.length >= 3) { d += 'C' + ps.map(function (q) { return q[0] + ',' + q[1]; }).join(' ') + ' '; cx = ps[2][0]; cy = ps[2][1]; }
        else if (n === 'quadBezTo' && ps.length >= 2) { d += 'Q' + ps.map(function (q) { return q[0] + ',' + q[1]; }).join(' ') + ' '; cx = ps[1][0]; cy = ps[1][1]; }
        else if (n === 'arcTo') {
          var wR = nu(cmd, 'wR', 0), hR = nu(cmd, 'hR', 0), st = nu(cmd, 'stAng', 0) / 60000, sw = nu(cmd, 'swAng', 0) / 60000;
          var stR = st * Math.PI / 180, enR = (st + sw) * Math.PI / 180;
          var ccx = cx - wR * Math.cos(stR), ccy = cy - hR * Math.sin(stR);
          var ex = ccx + wR * Math.cos(enR), ey = ccy + hR * Math.sin(enR);
          d += 'A' + wR + ',' + hR + ' 0 ' + (Math.abs(sw) > 180 ? 1 : 0) + ',' + (sw > 0 ? 1 : 0) + ' ' + r2(ex) + ',' + r2(ey) + ' ';
          cx = ex; cy = ey;
        } else if (n === 'close') d += 'Z ';
      });
      out.push({ d: d, sx: sx, sy: sy, fill: at(p, 'fill', 'norm') !== 'none', stroke: at(p, 'stroke', '1') !== '0' && at(p, 'stroke', '') !== 'false' });
    });
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Imagenes                                                            */
  /* ------------------------------------------------------------------ */
  var IMG_MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp', svg: 'image/svg+xml' };

  function bytesToDataUrl(u8, mime) {
    return new Promise(function (resolve) {
      var fr = new FileReader();
      fr.onload = function () { resolve(fr.result); };
      fr.onerror = function () { resolve(''); };
      fr.readAsDataURL(new Blob([u8], { type: mime }));
    });
  }

  async function loadImage(zip, target, cache) {
    if (cache[target] !== undefined) return cache[target];
    var ext = (target.split('.').pop() || '').toLowerCase();
    var mime = IMG_MIME[ext];
    if (!mime) { cache[target] = ''; return ''; }
    var data = await zip.read(target);
    if (!data || !data.length) { cache[target] = ''; return ''; }
    var url = '';
    try {
      if (data.length > 900 * 1024 && ext !== 'svg' && ext !== 'gif' && typeof createImageBitmap === 'function') {
        var bmp = await createImageBitmap(new Blob([data], { type: mime }));
        var mx = 1700, sc = Math.min(1, mx / Math.max(bmp.width, bmp.height));
        var cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(bmp.width * sc));
        cv.height = Math.max(1, Math.round(bmp.height * sc));
        cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
        url = (ext === 'png') ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', 0.9);
        if (bmp.close) bmp.close();
      }
    } catch (e) { url = ''; }
    if (!url) url = await bytesToDataUrl(data, mime);
    cache[target] = url;
    return url;
  }

  /* ------------------------------------------------------------------ */
  /* Texto                                                               */
  /* ------------------------------------------------------------------ */
  function fontStack(face, ctx) {
    var f = String(face || '').replace(/['"<>&]/g, '');
    if (f === '+mj-lt') f = ctx.theme.major;
    else if (f === '+mn-lt') f = ctx.theme.minor;
    else if (!f || /^\+/.test(f)) f = ctx.theme.minor;
    return "'" + f + "', Calibri, 'Segoe UI', Arial, Helvetica, sans-serif";
  }

  function rAttr(list, name) {
    for (var i = list.length - 1; i >= 0; i--) {
      var v = list[i] ? list[i].getAttribute(name) : null;
      if (v !== null && v !== undefined) return v;
    }
    return null;
  }
  function rKid(list, name) {
    for (var i = list.length - 1; i >= 0; i--) {
      var c = list[i] ? kid(list[i], name) : null;
      if (c) return c;
    }
    return null;
  }

  function romanOf(n, lower) {
    var map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']], s = '';
    map.forEach(function (m) { while (n >= m[0]) { s += m[1]; n -= m[0]; } });
    return lower ? s.toLowerCase() : s;
  }
  function autoNum(type, n) {
    var a = String.fromCharCode(96 + ((n - 1) % 26) + 1);
    switch (type) {
      case 'arabicPeriod': return n + '.';
      case 'arabicParenR': return n + ')';
      case 'arabicParenBoth': return '(' + n + ')';
      case 'arabicPlain': return String(n);
      case 'alphaLcPeriod': return a + '.';
      case 'alphaUcPeriod': return a.toUpperCase() + '.';
      case 'alphaLcParenR': return a + ')';
      case 'alphaUcParenR': return a.toUpperCase() + ')';
      case 'romanLcPeriod': return romanOf(n, true) + '.';
      case 'romanUcPeriod': return romanOf(n, false) + '.';
      default: return n + '.';
    }
  }

  /**
   * Construye el HTML del texto de una forma.
   * opts: { txBody, chain:[lstStyle...bajo->alto], k, defColor, wDefaultInsets, ph }
   */
  function buildText(txBody, chain, ctx, opts) {
    if (!txBody) return { html: '', text: '' };
    var k = ctx.k;
    var bodyPr = kid(txBody, 'bodyPr');
    var lIns = nu(bodyPr, 'lIns', 91440) * k, tIns = nu(bodyPr, 'tIns', 45720) * k;
    var rIns = nu(bodyPr, 'rIns', 91440) * k, bIns = nu(bodyPr, 'bIns', 45720) * k;
    var anchor = at(bodyPr, 'anchor', opts.anchor || 't');
    var wrap = at(bodyPr, 'wrap', 'square');
    var vert = at(bodyPr, 'vert', 'horz');
    var norm = bodyPr ? kid(bodyPr, 'normAutofit') : null;
    var fontScale = norm ? nu(norm, 'fontScale', 100000) / 100000 : 1;
    var lnRed = norm ? nu(norm, 'lnSpcReduction', 0) / 100000 : 0;

    var jc = anchor === 'ctr' ? 'center' : (anchor === 'b' ? 'flex-end' : 'flex-start');
    var wm = '';
    if (vert === 'vert' || vert === 'eaVert') wm = 'writing-mode:vertical-rl;';
    else if (vert === 'vert270') wm = 'writing-mode:vertical-rl;transform:rotate(180deg);';

    var paras = kids(txBody, 'p');
    var html = '', plain = [];
    var counters = {};
    var lstOwn = kid(txBody, 'lstStyle');
    var fullChain = chain.concat(lstOwn ? [lstOwn] : []);

    paras.forEach(function (p, pIdx) {
      var pPr = kid(p, 'pPr');
      var lvl = nu(pPr, 'lvl', 0);
      var lvlEls = fullChain.map(function (ls) { return kid(ls, 'lvl' + (lvl + 1) + 'pPr'); }).filter(Boolean);
      var pChain = lvlEls.concat(pPr ? [pPr] : []);
      var pAttr = function (n, d) { var v = rAttr(pChain, n); return v === null ? d : v; };
      var pKid = function (n) { return rKid(pChain, n); };

      var algn = pAttr('algn', 'l');
      var cssAlign = { l: 'left', ctr: 'center', r: 'right', just: 'justify', dist: 'justify', justLow: 'justify' }[algn] || 'left';
      var marL = Number(pAttr('marL', 0)) * k, indent = Number(pAttr('indent', 0)) * k;

      var defRprs = lvlEls.map(function (e) { return kid(e, 'defRPr'); }).filter(Boolean);
      var endRpr = kid(p, 'endParaRPr');

      var sizeOfRuns = function (rpr) {
        var sz = rAttr(defRprs.concat(rpr ? [rpr] : []), 'sz');
        return (sz ? Number(sz) / 100 : 18) * 12700 * k * fontScale;
      };
      var firstRun = kid(p, 'r');
      var paraSizePx = sizeOfRuns(firstRun ? kid(firstRun, 'rPr') : endRpr);

      // Interlineado fiel a DrawingML (100000 = 1.05x del tamaño de fuente)
      var lnSpc = pKid('lnSpc'), lineH = 1.15;
      if (lnSpc) {
        var pct = kid(lnSpc, 'spcPct'), pts = kid(lnSpc, 'spcPts');
        if (pct) lineH = Math.max(0.6, (nu(pct, 'val', 100000) / 100000 - lnRed)) * 1.04;
        else if (pts) lineH = (nu(pts, 'val', 1800) / 100 * 12700 * k) / Math.max(1, paraSizePx);
      } else if (lnRed) lineH = Math.max(0.75, 1 - lnRed) * 1.15;
      var spcOf = function (n) {
        var e = pKid(n);
        if (!e) return 0;
        var pct2 = kid(e, 'spcPct'), pts2 = kid(e, 'spcPts');
        if (pct2) return nu(pct2, 'val', 0) / 100000 * paraSizePx * 1.05;
        if (pts2) return nu(pts2, 'val', 0) / 100 * 12700 * k;
        return 0;
      };
      var spcBef = (pIdx === 0) ? 0 : spcOf('spcBef'), spcAft = spcOf('spcAft');

      // Vinetas
      var bullet = '', bulletStyle = '';
      if (!pKid('buNone')) {
        var bc = pKid('buChar'), ba = pKid('buAutoNum');
        if (bc) bullet = at(bc, 'char', '\u2022');
        else if (ba) {
          counters[lvl] = (counters[lvl] || 0) + 1;
          var start = nu(ba, 'startAt', 1);
          bullet = autoNum(at(ba, 'type', 'arabicPeriod'), counters[lvl] + start - 1);
        }
      }
      if (!bullet) { counters[lvl] = 0; }
      // reiniciar contadores de niveles inferiores
      Object.keys(counters).forEach(function (kk) { if (Number(kk) > lvl) counters[kk] = 0; });
      if (bullet) {
        var buClr = pKid('buClr'), buFont = pKid('buFont'), buSz = pKid('buSzPct');
        var bColor = buClr ? colorOf(buClr, ctx) : null;
        bulletStyle = (bColor ? 'color:' + bColor.css + ';' : '') +
          (buFont && at(buFont, 'typeface', '') && !/^\+/.test(at(buFont, 'typeface', '')) ? "font-family:'" + String(at(buFont, 'typeface', '')).replace(/['"<>&]/g, '') + "',Arial,sans-serif;" : '') +
          (buSz ? 'font-size:' + r2(nu(buSz, 'val', 100000) / 100000 * 100) + '%;' : '');
      }

      var runsHtml = '', ptext = '';
      var makeRun = function (rpr, text) {
        var rprs = defRprs.concat(rpr ? [rpr] : []);
        var sz = rAttr(rprs, 'sz');
        var px = (sz ? Number(sz) / 100 : 18) * 12700 * k * fontScale;
        var bold = rAttr(rprs, 'b') === '1' || rAttr(rprs, 'b') === 'true';
        var ital = rAttr(rprs, 'i') === '1' || rAttr(rprs, 'i') === 'true';
        var u = rAttr(rprs, 'u'), strike = rAttr(rprs, 'strike'), cap = rAttr(rprs, 'cap');
        var base = Number(rAttr(rprs, 'baseline') || 0), spc = rAttr(rprs, 'spc');
        var latin = rKid(rprs, 'latin');
        var fill = rKid(rprs, 'solidFill');
        var col = fill ? colorOf(fill, ctx) : null;
        if (!col) {
          var gf = rKid(rprs, 'gradFill');
          if (gf) { var g1 = kid(kid(gf, 'gsLst'), 'gs'); col = colorOf(g1, ctx); }
        }
        var colorCss = col ? col.css : (opts.defColor || '#000000');
        var deco = [];
        if (u && u !== 'none') deco.push('underline');
        if (strike && strike !== 'noStrike') deco.push('line-through');
        var st = 'font-size:' + r2(px * (base ? 0.7 : 1)) + 'px;' +
          'font-family:' + fontStack(latin ? at(latin, 'typeface', '') : '', ctx) + ';' +
          'color:' + colorCss + ';' +
          (bold ? 'font-weight:700;' : '') + (ital ? 'font-style:italic;' : '') +
          (deco.length ? 'text-decoration:' + deco.join(' ') + ';' : '') +
          (cap === 'all' ? 'text-transform:uppercase;' : (cap === 'small' ? 'font-variant:small-caps;' : '')) +
          (base ? 'vertical-align:' + (base > 0 ? 'super' : 'sub') + ';' : '') +
          (spc ? 'letter-spacing:' + r2(Number(spc) / 100 * 12700 * k) + 'px;' : '');
        return '<span style="' + st + '">' + esc(text) + '</span>';
      };

      kids(p).forEach(function (n) {
        var ln = n.localName;
        if (ln === 'r') {
          var t = kid(n, 't');
          var txt = t ? t.textContent : '';
          if (txt === '') return;
          runsHtml += makeRun(kid(n, 'rPr'), txt);
          ptext += txt;
        } else if (ln === 'br') {
          runsHtml += '<br/>';
          ptext += '\n';
        } else if (ln === 'fld') {
          var tf = kid(n, 't');
          var ftxt = tf ? tf.textContent : '';
          if (/slidenum/i.test(at(n, 'type', ''))) ftxt = String(ctx.slideNo || ftxt);
          runsHtml += makeRun(kid(n, 'rPr'), ftxt);
          ptext += ftxt;
        }
      });

      if (!runsHtml) {
        runsHtml = '<span style="font-size:' + r2(sizeOfRuns(endRpr)) + 'px;">\u200b</span>';
      }

      var bulletHtml = '';
      var padLeft = marL, textIndent = indent;
      if (bullet) {
        var hang = indent < 0 ? -indent : paraSizePx * 1.1;
        bulletHtml = '<span style="display:inline-block;width:' + r2(hang) + 'px;text-indent:0;white-space:nowrap;' + bulletStyle + '">' + esc(bullet) + '</span>';
        if (indent >= 0) { textIndent = 0; }
      }

      html += '<div style="margin:0;padding:0;padding-left:' + r2(Math.max(0, padLeft)) + 'px;text-indent:' + r2(textIndent) + 'px;' +
        'text-align:' + cssAlign + ';line-height:' + r2(lineH) + ';' +
        'margin-top:' + r2(spcBef) + 'px;margin-bottom:' + r2(spcAft) + 'px;">' + bulletHtml + runsHtml + '</div>';
      plain.push(ptext);
    });

    var wrapCss = (wrap === 'none') ? 'white-space:nowrap;' : 'white-space:normal;word-wrap:break-word;overflow-wrap:break-word;';
    var box = '<div style="position:absolute;left:0;top:0;right:0;bottom:0;box-sizing:border-box;' +
      'padding:' + r2(tIns) + 'px ' + r2(rIns) + 'px ' + r2(bIns) + 'px ' + r2(lIns) + 'px;' +
      'display:flex;flex-direction:column;justify-content:' + jc + ';' + wrapCss + wm + '">' + html + '</div>';
    return { html: box, text: plain.join('\n') };
  }

  /* ------------------------------------------------------------------ */
  /* Herencia de marcadores de posicion                                  */
  /* ------------------------------------------------------------------ */
  function phInfo(sp) {
    var nv = deep(kid(sp, 'nvSpPr') || kid(sp, 'nvPicPr') || kid(sp, 'nvGraphicFramePr'), 'ph');
    if (!nv) return null;
    return { type: at(nv, 'type', ''), idx: at(nv, 'idx', '') };
  }
  function normPhType(t) {
    if (t === 'ctrTitle') return 'title';
    if (t === 'subTitle' || t === 'obj' || t === '') return 'body';
    return t;
  }
  function findPh(spTree, ph) {
    if (!spTree || !ph) return null;
    var found = null, byType = null;
    kids(spTree).forEach(function (sp) {
      if (sp.localName !== 'sp' && sp.localName !== 'pic' && sp.localName !== 'graphicFrame') return;
      var p = phInfo(sp);
      if (!p) return;
      if (ph.idx !== '' && p.idx === ph.idx && !found) found = sp;
      if (normPhType(p.type) === normPhType(ph.type) && !byType) byType = sp;
    });
    return found || byType;
  }

  /* ------------------------------------------------------------------ */
  /* Render de formas                                                    */
  /* ------------------------------------------------------------------ */
  function boxStyle(T, x, y, w, h, k, rot) {
    var ax = (T.tx + T.sx * x) * k, ay = (T.ty + T.sy * y) * k, aw = T.sx * w * k, ah = T.sy * h * k;
    return {
      left: ax, top: ay, w: aw, h: ah,
      css: 'position:absolute;left:' + r2(ax) + 'px;top:' + r2(ay) + 'px;width:' + r2(aw) + 'px;height:' + r2(ah) + 'px;' +
        (rot ? 'transform:rotate(' + r2(rot) + 'deg);transform-origin:50% 50%;' : '')
    };
  }

  function gradCss(f) {
    var st = f.stops.map(function (s) { return s.color.css + ' ' + r2(s.pos * 100) + '%'; }).join(',');
    if (f.radial) return 'radial-gradient(circle at 50% 50%,' + st + ')';
    return 'linear-gradient(' + r2(f.ang + 90) + 'deg,' + st + ')';
  }

  var gid = 0;
  function svgFillAttr(f, defs, part) {
    if (!f || f.type === 'none') return 'fill="none"';
    if (f.type === 'solid') return 'fill="' + f.color.css + '"';
    if (f.type === 'grad') {
      var id = 'g' + (++gid);
      var a = f.ang * Math.PI / 180;
      var stops = f.stops.map(function (s) { return '<stop offset="' + r2(s.pos * 100) + '%" stop-color="' + s.color.css + '"/>'; }).join('');
      if (f.radial) defs.push('<radialGradient id="' + id + '" cx="50%" cy="50%" r="70%">' + stops + '</radialGradient>');
      else defs.push('<linearGradient id="' + id + '" x1="' + r2(0.5 - Math.cos(a) / 2) + '" y1="' + r2(0.5 - Math.sin(a) / 2) + '" x2="' + r2(0.5 + Math.cos(a) / 2) + '" y2="' + r2(0.5 + Math.sin(a) / 2) + '">' + stops + '</linearGradient>');
      return 'fill="url(#' + id + ')"';
    }
    if (f.type === 'blip') {
      var url = part.imgs[f.rid];
      if (!url) return 'fill="#cccccc"';
      var pid = 'p' + (++gid);
      defs.push('<pattern id="' + pid + '" patternUnits="objectBoundingBox" width="1" height="1"><image href="' + url + '" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none"/></pattern>');
      return 'fill="url(#' + pid + ')"';
    }
    return 'fill="none"';
  }

  function cssFillProps(f, part) {
    if (!f || f.type === 'none') return '';
    if (f.type === 'solid') return 'background:' + f.color.css + ';';
    if (f.type === 'grad') return 'background:' + gradCss(f) + ';';
    if (f.type === 'blip') {
      var url = part.imgs[f.rid];
      if (!url) return 'background:#cccccc;';
      if (f.tile) return 'background-image:url(' + url + ');background-repeat:repeat;';
      return 'background-image:url(' + url + ');background-size:100% 100%;background-repeat:no-repeat;';
    }
    return '';
  }

  /** Renderiza una forma <p:sp> / <p:cxnSp> */
  function renderSp(sp, T, ctx, part, layers) {
    var k = ctx.k;
    var spPr = kid(sp, 'spPr');
    var style = kid(sp, 'style');
    var ph = phInfo(sp);
    var xf = xfrmOf(spPr);
    var phLayout = null, phMaster = null;
    if (!xf && ph) {
      phLayout = findPh(part.layoutTree, ph);
      if (phLayout) xf = xfrmOf(kid(phLayout, 'spPr'));
      if (!xf) { phMaster = findPh(part.masterTree, ph); if (phMaster) xf = xfrmOf(kid(phMaster, 'spPr')); }
    }
    if (!xf) return;
    if (xf.w === 0 && xf.h === 0 && sp.localName !== 'cxnSp') return;
    var b = boxStyle(T, xf.x, xf.y, xf.w, xf.h, k, xf.rot);
    var w = b.w, h = b.h;

    var geom = spPr ? kid(spPr, 'prstGeom') : null;
    var cust = spPr ? kid(spPr, 'custGeom') : null;
    var gname = geom ? at(geom, 'prst', 'rect') : (cust ? 'cust' : 'rect');
    var isLine = (sp.localName === 'cxnSp') || /^(line|straightConnector1|bentConnector\d|curvedConnector\d)$/.test(gname);

    var fill = isLine ? { type: 'none' } : fillOfSpPr(spPr, style, ctx);
    var ln = lineOfSpPr(spPr, style, ctx);
    var shadow = shadowOf(spPr, ctx, k);
    var lw = ln ? Math.max(1, ln.w * k) : 0;
    var flipT = (xf.flipH ? 'scaleX(-1) ' : '') + (xf.flipV ? 'scaleY(-1)' : '');

    var inner = '';
    var simpleCss = !cust && !isLine && (gname === 'rect' || gname === 'roundRect' || gname === 'ellipse' || presetPath(gname, w, h, geom) === null || presetPath(gname, w, h, geom) === 'roundRect' || presetPath(gname, w, h, geom) === 'ellipse');
    var effName = gname;
    if (simpleCss) {
      var pp = presetPath(gname, w, h, geom);
      if (pp === 'roundRect') effName = 'roundRect';
      if (pp === 'ellipse') effName = 'ellipse';
      var radius = '';
      if (effName === 'ellipse') radius = 'border-radius:50%;';
      else if (effName === 'roundRect') {
        var adj = geom ? avOf(geom, 'adj', 16667) : 16667;
        radius = 'border-radius:' + r2(Math.min(w, h) * adj / 100000) + 'px;';
      }
      var needFlipBg = fill && fill.type === 'blip' && (xf.flipH || xf.flipV);
      var cssBorder = ln ? 'border:' + r2(lw) + 'px ' + (/dot|sysDot/i.test(ln.dash) ? 'dotted' : (/dash/i.test(ln.dash) ? 'dashed' : 'solid')) + ' ' + ln.color.css + ';' : '';
      var cssShadow = shadow ? 'box-shadow:' + shadow.x + 'px ' + shadow.y + 'px ' + shadow.blur + 'px ' + shadow.color + ';' : '';
      if (fill && fill.type !== 'none' || ln || shadow) {
        inner += '<div style="position:absolute;left:0;top:0;width:100%;height:100%;box-sizing:border-box;' + radius + cssFillProps(fill, part) + cssBorder + cssShadow +
          (needFlipBg ? 'transform:' + flipT + ';' : '') + '"></div>';
      }
    } else {
      var defs = [];
      var W = Math.max(1, w), H = Math.max(1, h);
      var strokeAttr = ln ? 'stroke="' + ln.color.css + '" stroke-width="' + r2(lw) + '" ' + (dashArray(ln.dash, lw) ? 'stroke-dasharray="' + dashArray(ln.dash, lw) + '" ' : '') + 'stroke-linejoin="round" vector-effect="non-scaling-stroke"' : 'stroke="none"';
      var body = '';
      if (cust) {
        custGeomSvg(cust, W, H).forEach(function (cp) {
          var fa = cp.fill ? svgFillAttr(fill, defs, part) : 'fill="none"';
          var sa = cp.stroke ? strokeAttr : 'stroke="none"';
          body += '<path d="' + cp.d + '" transform="scale(' + r2(cp.sx * 1000) / 1000 + ',' + r2(cp.sy * 1000) / 1000 + ')" ' + fa + ' ' + sa + ' fill-rule="evenodd"/>';
        });
      } else if (isLine) {
        var d = connectorPath(gname, W, H);
        var marker = '';
        var aid = 'a' + (++gid);
        if (ln && (ln.tail || ln.head)) {
          defs.push('<marker id="' + aid + '" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8 Z" fill="' + ln.color.css + '"/></marker>');
          marker = (ln.tail ? 'marker-end="url(#' + aid + ')" ' : '') + (ln.head ? 'marker-start="url(#' + aid + ')" ' : '');
        }
        body += '<path d="' + d + '" fill="none" ' + strokeAttr + ' ' + marker + '/>';
      } else {
        var dd = presetPath(gname, W, H, geom);
        if (dd) body += '<path d="' + dd + '" ' + svgFillAttr(fill, defs, part) + ' ' + strokeAttr + ' fill-rule="evenodd"/>';
        else body += '<rect x="0" y="0" width="' + W + '" height="' + H + '" ' + svgFillAttr(fill, defs, part) + ' ' + strokeAttr + '/>';
      }
      var filt = shadow ? 'filter:drop-shadow(' + shadow.x + 'px ' + shadow.y + 'px ' + (shadow.blur / 2) + 'px ' + shadow.color + ');' : '';
      var pad = lw;
      inner += '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;left:0;top:0;overflow:visible;' + filt + (flipT ? 'transform:' + flipT + ';transform-origin:50% 50%;' : '') + '" width="' + r2(W) + '" height="' + r2(H) + '" viewBox="0 0 ' + r2(W) + ' ' + r2(H) + '">' +
        (defs.length ? '<defs>' + defs.join('') + '</defs>' : '') + body + '</svg>';
      void pad;
    }

    // Texto
    var txBody = kid(sp, 'txBody');
    var textHtml = '';
    var textPlain = '';
    if (txBody && kids(txBody, 'p').length) {
      var chain = [];
      var isTitle = ph && normPhType(ph.type) === 'title';
      if (ph) {
        var phTypeN = normPhType(ph.type);
        var ms = ctx.masterStyles;
        chain.push(ctx.defaultTextStyle);
        chain.push(isTitle ? ms.title : (phTypeN === 'body' ? ms.body : ms.other));
        if (!phMaster) phMaster = findPh(part.masterTree, ph);
        if (!phLayout) phLayout = findPh(part.layoutTree, ph);
        if (phMaster) chain.push(kid(kid(phMaster, 'txBody'), 'lstStyle'));
        if (phLayout) chain.push(kid(kid(phLayout, 'txBody'), 'lstStyle'));
      } else {
        chain.push(ctx.defaultTextStyle);
      }
      chain = chain.filter(Boolean);
      var fr = style ? kid(style, 'fontRef') : null;
      var frc = fr ? colorOf(fr, ctx) : null;
      var tb = txBody;
      // anchor heredado del marcador de posicion
      var anchorDef = 't';
      var anSrc = [phLayout, phMaster];
      for (var ai = 0; ai < anSrc.length; ai++) {
        if (anSrc[ai]) {
          var bp = kid(kid(anSrc[ai], 'txBody'), 'bodyPr');
          if (bp && at(bp, 'anchor', null)) { anchorDef = at(bp, 'anchor', 't'); break; }
        }
      }
      var res = buildText(tb, chain, ctx, { defColor: frc ? frc.css : (ctx.defTextColor || '#000000'), anchor: anchorDef });
      textHtml = res.html;
      textPlain = res.text;
      if (isTitle && res.text.trim() && !ctx.slideTitle) ctx.slideTitle = res.text.trim().split('\n')[0];
    }
    if (textPlain) ctx.slideText.push(textPlain);

    if (!inner && !textHtml) return;
    layers.push('<div style="' + b.css + '">' + inner + textHtml + '</div>');
  }

  async function renderPic(pic, T, ctx, part, layers) {
    var k = ctx.k;
    var spPr = kid(pic, 'spPr');
    var xf = xfrmOf(spPr);
    if (!xf) return;
    var b = boxStyle(T, xf.x, xf.y, xf.w, xf.h, k, xf.rot);
    var bf = kid(pic, 'blipFill');
    var f = fillFromEl(bf, ctx);
    if (!f || f.type !== 'blip') return;
    var url = part.imgs[f.rid];
    var ln = lineOfSpPr(spPr, null, ctx);
    var geom = kid(spPr, 'prstGeom');
    var gname = geom ? at(geom, 'prst', 'rect') : 'rect';
    var radius = '';
    if (gname === 'ellipse') radius = 'border-radius:50%;';
    else if (gname === 'roundRect') radius = 'border-radius:' + r2(Math.min(b.w, b.h) * avOf(geom, 'adj', 16667) / 100000) + 'px;';
    var shadow = shadowOf(spPr, ctx, k);
    if (!url) return;
    var src = f.src || { l: 0, t: 0, r: 0, b: 0 };
    var vw = 1 - src.l - src.r, vh = 1 - src.t - src.b;
    if (vw <= 0.001) vw = 1; if (vh <= 0.001) vh = 1;
    var iw = b.w / vw, ih = b.h / vh;
    var il = -src.l / vw * b.w, it = -src.t / vh * b.h;
    var blip = kid(bf, 'blip');
    var alpha = blip && kid(blip, 'alphaModFix') ? nu(kid(blip, 'alphaModFix'), 'amt', 100000) / 100000 : 1;
    var gray = blip && kid(blip, 'grayscl');
    var flipT = (xf.flipH ? 'scaleX(-1) ' : '') + (xf.flipV ? 'scaleY(-1)' : '');
    var border = ln ? 'border:' + r2(Math.max(1, ln.w * k)) + 'px solid ' + ln.color.css + ';' : '';
    var sh = shadow ? 'box-shadow:' + shadow.x + 'px ' + shadow.y + 'px ' + shadow.blur + 'px ' + shadow.color + ';' : '';
    layers.push('<div style="' + b.css + 'overflow:hidden;box-sizing:border-box;' + radius + border + sh + (flipT ? '' : '') + '">' +
      '<img src="' + url + '" alt="" style="position:absolute;left:' + r2(il) + 'px;top:' + r2(it) + 'px;width:' + r2(iw) + 'px;height:' + r2(ih) + 'px;max-width:none;' +
      (alpha < 1 ? 'opacity:' + r2(alpha) + ';' : '') + (gray ? 'filter:grayscale(1);' : '') + (flipT ? 'transform:' + flipT + ';transform-origin:50% 50%;' : '') + '"/></div>');
  }

  function renderTable(gf, T, ctx, part, layers) {
    var k = ctx.k;
    var xfEl = kid(gf, 'xfrm');
    if (!xfEl) return;
    var off = kid(xfEl, 'off'), ext = kid(xfEl, 'ext');
    if (!off || !ext) return;
    var b = boxStyle(T, nu(off, 'x', 0), nu(off, 'y', 0), nu(ext, 'cx', 0), nu(ext, 'cy', 0), k, 0);
    var tbl = deep(gf, 'tbl');
    if (!tbl) return;
    var cols = kids(kid(tbl, 'tblGrid'), 'gridCol').map(function (c) { return nu(c, 'w', 0) * T.sx * k; });
    var html = '<table style="border-collapse:collapse;table-layout:fixed;width:' + r2(b.w) + 'px;">' +
      '<colgroup>' + cols.map(function (c) { return '<col style="width:' + r2(c) + 'px"/>'; }).join('') + '</colgroup>';
    kids(tbl, 'tr').forEach(function (tr) {
      html += '<tr style="height:' + r2(nu(tr, 'h', 0) * T.sy * k) + 'px;">';
      kids(tr, 'tc').forEach(function (tc) {
        if (at(tc, 'hMerge', '0') === '1' || at(tc, 'vMerge', '0') === '1') return;
        var tcPr = kid(tc, 'tcPr');
        var fl = tcPr ? fillOfSpPr(tcPr, null, ctx) : null;
        var bg = fl && fl.type === 'solid' ? 'background:' + fl.color.css + ';' : (fl && fl.type === 'grad' ? 'background:' + gradCss(fl) + ';' : '');
        var borders = '';
        ['lnL:left', 'lnR:right', 'lnT:top', 'lnB:bottom'].forEach(function (pair) {
          var nm = pair.split(':'), l = tcPr ? kid(tcPr, nm[0]) : null;
          if (l && !kid(l, 'noFill')) {
            var c = colorOf(kid(l, 'solidFill'), ctx);
            if (c) borders += 'border-' + nm[1] + ':' + r2(Math.max(1, nu(l, 'w', 12700) * k)) + 'px solid ' + c.css + ';';
          }
        });
        var span = nu(tc, 'gridSpan', 1), rspan = nu(tc, 'rowSpan', 1);
        var tx = buildText(kid(tc, 'txBody'), [ctx.defaultTextStyle].filter(Boolean), ctx, { defColor: '#000000' });
        var tcStyle = 'position:relative;vertical-align:' + ({ ctr: 'middle', b: 'bottom' }[at(tcPr, 'anchor', 't')] || 'top') + ';' + bg + borders;
        var cellInner = tx.html.replace('position:absolute;left:0;top:0;right:0;bottom:0;', 'position:relative;').replace('display:flex;flex-direction:column;justify-content:flex-start;', '');
        html += '<td colspan="' + span + '" rowspan="' + rspan + '" style="' + tcStyle + 'padding:0;">' + cellInner + '</td>';
        if (tx.text) ctx.slideText.push(tx.text);
      });
      html += '</tr>';
    });
    html += '</table>';
    layers.push('<div style="' + b.css + '">' + html + '</div>');
  }

  async function renderTree(tree, T, ctx, part, layers, opts) {
    var children = kids(tree);
    for (var i = 0; i < children.length; i++) {
      var el = children[i], ln = el.localName;
      try {
        if (ln === 'sp') {
          if (opts && opts.skipPlaceholders && phInfo(el)) continue;
          renderSp(el, T, ctx, part, layers);
        } else if (ln === 'cxnSp') {
          renderSp(el, T, ctx, part, layers);
        } else if (ln === 'pic') {
          if (opts && opts.skipPlaceholders && phInfo(el)) continue;
          await renderPic(el, T, ctx, part, layers);
        } else if (ln === 'grpSp') {
          var gp = kid(el, 'grpSpPr');
          var gx = gp ? kid(gp, 'xfrm') : null;
          var nT = T;
          if (gx) {
            var off = kid(gx, 'off'), ext = kid(gx, 'ext'), co = kid(gx, 'chOff'), ce = kid(gx, 'chExt');
            var gw = nu(ext, 'cx', 1), gh = nu(ext, 'cy', 1);
            var cw = nu(ce, 'cx', gw) || gw, chh = nu(ce, 'cy', gh) || gh;
            var gsx = gw / cw, gsy = gh / chh;
            nT = {
              sx: T.sx * gsx, sy: T.sy * gsy,
              tx: T.tx + T.sx * (nu(off, 'x', 0) - nu(co, 'x', 0) * gsx),
              ty: T.ty + T.sy * (nu(off, 'y', 0) - nu(co, 'y', 0) * gsy)
            };
          }
          await renderTree(el, nT, ctx, part, layers, opts);
        } else if (ln === 'graphicFrame') {
          var gd = deep(el, 'graphicData');
          var uri = gd ? at(gd, 'uri', '') : '';
          if (/table/i.test(uri)) renderTable(el, T, ctx, part, layers);
          else ctx.warnings.push('Un objeto (' + (uri.split('/').pop() || 'grafico') + ') no se pudo copiar visualmente en la diapositiva ' + ctx.slideNo + '.');
        }
      } catch (e) {
        ctx.warnings.push('Una forma de la diapositiva ' + ctx.slideNo + ' no se pudo copiar: ' + (e && e.message));
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Fondo                                                               */
  /* ------------------------------------------------------------------ */
  function bgFill(cSld, ctx) {
    var bg = cSld ? kid(cSld, 'bg') : null;
    if (!bg) return null;
    var pr = kid(bg, 'bgPr');
    if (pr) return fillOfSpPr(pr, null, ctx);
    var ref = kid(bg, 'bgRef');
    if (ref) {
      var idx = nu(ref, 'idx', 1001);
      var pc = colorOf(ref, ctx);
      var saved = ctx.phClr;
      ctx.phClr = pc ? pc.hex.replace('#', '') : saved;
      var f = idx >= 1001 ? fillFromEl(ctx.theme.bgFills[idx - 1001], ctx) : fillFromEl(ctx.theme.fillStyles[idx - 1], ctx);
      ctx.phClr = saved;
      if (!f && pc) f = { type: 'solid', color: pc };
      return f;
    }
    return null;
  }

  async function collectImages(zip, rootEl, rels, cache, imgs) {
    var blips = deepAll(rootEl, 'blip');
    for (var i = 0; i < blips.length; i++) {
      var rid = blips[i].getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed') || blips[i].getAttribute('r:embed');
      if (!rid || imgs[rid] !== undefined) continue;
      var rel = rels[rid];
      imgs[rid] = (rel && !rel.external) ? await loadImage(zip, rel.target, cache) : '';
    }
  }

  /* ------------------------------------------------------------------ */
  /* Rasterizado                                                         */
  /* ------------------------------------------------------------------ */
  function serializeFragment(html) {
    var holder = document.createElement('div');
    holder.innerHTML = html;
    var ser = new XMLSerializer();
    var out = '';
    for (var n = holder.firstChild; n; n = n.nextSibling) out += ser.serializeToString(n);
    return out.replace(/ xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/g, '');
  }

  function loadSvgImage(svgText, useBlob) {
    return new Promise(function (resolve, reject) {
      var url, isBlob = !!useBlob;
      if (isBlob) {
        url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
      } else {
        url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
      }
      var img = new Image();
      img.onload = function () { resolve({ img: img, url: isBlob ? url : '' }); };
      img.onerror = function () { if (isBlob) URL.revokeObjectURL(url); reject(new Error('No se pudo rasterizar la diapositiva')); };
      img.src = url;
    });
  }

  function drawToJpeg(loaded, outW, outH) {
    var cv = document.createElement('canvas');
    cv.width = outW; cv.height = outH;
    var c2 = cv.getContext('2d');
    c2.fillStyle = '#ffffff';
    c2.fillRect(0, 0, outW, outH);
    c2.drawImage(loaded.img, 0, 0, outW, outH);
    return cv.toDataURL('image/jpeg', 0.9);
  }

  async function rasterize(innerHtml, W, H, outW, outH, bgCss) {
    var xhtml = serializeFragment(innerHtml);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + outW + '" height="' + outH + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<foreignObject x="0" y="0" width="' + W + '" height="' + H + '">' +
      '<div xmlns="' + NS_XHTML + '" style="position:relative;width:' + W + 'px;height:' + H + 'px;overflow:hidden;' + bgCss + '">' + xhtml + '</div>' +
      '</foreignObject></svg>';
    var loaded = await loadSvgImage(svg, false);
    try {
      return drawToJpeg(loaded, outW, outH);
    } catch (taint) {
      var loaded2 = await loadSvgImage(svg, true);
      try {
        return drawToJpeg(loaded2, outW, outH);
      } finally {
        if (loaded2.url) URL.revokeObjectURL(loaded2.url);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* API principal                                                       */
  /* ------------------------------------------------------------------ */
  async function renderDeck(arrayBuffer, options) {
    options = options || {};
    var onProgress = options.onProgress || function () {};
    var maxSide = options.maxSide || 2000;
    var zip = new MiniZip(arrayBuffer);

    var presXml = await zip.text('ppt/presentation.xml');
    if (!presXml) throw new Error('No es un archivo PowerPoint valido');
    var presDoc = parseXml(presXml);
    var presRels = parseRels(await zip.text('ppt/_rels/presentation.xml.rels'), 'ppt');
    var sz = deep(presDoc, 'sldSz');
    var cx = nu(sz, 'cx', 12192000), cy = nu(sz, 'cy', 6858000);
    var slideIds = deepAll(presDoc, 'sldId').map(function (s) { return s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || s.getAttribute('r:id'); });
    var slidePaths = slideIds.map(function (id) { return presRels[id] && presRels[id].target; }).filter(function (t) { return t && zip.has(t); });
    if (!slidePaths.length) {
      slidePaths = Object.keys(zip.entries).filter(function (n) { return /^ppt\/slides\/slide\d+\.xml$/.test(n); })
        .sort(function (a, b) { return parseInt(a.match(/slide(\d+)/)[1], 10) - parseInt(b.match(/slide(\d+)/)[1], 10); });
    }
    if (!slidePaths.length) throw new Error('El archivo no contiene diapositivas');

    var defTextEl = deep(presDoc, 'defaultTextStyle');
    var W = Math.round(cx / EMU_PER_PX), H = Math.round(cy / EMU_PER_PX);
    var scaleOut = maxSide / Math.max(W, H);
    var outW = Math.max(1, Math.round(W * scaleOut)), outH = Math.max(1, Math.round(H * scaleOut));

    var imgCache = {};
    var themeCache = {}, masterCache = {};
    var warnings = [];
    var result = { slides: [], width: outW, height: outH, warnings: warnings, deckTitle: '' };

    for (var si = 0; si < slidePaths.length; si++) {
      onProgress(si + 1, slidePaths.length);
      var sPath = slidePaths[si];
      var sDoc = parseXml(await zip.text(sPath));
      var sRels = await readRelsFor(zip, sPath);

      // Layout y master
      var layoutRel = Object.keys(sRels).map(function (id) { return sRels[id]; }).filter(function (r) { return /slideLayout$/.test(r.type); })[0];
      var lPath = layoutRel ? layoutRel.target : '';
      var lDoc = lPath ? parseXml(await zip.text(lPath)) : null;
      var lRels = lPath ? await readRelsFor(zip, lPath) : {};
      var masterRel = Object.keys(lRels).map(function (id) { return lRels[id]; }).filter(function (r) { return /slideMaster$/.test(r.type); })[0];
      var mPath = masterRel ? masterRel.target : '';
      var mEntry = masterCache[mPath];
      if (!mEntry && mPath) {
        var mDoc = parseXml(await zip.text(mPath));
        var mRels = await readRelsFor(zip, mPath);
        var themeRel = Object.keys(mRels).map(function (id) { return mRels[id]; }).filter(function (r) { return /theme$/.test(r.type); })[0];
        var theme = themeRel ? (themeCache[themeRel.target] || (themeCache[themeRel.target] = parseTheme(await zip.text(themeRel.target)))) : parseTheme('');
        var cm = deep(mDoc, 'clrMap');
        var clrMap = {};
        if (cm) for (var ai = 0; ai < cm.attributes.length; ai++) clrMap[cm.attributes[ai].name] = cm.attributes[ai].value;
        var ts = deep(mDoc, 'txStyles');
        mEntry = {
          doc: mDoc, rels: mRels, theme: theme, clrMap: clrMap,
          styles: {
            title: ts ? kid(ts, 'titleStyle') : null,
            body: ts ? kid(ts, 'bodyStyle') : null,
            other: ts ? kid(ts, 'otherStyle') : null
          }
        };
        masterCache[mPath] = mEntry;
      }
      if (!mEntry) {
        mEntry = { doc: parseXml('<x/>'), rels: {}, theme: parseTheme(''), clrMap: {}, styles: {} };
      }

      var ctx = {
        zip: zip, theme: mEntry.theme, clrMap: mEntry.clrMap, k: 1 / EMU_PER_PX,
        masterStyles: mEntry.styles, defaultTextStyle: defTextEl, phClr: null,
        warnings: warnings, slideNo: si + 1, slideTitle: '', slideText: [], defTextColor: '#000000'
      };
      var dk = mEntry.theme.colors[(mEntry.clrMap.tx1 || 'dk1')] || '000000';
      ctx.defTextColor = '#' + dk;

      var sCsld = deep(sDoc, 'cSld'), lCsld = lDoc ? deep(lDoc, 'cSld') : null, mCsld = deep(mEntry.doc, 'cSld');
      var sTree = sCsld ? kid(sCsld, 'spTree') : null;
      var lTree = lCsld ? kid(lCsld, 'spTree') : null;
      var mTree = mCsld ? kid(mCsld, 'spTree') : null;

      // Imagenes de cada parte
      var sImgs = {}, lImgs = {}, mImgs = (mEntry.imgs = mEntry.imgs || {});
      await collectImages(zip, sDoc, sRels, imgCache, sImgs);
      if (lDoc) await collectImages(zip, lDoc, lRels, imgCache, lImgs);
      await collectImages(zip, mEntry.doc, mEntry.rels, imgCache, mImgs);

      var T0 = { sx: 1, sy: 1, tx: 0, ty: 0 };
      var layers = [];

      // Fondo
      var fSlide = bgFill(sCsld, Object.assign({}, ctx));
      var bgPart = { imgs: sImgs };
      var bg = fSlide;
      if (!bg && lCsld && bgFill(lCsld, ctx)) { bg = bgFill(lCsld, ctx); bgPart = { imgs: lImgs }; }
      if (!bg) { bg = bgFill(mCsld, ctx); bgPart = { imgs: mImgs }; }
      var bgCss = 'background:#ffffff;';
      if (bg) {
        if (bg.type === 'blip') {
          var burl = bgPart.imgs[bg.rid];
          if (burl) bgCss = 'background:#ffffff url(' + burl + ') center/100% 100% no-repeat;';
        } else if (bg.type === 'solid' || bg.type === 'grad') {
          bgCss = cssFillProps(bg, bgPart);
        }
      }

      var slideEl = sDoc.documentElement;
      var showMasterOnSlide = at(slideEl, 'showMasterSp', '1') !== '0';
      var layoutShowMaster = lDoc ? at(lDoc.documentElement, 'showMasterSp', '1') !== '0' : true;

      var mPart = { imgs: mImgs, layoutTree: null, masterTree: mTree };
      var lPart = { imgs: lImgs, layoutTree: lTree, masterTree: mTree };
      var sPart = { imgs: sImgs, layoutTree: lTree, masterTree: mTree };

      var savedSlideText = ctx.slideText;
      ctx.slideText = [];
      if (showMasterOnSlide && layoutShowMaster && mTree) await renderTree(mTree, T0, ctx, mPart, layers, { skipPlaceholders: true });
      if (showMasterOnSlide && lTree) await renderTree(lTree, T0, ctx, lPart, layers, { skipPlaceholders: true });
      ctx.slideText = savedSlideText;
      ctx.slideTitle = '';
      if (sTree) await renderTree(sTree, T0, ctx, sPart, layers, null);

      // Notas del docente
      var notes = '';
      var notesRel = Object.keys(sRels).map(function (id) { return sRels[id]; }).filter(function (r) { return /notesSlide$/.test(r.type); })[0];
      if (notesRel && zip.has(notesRel.target)) {
        try {
          var nDoc = parseXml(await zip.text(notesRel.target));
          var notesParts = [];
          deepAll(nDoc, 'sp').forEach(function (sp) {
            var ph = phInfo(sp);
            if (ph && ph.type === 'body') {
              kids(kid(sp, 'txBody'), 'p').forEach(function (p) {
                var t = deepAll(p, 't').map(function (x) { return x.textContent; }).join('');
                if (t.trim()) notesParts.push(t.trim());
              });
            }
          });
          notes = notesParts.join('\n');
        } catch (e) { /* sin notas */ }
      }

      var dataUrl = await rasterize(layers.join(''), W, H, outW, outH, bgCss);
      result.slides.push({
        dataUrl: dataUrl, width: outW, height: outH,
        title: ctx.slideTitle || '', notes: notes, text: ctx.slideText.join('\n')
      });
      if (si === 0 && ctx.slideTitle) result.deckTitle = ctx.slideTitle;
    }
    return result;
  }

  global.PptxFaithful = { renderDeck: renderDeck, version: '1.0' };
})(typeof window !== 'undefined' ? window : this);
