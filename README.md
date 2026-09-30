# Mudae Embed Color

Gera automaticamente os comandos `$embedcolor` para os personagens do Mudae que têm chave mas ainda não têm cor atribuída.

O script lê a lista que o próprio bot te envia, baixa a imagem de cada personagem, calcula a cor mais predominante/chamativa e devolve os comandos prontos. Depois, um script de AutoHotkey cola e envia cada comando no Discord com uma tecla.

## Como funciona

```
$mmsyi-c-  →  input.txt  →  cor.mjs  →  comandos.txt  →  mudae.ahk (F8)  →  Discord
```

## Requisitos

- [Node.js](https://nodejs.org) 18 ou superior (usa `fetch` nativo)
- [AutoHotkey v2](https://www.autohotkey.com)
- Discord (app desktop)

## Instalação

Na pasta do projeto:

```bash
npm i sharp
```

Arquivos esperados na mesma pasta:

| Arquivo        | Função                                                  |
| -------------- | ------------------------------------------------------- |
| `cor.mjs`      | Lê o `input.txt`, calcula as cores e gera `comandos.txt` |
| `input.txt`    | Lista de personagens (você cola aqui)                   |
| `comandos.txt` | Gerado pelo script: um comando `$embedcolor` por linha  |
| `mudae.ahk`    | Cola e envia um comando por vez ao apertar F8           |

## Passo a passo

### 1. Gerar a lista de personagens

No Discord, envie o comando:

```
$mmsyi-c-
```

O bot do Mudae manda no seu privado a lista dos personagens que **possuem chave mas não têm cor atribuída**, com nome, quantidade de chaves e link da imagem.

### 2. Colar no `input.txt`

Copie a lista e cole no `input.txt`. Cada linha vem neste formato:

```
Poro · :bronzekey:  (2) - https://mudae.net/uploads/2954495/Ew_dW5t~aBrQ27e.png
Raum (LoL) · :silverkey:  (4) - https://mudae.net/uploads/5082893/5flc0DR~KxVYmP7.png
```

O script pega o **nome** (tudo antes do `·`) e o **link** da imagem. A quantidade de chaves é ignorada.

> **Atenção: não funciona com GIF.** Se algum link terminar em `.gif`, remova essa linha do `input.txt` antes de rodar.

### 3. Gerar os comandos

```bash
node cor.mjs
```

O terminal mostra o progresso de cada personagem (`Nome -> #hex`) e, no final, a lista completa:

```
$embedcolor Poro$#1d5387
$embedcolor Raum (LoL)$#581718
```

A mesma lista é salva em `comandos.txt`.

### 4. Enviar no Discord

1. Feche qualquer instância antiga do AutoHotkey (ícone na bandeja).
2. Dê dois cliques no `mudae.ahk`. Uma janela mostra quantos comandos foram carregados.
3. Abra o canal do Mudae no Discord e clique na caixa de mensagem.
4. Aperte **F8**: ele cola e envia o próximo comando. Um tooltip mostra o progresso (`1/50`).
5. Repita o F8 para cada personagem, esperando a resposta do Mudae entre um e outro.

O F8 só funciona com a janela do `Discord.exe` em foco.

> Sempre que gerar um `comandos.txt` novo, recarregue o `mudae.ahk` (clique direito no ícone da bandeja e **Reload**). Ele só lê o arquivo ao abrir.

## Como a cor é escolhida

O script não faz a média da imagem. Ele ignora cinzas, pretos e brancos e escolhe a cor mais frequente entre as saturadas, dando mais peso a tons vivos e claros. Para imagens muito escuras, ele relaxa os filtros em até três níveis; quando isso acontece, o terminal mostra `(fallback nível 2)` ou `(fallback nível 3)` antes do resultado, para você saber quais cores conferir.

Ajustes, no topo do `cor.mjs`:

- `WITH_HASH`: `false` remove o `#` do hex.
- `TIERS`: limites de saturação (`minS`) e brilho (`minV`, `maxV`) de cada nível. Suba `minV` se as cores saírem escuras demais; desça se saírem lavadas.

## Problemas comuns

| Sintoma                                          | Causa e solução                                                                                                |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `Erro em Nome: nenhuma cor válida encontrada`     | Imagem transparente ou GIF. Remova a linha do `input.txt` e defina a cor manualmente.                          |
| Só aparecem as linhas de progresso, sem `$embedcolor` | Você está rodando uma versão antiga do arquivo. Confira se o nome do arquivo está certo (sem `.txt` no final). |
| AHK: "Acabaram os comandos"                      | O `comandos.txt` não está na pasta do `mudae.ahk`, ou o script foi aberto antes de o arquivo existir. Recarregue. |
| F8 não faz nada                                  | Discord não está em foco, ou você usa o Discord no navegador. Troque `Discord.exe` no `#HotIf` pelo executável do navegador (`chrome.exe`, `msedge.exe`, `firefox.exe`). |
| Acentos quebrados nos comandos                   | Salve o `input.txt` como UTF-8.                                                                                |

## Observações

- O envio é de **um comando por tecla**, de propósito: você controla o ritmo e respeita os limites do Mudae. Não use loops automáticos nem bots na sua conta; automação de conta de usuário viola os Termos do Discord.
- A cor é uma sugestão automática. Vale conferir o resultado de imagens muito escuras ou com poucas cores.
