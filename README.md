<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Bíblia Tracker & Devocional IA

Aplicativo para acompanhamento de leitura bíblica com insights gerados por Inteligência Artificial (Gemini).

## 🚀 Como Rodar Localmente

Para que a Inteligência Artificial funcione no seu computador, você precisa configurar a Chave de API.

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente:**
   - Crie um arquivo chamado `.env` na raiz do projeto.
   - Adicione sua chave de API do Gemini neste arquivo:
   
   ```env
   VITE_API_KEY=cola_sua_chave_do_google_aqui
   ```
   
   *(Você pode pegar sua chave em: https://aistudio.google.com/app/apikey)*

3. **Inicie o projeto:**
   ```bash
   npm run dev
   ```

## 🛠️ Tecnologias

- React + Vite
- TailwindCSS
- Google Gemini API
- Supabase (Backend/Auth)