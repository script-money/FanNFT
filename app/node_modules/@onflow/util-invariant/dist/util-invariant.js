exports.invariant=function(n,t){if(!n){var r,a=new Error("INVARIANT "+t);throw a.stack=a.stack.split("\n").filter(function(n){return!/at invariant/.test(n)}).join("\n"),(r=console).error.apply(r,["\n\n---\n\n",a,"\n\n"].concat([].slice.call(arguments,2),["\n\n---\n\n"])),a}};
//# sourceMappingURL=util-invariant.js.map
