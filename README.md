# Last Dawn

Jogo de sobrevivência contra hordas para celular, no estilo "bullet heaven":
você anda com um joystick virtual, ataca sozinho e escolhe poderes ao subir de nível.

- HTML5 Canvas + JavaScript puro, **sem build** e sem bibliotecas externas (só arquivos estáticos).
- Tela vertical com resolução lógica de 720 x 1280. A altura se adapta ao formato do celular para preencher a tela.
- Feito para celular fraco: pools de objetos, limite de inimigos/projéteis, grade espacial de colisão e sprites pré-renderizados.
- PWA: instalável ("Adicionar à tela inicial") e funciona offline.
- Progresso salvo em `localStorage`: recordes, conquistas, coleção e configurações.

## Como rodar no computador

O service worker exige `http://`. Abrir o `index.html` direto (`file://`) também funciona, mas sem o modo offline.

```bash
# na pasta do projeto
python3 -m http.server 8080
# abra http://localhost:8080
```

No computador dá para jogar com **WASD** ou com as **setas**. **Esc** ou **P** pausa.
O mouse funciona como o dedo: clique, segure e arraste para usar o joystick.

## Como testar no celular

### Opção 1: GitHub Pages (recomendado)
1. No GitHub, abra o repositório e vá em **Settings → Pages**.
2. Em **Build and deployment**, escolha **Source: Deploy from a branch**.
3. Selecione a branch (ex.: `main`), pasta **/ (root)** e clique em **Save**.
4. Depois de 1 ou 2 minutos, o jogo fica em `https://<seu-usuario>.github.io/<nome-do-repo>/`.
5. Abra esse endereço no Chrome do celular e use o menu ⋮ → **Adicionar à tela inicial** (ou **Instalar app**).
6. Depois da primeira abertura, o jogo funciona sem internet.

> O arquivo `.nojekyll` já está no projeto para o GitHub Pages servir todos os arquivos sem processá-los.

### Opção 2: rede local (Wi-Fi)
1. Rode `python3 -m http.server 8080` no computador.
2. No celular, ligado ao mesmo Wi-Fi, abra `http://<IP-do-computador>:8080`.
   Assim dá para jogar, mas a instalação como PWA e o modo offline só funcionam com **HTTPS** (por exemplo, no GitHub Pages).

### Publicando uma atualização
Ao mudar arquivos, aumente `CACHE_VERSION` em `sw.js` (ex.: `lastdawn-v0.1.1`).
Assim os celulares que já instalaram o jogo baixam a versão nova. Ela aparece ao abrir o jogo pela segunda vez.

## Estrutura

```
index.html            página única, carrega os scripts em ordem
manifest.json, sw.js  PWA (instalação + offline)
icons/                ícones do app
css/style.css
js/
  config.js           limites de desempenho e valores globais
  data/               DADOS FÁCEIS DE EDITAR
    assets.js           caminhos de imagens/sons + sons sintetizados
    enemies.js          inimigos e chefes
    powers.js           poderes (níveis e atributos)
    passives.js         melhorias passivas
    waves.js            ondas, hordas, chefes, dificuldade e curva de XP
    achievements.js     conquistas
  core/               motor: loop, escala, áudio, save, pools, grade de colisão
  ui/                 botões, HUD, joystick, tela de subir de nível, painéis
  entities/           jogador, inimigos, projéteis, gemas e efeitos
  powers/behaviors.js como cada poder funciona
  scenes/             carregamento, menu, jogo, fim de jogo, configurações, painéis
```

## Trocando imagens e sons

Tudo começa com placeholders (formas simples e sons sintetizados). Para trocar:

1. Coloque o arquivo em `assets/images/` ou `assets/sounds/`.
2. Em `js/data/assets.js`, preencha o caminho na chave certa, por exemplo:
   ```js
   player: 'assets/images/player.png',
   menuBg: 'assets/images/menu_bg.jpg',
   hit: 'assets/sounds/hit.mp3',
   music_game: 'assets/sounds/battle.mp3',
   ```
3. Pronto. Chaves vazias continuam usando o placeholder.

Dicas:
- Personagens e inimigos: imagem quadrada com fundo transparente (ex.: 128x128). Ela é desenhada no tamanho do corpo (`r` em `enemies.js`).
- Fundos (`loadingBg`, `menuBg`): 720x1280 ou maior. A imagem preenche a tela sem distorcer.
- Chão (`ground`): ladrilho quadrado que se repete (ex.: 256x256).
- Ícones de poderes: `icon_<id>` (ex.: `icon_wind_blade`).

## Editando o jogo

- **Novo inimigo:** adicione um objeto em `LD.ENEMIES` (`js/data/enemies.js`) e coloque o `id` em um `pool` de `js/data/waves.js`.
- **Balancear poderes:** mude os números em `js/data/powers.js`. Cada nível só lista o que muda.
- **Novo poder:** adicione os dados em `powers.js` e o comportamento com o mesmo `id` em `js/powers/behaviors.js`.
- **Desempenho:** ajuste `maxEnemies`, `maxProjectiles` etc. em `js/config.js`. Em Configurações, **Mostrar FPS** exibe o FPS na tela.
