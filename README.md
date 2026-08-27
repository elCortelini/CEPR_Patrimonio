# 🏫 Sistema de Controle Patrimonial Escolar
### **Centro Educacional Pedro Rizzi**

Sistema moderno, responsivo e intuitivo desenvolvido em **Next.js**, **Tailwind CSS** e **TypeScript** para a gestão completa do acervo patrimonial, salas, empréstimos temporários, chamados de manutenção e emissão de relatórios oficiais.

---

## ✨ Funcionalidades Principais

1. **📦 Cadastro Patrimonial com Código de 6 Dígitos**
   - Número de tombamento fixo numericamente formatado (ex: `000123`).
   - Foto opcional (usando a câmera do celular ou arquivo).
   - Campos: Código (6 dígitos), Foto, Descrição, Data de entrada, Origem da verba (PDDE, FDE, Prefeitura, APMF, etc.), Observação, Local vinculado e Baixa.
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
6. **📄 Relatórios em PDF e Excel**
   - Emissão de relatórios formatados com cabeçalho oficial do **Centro Educacional Pedro Rizzi**, exportáveis em **PDF** e **Excel (.xlsx)**.

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 14+ (App Router)**
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** (Ícones)
- **jsPDF & jsPDF-AutoTable** (Geração de relatórios PDF)
- **XLSX** (Planilhas Excel)
- **GitHub Pages + GitHub Actions** (Hospedagem estática gratuita)
