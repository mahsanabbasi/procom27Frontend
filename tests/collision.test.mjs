import test from 'node:test';
import assert from 'node:assert/strict';
import { collisionPlacement, contactRow } from '../src/components/initialization/collision.js';
test('native sprite bounds touch the stationary mark without penetration at all viewport widths',()=>{
 for(const width of [320,390,768,1024,1440]) {const mark={left:width/2-55,top:120,width:110,height:150};const dino={width:width<1024?80:120,height:86};const p=collisionPlacement(dino,mark,{dpr:2});assert.equal(p.contact+dino.width,mark.left);assert.equal(p.approach+dino.width,mark.left-.5);assert.equal(p.top,mark.top);assert.equal(p.start+dino.width,0);}
});
test('collision tracks resized measured bounds instead of a fixed coordinate',()=>{const a=collisionPlacement({width:80},{left:150,top:40},{dpr:1});const b=collisionPlacement({width:120},{left:600,top:90},{dpr:1});assert.equal(a.contact,70);assert.equal(b.contact,480);});
test('effect origin selects a shared opaque silhouette row',()=>{const dino={top:100,height:43};const mark={top:100,height:30};assert.equal(contactRow([0,40,...Array(41).fill(20)],[0,0,...Array(28).fill(5)],dino,mark),101.5);});
