# Forma — Calculadora científica

Aplicação de Matemática Computacional em **HTML, CSS e JavaScript**, com módulos de Funções, Matrizes, Análise Combinatória e Conversão de Bases. Sem dependências de execução, frameworks, serviços externos ou uso de `eval`.

**Site:** https://gregoryrfgms.github.io/forma-calculadora/

## Executar e testar

- `npm start` — serve o projeto em http://localhost:8080 (requer Python 3).
- `npm test` — executa 104 testes com o runner nativo do Node.js 18+.
- Não há dependências para instalar. Sirva por HTTP: módulos JavaScript não devem ser abertos por `file://`.
- GitHub Pages publica a raiz de `main`: Settings → Pages → Deploy from a branch → main → / (root).

## Funcionalidades

| Módulo             | Operações                                                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calculadora        | +, −, ×, ÷, parênteses, decimais, ±, apagar caractere, AC e CE; potências, raízes, logaritmos, trigonometria e inversas, hiperbólicas, porcentagem, memória e Ans |
| Funções            | Avaliação de f(x), tabela de valores em intervalo com passo, indicação individual de pontos fora do domínio real                                                  |
| Matrizes           | Soma, subtração, multiplicação por escalar, produto matricial, transposta e determinante de ordem 1 a 10                                                          |
| Combinatória       | Fatorial com BigInt, permutação simples e com repetição, arranjo e combinação com validação de n e k                                                              |
| Diferencial: bases | Conversão exata de inteiros entre binário, octal, decimal e hexadecimal                                                                                           |
| Interface          | Português, layout responsivo, temas claro e escuro, rótulos acessíveis, suporte ao teclado e histórico local                                                      |

**Diferencial acadêmico:** Conversão de Bases está implementado. O grupo deve verificar disponibilidade e registrar essa escolha com o professor; sua exclusividade ainda não foi confirmada.

## Organização do código

Os arquivos permanecem na raiz para facilitar o deploy estático e a leitura, com responsabilidades separadas:

| Arquivo            | Responsabilidade                                          |
| ------------------ | --------------------------------------------------------- |
| `index.html`       | Estrutura semântica e formulários dos cinco módulos       |
| `style.css`        | Tema, componentes e adaptações responsivas                |
| `engine.js`        | Parser, árvore de expressões e avaliação matemática       |
| `app.js`           | Eventos, memória, tema e histórico da calculadora         |
| `functions.js`     | Avaliação de f(x) e geração de tabelas                    |
| `matrices.js`      | Operações matriciais e eliminação gaussiana               |
| `combinatorics.js` | Contagens exatas usando BigInt                            |
| `bases.js`         | Conversão entre bases com BigInt                          |
| `modules-ui.js`    | Navegação, validação de campos e apresentação dos módulos |
| `engine.test.js`   | 33 testes do motor da calculadora                         |
| `modules.test.js`  | 71 testes adicionais, incluindo exemplos das orientações  |

O código é formatado com Prettier, sem minificação. Os algoritmos e suas decisões estão comentados em português.

## Algoritmos e convenções

### Expressões e funções

O parser por descida recursiva cria uma árvore de sintaxe, sem executar JavaScript digitado. A precedência é: parênteses/funções, pós-fixos (`!`, `%`), potência, sinal unário, multiplicação/divisão e soma/subtração. Potências associam à direita: `2^3^2 = 512`. `-2^2 = -4` e `(-2)^2 = 4`.

Aceita `x`, `π`/`pi`, `e`, `Ans`, `M`, `sen`/`sin`, `tg`/`tan`, `raiz`/`sqrt`, expoentes `²` e `³`, ponto ou vírgula decimal. Exemplos: `2x²+3x−1`, `2(x+1)`, `sin(x)`, `1e-6`. Escreva multiplicação explicitamente entre nomes adjacentes: `x*pi`, não `xpi`.

A tabela compila a expressão uma vez e a avalia em cada ponto. Erros de sintaxe interrompem a geração; erros de domínio aparecem na linha correspondente e preservam as outras linhas. O passo parte do início; o fim só aparece se for alcançado pelo passo (sujeito à precisão numérica).

`10%` significa `10/100`; um acréscimo de 10% é `200*(1+10%)`. `log` usa base 10, `ln` usa base e; outras bases: `ln(x)/ln(b)`. DEG interpreta graus, RAD interpreta radianos. CE remove o último token antes do cursor ou a seleção; AC limpa a expressão, preservando memória e histórico.

### Matrizes

Soma/subtração exigem ordens iguais. No produto A×B, o número de colunas de A deve ser igual ao número de linhas de B. O determinante exige matriz quadrada e usa eliminação gaussiana com pivoteamento parcial, em O(n³). Cada troca de linhas inverte o sinal; o produto dos pivôs fornece o determinante. As funções não modificam suas entradas.

### Combinatória

- Fatorial e permutação simples: produto inteiro de 1 a n; `0! = 1`.
- Permutação com repetição: `n! / (a! b! …)`, com grupos somando n; inclua grupos unitários.
- Arranjo: produto dos k fatores decrescentes a partir de n.
- Combinação: produto incremental com divisão exata, usando a simetria `C(n,k) = C(n,n-k)`.

Todos os resultados desse módulo são BigInt; nunca são convertidos para Number para exibição. Exemplo: `20! = 2432902008176640000` permanece exato.

### Bases

A entrada é acumulada dígito por dígito: `valor = valor × base + dígito`, usando BigInt. A representação de saída usa a base desejada. Inteiros negativos são mostrados com sinal, não em complemento de dois.

## Limites explícitos

- Expressões: até 2.000 caracteres; números reais IEEE 754; exibição com até 12 algarismos significativos.
- Funções: até 501 pontos por tabela; passo finito e positivo; início ≤ fim.
- Matrizes: 1–10 linhas/colunas. Números de ponto flutuante; matrizes mal condicionadas podem acumular erro numérico.
- Combinatória: n e k inteiros de 0 a 5.000; k ≤ n. O limite evita travar a interface com cálculos excessivos.
- Fatorial na calculadora geral: até 170; resultados exatos maiores estão no módulo Combinatória.
- Bases: inteiros com até 1.024 dígitos de entrada, sem frações, prefixos (`0x`, `0b`) ou separadores.
- Histórico: até 50 cálculos, salvo no navegador, assim como o tema. Memória e Ans duram a sessão. Nenhum cálculo é enviado a servidores.

## Casos para demonstração

| Ação                                            | Resultado esperado                          |
| ----------------------------------------------- | ------------------------------------------- |
| Calculadora: `2+3*4`                            | 14                                          |
| Calculadora: `1/0`                              | Erro de divisão por zero                    |
| Funções: `x²−4`, x=3                            | 5                                           |
| Tabela: `x²−4`, início −2, fim 2, passo 1       | 0, −3, −4, −3, 0                            |
| Tabela: `sqrt(x)`, início −1, fim 1             | Erro de domínio apenas em −1                |
| Matrizes: A=[[1,2],[3,4]], B=[[5,6],[7,8]], A×B | [[19,22],[43,50]]                           |
| Determinante de A                               | −2                                          |
| C(10,3), P(5), A(5,3)                           | 120, 120, 60                                |
| Permutação de ARARA: n=5, grupos 3,2            | 10                                          |
| Fatorial de 200                                 | Inteiro exato com 375 dígitos               |
| Decimal 255                                     | Binário 11111111, octal 377, hexadecimal FF |

## Pendências do trabalho acadêmico

O software cobre os módulos obrigatórios descritos nas orientações fornecidas e implementa um diferencial proposto. Isso não substitui os entregáveis e responsabilidades do grupo:

- Registrar o grupo, wireframes e o diferencial, confirmando sua disponibilidade.
- Registrar contribuições reais de todos os integrantes no Git (não atribuir contribuições fictícias).
- Produzir o relatório técnico de 5–10 páginas, com decisões, algoritmos, dificuldades reais e divisão de tarefas.
- Preparar a apresentação de 10–15 minutos e a demonstração ao vivo.
- Estudar e entender o código para defendê-lo. Foi desenvolvido com apoio de IA, permitido nas orientações mediante compreensão pelo grupo.

Gráfico de funções, matriz inversa e sistemas lineares são opcionais nas orientações e não fazem parte desta versão.
