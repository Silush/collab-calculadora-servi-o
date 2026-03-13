# 📊 Calculadora Comercial - Collab DealDesk
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
## 🚀 Visão Geral
A **Collab DealDesk** é uma ferramenta interna avançada desenvolvida para a equipe comercial da **Collab Gestão Empresarial**. Ela automatiza o diagnóstico de leads durante reuniões de vendas, recomendando o plano ideal com base em regras de negócio complexas e gerando propostas financeiras instantâneas.
**MVP Funcional:**
- Formulário de diagnóstico em tempo real (Real-time engine).
- Backend persistente para salvar e recuperar simulações (Cloudflare Durable Objects).
- Geração de proposta comercial formatada para cópia e impressão.
- Histórico de simulações na nuvem.
- Interface responsiva com suporte a Dark Mode.
## 📋 Como Usar
1. **Dados Gerais:** Insira o nome da empresa, faturamento (mensal/anual) e informações do ERP atual.
2. **Volume Operacional:** Defina a volumetria de agendamentos bancários, emissões de NFSe e boletos usando os sliders.
3. **Necessidades Consultivas:** Marque os itens estratégicos desejados (DRE, BI, Reuniões).
4. **Análise de Resultados:** O painel lateral atualizará automaticamente recomendando o plano (Essential, Business ou Premium), detalhando custos, economias e argumentos de venda.
5. **Ação:** Utilize o botão "Copiar Proposta" para enviar ao cliente ou "Imprimir/PDF" para gerar o documento formal.
6. **Persistência:** Clique em "Salvar Nuvem" para registrar a simulação no banco de dados.
## 💰 Regras de Negócio (Exatas)
*   **Essential BPO:** R$ 1.621/mês + R$ 1.800 setup. Limite de 200k fat/mês. Inclui 20 unid. operacionais. R$ 15/excedente.
*   **Business CFO:** R$ 4.730/mês (sem setup). Faturamento > R$ 4.8M/ano. Adicional de R$ 1k/milhão excedente. R$ 500/h extra.
*   **Premium Finance:** R$ 5.970/mês + R$ 3.200 setup. 40 unid. operacionais inclusas. R$ 10/excedente. R$ 300/h extra. R$ 800/milhão excedente.
## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion.
- **Componentes:** Shadcn UI (Radix UI).
- **Gestão de Formulários:** React Hook Form + Zod (Validação).
- **Data Fetching:** TanStack Query (React Query).
- **Backend:** Hono Framework rodando em Cloudflare Workers.
- **Storage:** Durable Objects (Persistência Transacional).
## 🔧 Comandos
- **Desenvolvimento:** `bun dev`
- **Build & Preview:** `bun preview`
- **Deploy:** `bun run deploy`
## 📱 Features Próximas (Roadmap)
- Geração de PDF nativa no navegador.
- Link único para compartilhamento externo da simulação.
- Integração direta (Webhooks) com CRM.
- Motor de regras customizável via painel admin.
---
*Desenvolvido para Collab Gestão Empresarial.*