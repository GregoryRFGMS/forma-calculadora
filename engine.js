// Recursive-descent expression parser. Never executes user-supplied JavaScript.
export function calculate(source, {mode='DEG',ans=0,memory=0}={}) {
 const text=source.replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-').replaceAll(',','.').replaceAll('π','pi');
 if(text.length>2000) throw Error('Expressão muito longa.');
 const tokens=text.match(/(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?|[a-zA-Z]+|[+\-*/^()!%]/g)||[];
 if(tokens.join('')!==text.replace(/\s/g,'')) throw Error('Caractere não reconhecido.');
 let i=0; const peek=()=>tokens[i]; const take=()=>tokens[i++];
 const finite=x=>{if(!Number.isFinite(x))throw Error('Resultado fora do domínio real ou do limite numérico.');return x;};
 const fact=x=>{if(x<0||!Number.isInteger(x)||x>170)throw Error('Fatorial exige inteiro de 0 a 170.');let r=1;for(let j=2;j<=x;j++)r*=j;return r;};
 const angle=x=>mode==='DEG'?x*Math.PI/180:x;
 const inverse=x=>mode==='DEG'?x*180/Math.PI:x;
 const functions={sin:x=>Math.sin(angle(x)),cos:x=>Math.cos(angle(x)),tan:x=>{if(Math.abs(Math.cos(angle(x)))<1e-14)throw Error('Tangente indefinida nesse ângulo.');return Math.tan(angle(x));},asin:x=>inverse(Math.asin(x)),acos:x=>inverse(Math.acos(x)),atan:x=>inverse(Math.atan(x)),sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,asinh:Math.asinh,acosh:Math.acosh,atanh:Math.atanh,ln:Math.log,log:Math.log10,sqrt:Math.sqrt,cbrt:Math.cbrt,abs:Math.abs,exp:Math.exp};
 function atom(){const t=take();let v;if(t==='('){v=sum();if(take()!==')')throw Error('Feche os parênteses.');}else if(/^(?:\d|\.)/.test(t||''))v=Number(t);else if(['pi','e','Ans','M'].includes(t))v={pi:Math.PI,e:Math.E,Ans:ans,M:memory}[t];else if(Object.hasOwn(functions,t||'')){if(take()!=='(')throw Error('Use parênteses na função.');v=functions[t](sum());if(take()!==')')throw Error('Feche os parênteses.');}else throw Error('Complete a expressão.');while(peek()==='!'||peek()==='%'){v=take()==='!'?fact(v):v/100;}return finite(v);}
 function power(){let v=atom();if(peek()==='^'){take();v=Math.pow(v,unary());}return finite(v);}
 function unary(){if(peek()==='+'){take();return unary();}if(peek()==='-'){take();return -unary();}return power();}
 function product(){let v=unary();while(true){const t=peek();if(t==='*'||t==='/'){take();const r=unary();if(t==='/'&&r===0)throw Error('Não é possível dividir por zero.');v=t==='*'?v*r:v/r;}else if(t==='('||/^(?:[a-zA-Z]|\d|\.)/.test(t||'')){v*=unary();}else break;}return finite(v);}
 function sum(){let v=product();while(peek()==='+'||peek()==='-'){const t=take(),r=product();v=t==='+'?v+r:v-r;}return finite(v);}
 if(!tokens.length)throw Error('Digite uma expressão.');const result=sum();if(i!==tokens.length)throw Error('Verifique a expressão e os parênteses.');return Object.is(result,-0)?0:result;
}
