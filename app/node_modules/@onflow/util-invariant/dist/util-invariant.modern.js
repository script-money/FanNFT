function n(n,t,...r){if(!n){const n=new Error("INVARIANT "+t);throw n.stack=n.stack.split("\n").filter(n=>!/at invariant/.test(n)).join("\n"),console.error("\n\n---\n\n",n,"\n\n",...r,"\n\n---\n\n"),n}}export{n as invariant};
//# sourceMappingURL=util-invariant.modern.js.map
