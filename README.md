# Forma — Calculadora científica

Interface minimalista responsiva em português, com temas claro e escuro. HTML, CSS e JavaScript puros, sem dependências, analytics ou serviços externos.

## Recursos
- Operações, parênteses, potências, raízes, fatorial, porcentagem e multiplicação implícita.
- Trigonometria em graus/radianos, funções inversas e hiperbólicas.
- Logaritmos, constantes π/e, notação científica, resposta anterior e memória.
- Prévia de resultados, histórico local (50 cálculos), cópia e teclado.
- Parser próprio sem eval ou Function; mensagens de erro para operações inválidas.

## Executar
`npm start` (requer Python 3), depois abra http://localhost:8080.

## Testar
`npm test` (Node.js 18+).

## GitHub Pages
Publicado diretamente da raiz da branch `main`. Em Settings → Pages, selecione Deploy from a branch → main → / (root).

## Convenções
`10%` significa `10/100`. `-2^2` é `-4`. Potências associam à direita. Fatoriais aceitam inteiros de 0 a 170. Use `log(x)` para base 10 e `ln(x)/ln(b)` para base b. Todos os cálculos usam números reais IEEE 754; exibição arredondada a 12 algarismos significativos. Memória e Ans duram a sessão; histórico e tema ficam no navegador. Nenhum dado é enviado a servidores.
