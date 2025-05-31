# Pontinho.com

![Placeholder for Screenshot](https://raw.githubusercontent.com/TDamiao/pontinho.com/main/public/Pontinho.com.jpeg)


## Overview

Pontinho.com é uma plataforma colaborativa de cupons de desconto, inspirada em sites como Cuponomia, onde qualquer usuário pode submeter, votar e reportar cupons válidos sem necessidade de cadastro. O sistema promove automaticamente os melhores cupons através de votos positivos e desativa cupons com 20 votos negativos consecutivos.

## Como Funciona

1. **Submissão de Cupons**  
   Usuários submetem cupons (código, descrição, link, validade, regras) através do formulário.  
2. **Votação Democrática**  
   Cada cupom pode receber votos positivos ou negativos. Cupons com 20 votos negativos consecutivos são desativados automaticamente.  
3. **Ranking Dinâmico**  
   A página inicial exibe cupons ordenados pelo número de votos positivos, promovendo os melhores descontos.  
4. **Busca Flexível**  
   Pesquise cupons por nome de loja ou palavras-chave, gerando concorrência entre ofertas relacionadas a cada termo.  
5. **Reports de Cupons Inválidos**  
   Usuários podem reportar cupons expirados ou incorretos para revisão manual.

## Metodologia de Desenvolvimento

O projeto segue práticas ágeis em sprints de 2 semanas, com revisões de código e integração contínua. As principais etapas são:

- Planejamento de funcionalidades (MVP, SEO, usabilidade)  
- Desenvolvimento incremental (front-end e back-end)  
- Testes unitários e E2E  
- Revisão de código via Pull Requests  
- Deploy contínuo com pipelines automáticos  

## Estrutura do Repositório

```
/pontinho
├── public/              
│   ├── index.html       # HTML principal (React/Vue) ou entry PHP
│   └── assets/          # CSS, JS, imagens estáticas
├── src/
│   ├── components/      # Componentes de UI (React ou templates PHP)
│   ├── integrations/    # Conexões (Supabase, APIs)
│   └── lib/             # Serviços e helpers
├── src/server/          # Código PHP (caso reescreva o backend)
├── .env.local           # Variáveis de ambiente (não comitar)
/README.md               # Este arquivo
```

## Tecnologias e Bibliotecas

- **Frontend**: React, TypeScript, TailwindCSS (ou Bootstrap)  
- **Backend**: Supabase (Postgres) ou PHP 8.x + MySQL  
- **Cliente Supabase**: \`@supabase/supabase-js\`  
- **Deploy**: Vercel (frontend estático) ou Hostinger (PHP/Apache)  
- **CI/CD**: GitHub Actions  
- **Testes**: Jest, Cypress (E2E) ou PHPUnit, Codeception (PHP)

## Setup & Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/TDamiao/cupom-vota-ja.git
   cd cupom-vota-ja
   ```
2. Instale dependências:
   ```bash
   npm install
   ```
3. Configure variáveis em \`.env.local\`:
   ```dotenv
   VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<sua-chave-anonima>
   ```
4. Inicie em modo desenvolvimento:
   ```bash
   npm run dev
   ```
5. Gere build para produção:
   ```bash
   npm run build
   ```

## Contribuindo

1. Fork este repositório.  
2. Crie uma branch feature/XYZ ou fix/ABC.  
3. Faça suas alterações e adicione testes.  
4. Abra um Pull Request descrevendo suas mudanças.

## Doações

Se este projeto ajudou você, considere uma pequena doação via Mercado Pago:

[Doar via Mercado Pago](https://link.mercadopago.com.br/pontinhopontocom)

---
