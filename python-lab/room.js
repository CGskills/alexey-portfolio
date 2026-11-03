export function room(decor=[]) { return `<svg class="room-art" viewBox="0 0 650 380" role="img" aria-label="Уютный рабочий стол у вечернего окна: ноутбук, книги, чашка и тёплый свет">
<defs>
 <linearGradient id="wall" x2="1" y2="1"><stop stop-color="#f0e3d1"/><stop offset="1" stop-color="#dfd9c9"/></linearGradient>
 <linearGradient id="night" x2="0" y2="1"><stop stop-color="#586976"/><stop offset="1" stop-color="#b4a6a0"/></linearGradient>
 <linearGradient id="wood" x2="1" y2="1"><stop stop-color="#c9956f"/><stop offset="1" stop-color="#a67355"/></linearGradient>
 <radialGradient id="glow"><stop stop-color="#ffde8a" stop-opacity=".6"/><stop offset="1" stop-color="#ffdf9a" stop-opacity="0"/></radialGradient>
 <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#594635" flood-opacity=".14"/></filter>
 <clipPath id="windowClip"><rect x="331" y="33" width="174" height="184" rx="64"/></clipPath>
</defs>
<g class="room-back">
 <path d="M83 83 Q83 61 106 54 L388 8 Q412 5 431 14 L589 92 Q609 103 609 124 L609 287 L285 359 L66 261Z" fill="url(#wall)"/>
 <path d="M83 249 388 199 609 287 285 359 66 277Z" fill="#d5c4ac"/>
 <path d="M388 9V199L609 287" fill="none" stroke="#cdbda5" stroke-opacity=".6"/>
 <g transform="translate(18 0)">
  <rect x="321" y="23" width="194" height="204" rx="73" fill="#bba287"/>
  <rect x="327" y="29" width="182" height="192" rx="68" fill="#f7eddb"/>
  <rect x="333" y="35" width="170" height="180" rx="62" fill="url(#night)"/>
  <g clip-path="url(#windowClip)">
   <circle cx="456" cy="77" r="16" fill="#f9e8b9"/>
   <path d="M328 174 354 145 381 170 402 145 435 177 463 135 503 171V220H328Z" fill="#777c80"/>
   <path d="M328 193 365 183 389 194 415 176 437 186 470 170 510 192V230H328Z" fill="#576971"/>
   <g stroke="#e7d5be" stroke-width="3" opacity=".7"><path d="M350 186v6m10-8v6m28 14v6m49-23v6m9-8v6m32-4v6"/></g>
   <g class="rain-lines" stroke="#e1e5dc" stroke-opacity=".3" stroke-width="1.2"><path d="M350 51l-5 18m30 2-5 18m30-48-5 18m28 41-5 18m52-81-5 18m17 60-5 18m-124-17-5 18m38 5-5 18m41-32-5 18m39 27-5 18"/></g>
  </g>
  <path d="M417 35V215M333 128H503" stroke="#f2e3cd" stroke-width="7"/>
  <path d="M314 221H522L532 230H305Z" fill="#aa8664"/>
 </g>
 <g transform="translate(112 69) rotate(-9)">
  <rect width="134" height="8" y="54" rx="2" fill="#a88060"/>
  <path d="M13 64V77M118 64V77" stroke="#856a50" stroke-width="3"/>
  <rect x="12" y="8" width="15" height="46" rx="2" fill="#7c8c75"/><rect x="29" y="2" width="12" height="52" rx="2" fill="#c18b71"/><rect x="43" y="16" width="16" height="38" rx="2" fill="#d2b986"/>
  <rect x="66" y="8" width="12" height="46" rx="2" transform="rotate(-12 78 54)" fill="#a0a8a6"/>
  <path d="M15 17H24M32 11H38M46 24H55" stroke="#eee3cc" stroke-width="2"/>
  <path d="M102 34Q92 14 104 5Q114 20 105 33M106 30Q115 10 124 17Q127 29 106 37" fill="#6e8561"/>
  <path d="M91 32H120L116 53H95Z" fill="#c88664"/>
 </g>
 <g transform="translate(150 161) rotate(-9)"><rect width="58" height="63" rx="2" fill="#fcf2df"/><rect x="5" y="6" width="48" height="51" fill="#e6ccae"/><path d="M11 45L23 26L33 38L43 20L49 45Z" fill="#78927f"/><circle cx="19" cy="18" r="5" fill="#e5a469"/></g>
</g>
<g class="room-mid" filter="url(#shadow)">
 <ellipse cx="349" cy="308" rx="190" ry="35" fill="#a28c75" opacity=".14"/>
 <path d="M176 251L185 326L199 329L200 256M492 221L489 296L502 299L513 229" fill="#8a624d"/>
 <path d="M156 221L411 172L536 220L279 280L155 234Z" fill="#9e6f50"/>
 <path d="M156 221L411 172L536 220L279 267Z" fill="url(#wood)"/>
 <path d="M180 222L411 182M280 254L509 219" stroke="#e4b893" opacity=".4"/>
 <g class="desk-lamp">
  <ellipse cx="439" cy="206" rx="30" ry="8" fill="#586d58"/><path d="M439 204L438 138L416 106" stroke="#647c60" stroke-width="7" stroke-linecap="round"/>
  <path d="M397 89Q419 79 429 100L440 122L389 133Z" fill="#6d8565"/>
  <ellipse cx="415" cy="128" rx="26" ry="7" transform="rotate(-12 415 128)" fill="#f4d89d"/>
  <ellipse class="lamp-glow" cx="397" cy="184" rx="95" ry="65" fill="url(#glow)"/>
 </g>
 <g class="laptop"><path d="M250 220L231 139Q230 133 238 132L327 117Q334 116 336 123L355 205Z" fill="#3e514b"/>
  <path d="M243 141L327 127L343 200L259 215Z" fill="#263a36"/>
  <g stroke-width="3" stroke-linecap="round"><path d="M258 154l20-3m-18 11 43-7m-40 15 17-3m6-1 24-4m-43 16 36-7m-32 15 17-4" stroke="#b6cba7"/><path d="M288 149l20-3m-32 39 27-5" stroke="#d3aa77"/><path class="code-cursor" d="M275 193l7-1" stroke="#f2dbb6"/></g>
  <path d="M250 220L355 200L393 220L283 246Z" fill="#97a497"/><path d="M262 220L351 203L376 217L285 238Z" fill="#75897d"/>
  <path d="M275 221L350 207M280 227L357 212M289 232L365 217" stroke="#b3bdae" stroke-width="2"/><path d="M308 233L332 227L342 232L317 238Z" fill="#b5bdac"/>
 </g>
 <g class="tea"><ellipse cx="225" cy="238" rx="22" ry="7" fill="#e8d5b7"/><path d="M209 215H237V230Q234 241 216 236Z" fill="#f4e8d0"/><path d="M237 218C252 214 251 232 238 230" fill="none" stroke="#e5d4b5" stroke-width="5"/><ellipse cx="223" cy="215" rx="14" ry="5" fill="#ad7752"/>
  <path class="steam steam-a" d="M221 204Q211 196 221 187Q228 181 222 175" fill="none" stroke="#fff7e9" stroke-width="3" opacity=".65"/>
  <path class="steam steam-b" d="M230 202Q220 194 230 185" fill="none" stroke="#fff7e9" stroke-width="2" opacity=".5"/>
 </g>
 <g transform="translate(393 233) rotate(-12)"><rect width="63" height="8" rx="2" fill="#4f6a58"/><rect x="2" y="-9" width="59" height="9" rx="2" fill="#dfceb0"/><rect x="1" y="-13" width="61" height="4" fill="#c0805e"/><path d="M12 -7H52" stroke="#b1a28d"/></g>
</g>
<g class="room-front">
 <path d="M314 280L317 328L330 334L332 281" fill="#a98162"/><path d="M292 262Q277 252 284 232L295 218Q299 213 309 217L350 238Q360 244 353 256L347 279Q339 290 328 285Z" fill="#be8a63"/><path d="M293 238L343 260" stroke="#d6a17a" stroke-width="3"/>
 <g class="room-plant" transform="translate(552 241) ${decor.includes('plant')?'scale(1.15)':''}"><path d="M-7 7C-40-10-29-35-21-34C-7-33-8-9-7 7M-4 8C-3-23 13-39 20-29C31-15 6-1-4 8M-5 5C-24-34-13-55-5-50C8-46 2-19-5 5M-2 5C20-11 33-5 27 5C20 17 9 14-2 5" fill="#6a805b"/>
  <path d="M-24 12H18L11 53H-16Z" fill="#b87353"/><ellipse cx="-3" cy="12" rx="21" ry="6" fill="#91644c"/><path d="M-3 15V-32" stroke="#516e51" stroke-width="3"/>
 </g>
 ${decor.includes('cat')?'<g class="sleepy-cat" transform="translate(449 280)"><ellipse cx="0" cy="9" rx="33" ry="19" fill="#ca9570"/><circle cx="-23" cy="1" r="16" fill="#d8a37a"/><path d="M-36-6l2-14 12 11m7 0 10-9 2 17" fill="#d8a37a"/><path d="M-31 0q4 5 8 0m34 16q40 3 26-15" fill="none" stroke="#9d6d50" stroke-width="4" stroke-linecap="round"/></g>':''}
</g>
</svg>`; }
