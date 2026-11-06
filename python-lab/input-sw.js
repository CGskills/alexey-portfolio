// A local rendezvous only: no caching, remote requests or persisted answers.
const channels = new Map();
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'input-open' && event.source?.type === 'window') {
    channels.set(data.channel, {owner:event.source.id, requests:new Map()});
    event.ports[0]?.postMessage({ready:true});
    return;
  }
  const channel = channels.get(data.channel);
  if (!channel || channel.owner !== event.source?.id) return;
  if (data.type === 'input-close') {
    for (const entry of channel.requests.values()) entry.resolve?.({cancelled:true});
    channels.delete(data.channel);
  } else if (data.type === 'input-answer') {
    const entry = channel.requests.get(data.request) || {};
    entry.answer = {value:String(data.value).slice(0,10000)};
    channel.requests.set(data.request,entry);
    entry.resolve?.(entry.answer);
  }
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname !== new URL('./__python_input__',self.location).pathname) return;
  event.respondWith((async () => {
    const {channel:token,request} = await event.request.json();
    const channel = channels.get(token);
    if (!channel) return Response.json({cancelled:true});
    const entry = channel.requests.get(request) || {};
    channel.requests.set(request,entry);
    if (entry.answer) { channel.requests.delete(request); return Response.json(entry.answer); }
    const answer = await new Promise(resolve => {
      const timer = setTimeout(() => {entry.resolve=null;resolve({waiting:true});},15000);
      entry.resolve = value => {clearTimeout(timer);entry.resolve=null;resolve(value);};
    });
    if (!answer.waiting) channel.requests.delete(request);
    return Response.json(answer,{headers:{'Cache-Control':'no-store'}});
  })());
});

