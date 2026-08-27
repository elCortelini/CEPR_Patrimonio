# 🏫 Sistema de Controle Patrimonial & Almoxarifado
### **Centro Educacional Pedro Rizzi**

Sistema moderno, responsivo e intuitivo desenvolvido em **Next.js**, **Tailwind CSS** e **SQLite (Prisma ORM)** para a gestão completa do acervo patrimonial, salas, empréstimos temporários, chamados de manutenção, estoque de almoxarifado e emissão de relatórios oficiais.

---

## ✨ Funcionalidades Principais

1. **📦 Cadastro Patrimonial com Código de 6 Dígitos**
   - Número de tombamento fixo numericamente formatado (ex: `000123`).
   - Campos: Código (6 dígitos), Descrição, Data de entrada, Origem da verba (PDDE, FDE, Prefeitura, APMF, etc.), Observação, Local vinculado e Baixa.
2. **🏫 Gestão de Salas e Locais Escolares**
   - Cadastro e organização por blocos (Bloco A, Bloco B, Bloco Adm, Quadra, etc.).
   - Visualização da quantidade de bens por sala e bloqueio de exclusão em salas com itens vinculados.
3. **🕒 Controle de Empréstimos Temporários**
   - Registro de saída de equipamentos móveis (Notebooks, Projetores, Caixas de Som, Kits de Robótica) para professores e funcionários.
   - Prazo de devolução e baixa em 1 clique.
4. **🛠️ Chamados e Gestão de Manutenção**
   - Registro de defeitos relatados com acompanhamento do status (Em Manutenção / Concluído).
   - Histórico de laudos e custos de conserto por equipamento.
5. **📋 Processo de Baixa Patrimonial**
   - Registro formal com data e motivo de descarte/baixa (Inservível, Obsoleto, Furtado, Doado).
6. **📦 Almoxarifado / Materiais de Consumo**
   - Controle de estoque de papéis, pincéis de quadro, produtos de limpeza e insumos com alertas visuais para estoque mínimo.
7. **📄 Relatórios em PDF e Excel**
   - Emissão de relatórios formatados com cabeçalho oficial do **Centro Educacional Pedro Rizzi**, exportáveis em **PDF** e **Excel (.xlsx)**.

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
- Node.js v18 ou superior instalado.

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar e Popular o Banco de Dados (SQLite)
```bash
npx prisma db push
npx prisma db seed
```

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Abra o navegador em `http://localhost:3000`.

---

## 📤 Como Publicar o Projeto no GitHub

Para subir este repositório para a sua conta no GitHub, execute os seguintes comandos no terminal:

```bash
# 1. Adicionar todos os arquivos ao Git
git add .

# 2. Criar o commit inicial
git commit -m "feat: Sistema de Controle Patrimonial - CE Pedro Rizzi"

# 3. Alterar o nome da branch principal para main
git branch -M main

# 4. Vincular ao seu repositório remoto no GitHub (Substitua a URL abaixo pelo seu link do GitHub)
git remote add origin https://github.com/SEU_USUARIO/patrimonio-pedro-rizzi.git

# 5. Enviar os arquivos para o GitHub
git push -u origin main
```

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 14+ (App Router)**
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** (Ícones)
- **Prisma ORM** + **SQLite**
- **jsPDF & jsPDF-AutoTable** (Geração de relatórios PDF)
- **XLSX** (Planilhas Excel)
