import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitializationController, criticalFontsAvailable, CRITICAL_FONTS, criticalFontsTransferred } from '../src/components/initialization/initialization.js';
const wait = ms => new Promise(resolve => setTimeout(resolve,ms));
const readyFonts = () => ({ *[Symbol.iterator]() { yield {family:'Press Start 2P'}; yield {family:'Space Grotesk'}; },check:()=>true, load:async()=>[{}] });
test('current-document ready faces bypass initialization synchronously',()=>{const c=createInitializationController({fonts:readyFonts()});assert.equal(c.getSnapshot(),'ready');c.dispose();});
test('unregistered fallback matches are not proof of available custom fonts',async()=>{const fonts={*[Symbol.iterator](){},check:()=>true};assert.equal(criticalFontsAvailable(fonts),false);const c=createInitializationController({fonts});await wait(5);assert.equal(c.getSnapshot(),'fallback');c.dispose();});
test('cold document starts all critical faces concurrently and waits for readiness',async()=>{let ready=false,finish;const calls=[];const pending=new Promise(resolve=>finish=resolve);const fonts={...readyFonts(),check:()=>ready,load:font=>{calls.push(font);return pending.then(()=>[{}]);}};const c=createInitializationController({fonts});assert.equal(c.getSnapshot(),'pending');assert.deepEqual(calls,CRITICAL_FONTS);ready=true;finish();await wait(5);assert.equal(c.getSnapshot(),'ready');c.dispose();});
test('a cached resource with unloaded current-document faces still needs initialization',async()=>{const fonts={...readyFonts(),check:()=>false,load:()=>new Promise(()=>{})};const c=createInitializationController({fonts,timeout:8});assert.equal(c.getSnapshot(),'pending');await wait(15);assert.equal(c.getSnapshot(),'fallback');c.dispose();});
test('rejected critical faces fail open',async()=>{const fonts={...readyFonts(),check:()=>false,load:()=>Promise.reject(Error('network'))};const c=createInitializationController({fonts});await wait(5);assert.equal(c.getSnapshot(),'fallback');c.dispose();});
test('fallback is terminal even if a late font becomes ready',async()=>{let finish;const fonts={...readyFonts(),check:()=>false,load:()=>new Promise(resolve=>finish=resolve)};const c=createInitializationController({fonts,timeout:5});await wait(10);finish([{}]);await wait(5);assert.equal(c.getSnapshot(),'fallback');c.dispose();});
test('does not wait for the entire FontFaceSet or noncritical resources',async()=>{const fonts={...readyFonts(),ready:new Promise(()=>{})};const c=createInitializationController({fonts});assert.equal(c.getSnapshot(),'ready');c.dispose();});
test('disposing releases listeners and the fallback timer',async()=>{const fonts={...readyFonts(),check:()=>false,load:()=>new Promise(()=>{})};const c=createInitializationController({fonts,timeout:5});let calls=0;c.subscribe(()=>calls++);c.dispose();await wait(10);assert.equal(calls,0);});

test('finished cold preloads retain intro intent even when fonts are ready before React',()=>{
 const c=createInitializationController({fonts:readyFonts(),transferred:true});
 assert.equal(c.getSnapshot(),'ready');assert.equal(c.requiresIntro,true);c.dispose();
});
test('ready cached preloads skip the intro',()=>{
 const c=createInitializationController({fonts:readyFonts(),transferred:false});
 assert.equal(c.requiresIntro,false);c.dispose();
});
test('resource timing accepts only actual same-origin critical font transfers',()=>{
 const origin='http://localhost:3003';
 const entry={name:origin+'/fonts/press-start-2p-latin.woff2',transferSize:12812,encodedBodySize:12512};
 const timing=e=>({getEntriesByType:()=>e});
 assert.equal(criticalFontsTransferred(timing([entry]),origin),true);
 for(const patch of [{transferSize:0},{transferSize:300},{deliveryType:'cache'},{encodedBodySize:0},{name:origin+'/other.woff2'},{name:'https://other.test/fonts/press-start-2p-latin.woff2'},{name:'invalid'}])
  assert.equal(criticalFontsTransferred(timing([{...entry,...patch}]),origin),false);
 assert.equal(criticalFontsTransferred({},origin),false);
});

test('cache-backed pending fonts that settle before mount do not leave stale intro intent',async()=>{
 let ready=false;
 const fonts={...readyFonts(),check:()=>ready,load:async()=>{ready=true;return [{}];}};
 const c=createInitializationController({fonts,transferred:false});
 await wait(5);assert.equal(c.getSnapshot(),'ready');assert.equal(c.requiresIntro,false);c.dispose();
});
