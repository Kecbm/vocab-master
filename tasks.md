## CORRECAO DE BUGS

- Solicitar um depoimento deles sobre a ferramenta para adicionar na landing page como prova social

- TASK EM ANDAMENTO - REALIZAR TESTE MANUAL PARA VALIDACAO: Quando o usuario pesquisar uma palavra, sempre habilitar o botao de add. Na hora do evento de criacao, depois de clicar no botao de criar uma nova palavra, validar se a palavra em ingles/frances já existe. Caso exista, informar isso no pop up e nao deixar salvar. Se nao existir, criar a palavra normalmente

- Depois de salvar a palavra, limpar o search

- Icone de lixeira no final do search para excluir a palavra pesquisada, caso tenha algo digitado no search

## BERO LAB - SESSION 3

- Pegar feedback da apresentacao
- Primeiras 1000 palavras para aprender ingles
- Minha duvida era sobre uma possivel extensão pra navegador. Atualmente eu uso o Trancy com esse objetivo de conseguir salvar palavras, ver o contexto delas e revisar depois. Ele se torna bem facil de usar porque você consegue salvar apenas marcando a mensagem, e em todos os sites onde ela aparece é marcada com uma cor diferente. Dá uma olhada no Trancy depois, pode te ajudar em futuras atualizações


## Tasks

- Descricao do projeto no README + GIFS
    - Readme do meu perfil no github
    - página de projetos no portfolio

- Google Analytics pelo firebase

- Divulgar a aplicacao no LinkedIn, Twitter, Instagram e Dev.to

- IA integrada para estudar as palavras novas, revisar as mastereds e praticar as learnings

- 1 imagem semanal para compartilhar o progresso dos estudos


## 🔥 Ideias para a Feature de Revisão com IA

1. Quiz Automático com as Palavras do Usuário

- A IA gera quizzes com base no vocabulário salvo.
- Tipos de perguntas:
- Múltipla escolha → "Qual a tradução de entire?"
- Preenchimento de lacuna → "He read the book ___." (usuário digita entirely).
- Verdadeiro ou falso → "A palavra maison significa carro."

👉 Aqui, você pode usar OpenAI GPT ou modelos open-source para gerar perguntas dinâmicas a partir da lista de palavras do usuário.

2. Flashcards Inteligentes (com contexto)

- Em vez de só mostrar palavra + tradução, a IA gera:
- Exemplo de frase diferente da original (para treinar transferência de contexto).
- Explicações alternativas (sinônimos, uso formal/informal).
- A IA pode adaptar os exemplos ao nível do usuário (iniciante → frases simples, avançado → textos mais elaborados).

3. Sessões de Revisão Gamificadas

- O usuário abre a aba "Revisar com IA".
- A IA conduz um mini-“diálogo tutor”:
- IA: "Traduza maison para inglês."
- Usuário: "house"
- IA: "Correto! E agora me dê uma frase curta usando house."
- Assim vira uma mini conversa guiada, que simula interação real.

4. Revisão Espaced (SRS + IA)

- Usar Spaced Repetition System (SRS) para revisar palavras no intervalo ideal.
- A IA entra para:
- Gerar frases novas com as palavras que precisam ser revisadas naquele dia.
- Variar a forma da pergunta (tradução, sinônimo, lacuna, áudio).

5. Pronúncia com Feedback da IA

- O usuário fala a palavra.
- A IA (via API de reconhecimento de voz + modelo de avaliação de pronúncia) dá feedback:
- "Sua pronúncia de through está boa, mas precisa alongar o som do 'th'."
- Isso dá um diferencial enorme porque foca em fala ativa.

## 🚀 Tecnologias que você pode usar

Backend/IA:

- OpenAI GPT-4o mini (rápido e barato para gerar quizzes).
- Whisper API (para pronúncia e speech-to-text).
- Hugging Face models (se quiser evitar API paga).

Frontend:

- Flashcards animados, quizzes com progress bar.
- Integração de áudio (Web Speech API ou API externa).

Banco de Dados:

- Salvar performance do usuário para personalizar a revisão.
- Marcar palavras como “fracas” (erros frequentes) → revisão mais frequente.

🏆 Melhor Caminho Inicial

Eu sugiro começar simples:
1. Gerar quizzes dinâmicos com IA usando as palavras salvas pelo usuário.
Isso já dá muito valor e é fácil de implementar com GPT.

Depois, você pode evoluir para:

Sessões tutor (chat IA).

Pronúncia com feedback.

SRS + gamificação.

# Referências

- Landing page: trab.app