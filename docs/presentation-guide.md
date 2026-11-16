# Roteiro da apresentação

Este roteiro é um apoio. Use as ideias com as suas próprias palavras e altere os
exemplos conforme os testes que você fizer antes da banca.

## 1. Começo - o problema

"O GoTicket surgiu de uma necessidade que eu observei no suporte. Existem várias
etapas entre receber um atendimento e registrar tudo corretamente. Eu comecei
tentando reduzir esse trabalho manual e, durante o desenvolvimento, precisei
pensar não apenas na tela, mas também em API, segurança, persistência e falhas."

Explique brevemente o fluxo real, sem citar clientes, credenciais ou detalhes
internos. Em seguida, conte que esta edição foi isolada para a demonstração.

## 2. O recorte para o desafio

"Para o desafio, eu criei uma edição independente do ambiente de produção e
concentrei a demonstração na gestão dos usuários que participam do fluxo. Assim
eu consigo mostrar o ciclo completo de uma informação sem expor dados internos."

Abra a aplicação e demonstre:

1. Cadastro de um usuário;
2. Mensagem de sucesso e atualização dos indicadores;
3. Pesquisa pelo usuário;
4. Edição do nome e mudança para inativo;
5. Confirmação de exclusão;
6. Tentativa de cadastrar o mesmo e-mail novamente.

## 3. Caminho do clique até o arquivo

Abra `public/app.js` na função `saveUser`.

"Quando eu clico em salvar, o frontend monta um JSON e faz uma chamada HTTP. Ele
não acessa o arquivo diretamente. A requisição chega na rota, passa pelo serviço,
é validada e só então chega ao repositório."

Mostre nesta ordem:

- `public/app.js` - chamada `fetch`;
- `src/routes/userRoutes.js` - status HTTP;
- `src/services/userService.js` - regras e hash;
- `src/repositories/fileUserRepository.js` - persistência;
- `data/users.json` - registro salvo sem a senha original.

## 4. Segurança

"A validação da tela serve para dar um retorno rápido, mas ela não é suficiente,
porque alguém pode chamar a API sem usar o navegador. Por isso, o backend valida
tudo novamente. A senha passa pelo BCrypt e o hash é removido antes de qualquer
resposta da API."

Demonstre a resposta do `POST /users` e depois o arquivo local. O objetivo é
mostrar que a senha não aparece na resposta e também não é gravada em texto.

## 5. Decisão sobre persistência

"Eu usei arquivo JSON porque o desafio permite uma persistência estruturada em
arquivo e isso deixa o projeto simples para qualquer avaliador executar. Mesmo
assim, eu isolei o acesso em um repositório. Se eu trocar por PostgreSQL, as rotas
e o frontend continuam iguais."

Não diga que arquivo é sempre melhor. Explique que foi uma decisão adequada para
o escopo e que produção normalmente exige banco, backup e concorrência mais forte.

## 6. Testes

Execute:

```bash
npm test
```

"Eu quis testar principalmente o que seria mais prejudicial se quebrasse: o CRUD,
as duplicidades e a proteção da senha. Os testes criam um arquivo temporário e
não alteram os dados usados pela demonstração."

## 7. Possível ajuste ao vivo

Esteja preparado para mudanças pequenas, por exemplo:

- adicionar filtro apenas de usuários ativos;
- adicionar telefone ao cadastro;
- alterar o limite mínimo do nome;
- mudar a exclusão física para inativação;
- adicionar uma validação de domínio do e-mail.

Antes da banca, pratique uma dessas mudanças sem consultar este roteiro.

## 8. Fechamento

"O principal aprendizado foi entender que uma funcionalidade não termina quando
a tela fica pronta. Eu precisei pensar no contrato da API, nas validações, na
segurança da senha, no formato dos dados e em como testar cada decisão. Ainda há
coisas que eu melhoraria em uma próxima versão, mas consigo explicar por que a
aplicação está organizada dessa forma."

## Perguntas que podem aparecer

### Por que não acessar o arquivo diretamente pelo frontend?

Porque o navegador não deve controlar a persistência. Todas as operações passam
pela API, que aplica as regras e impede que o cliente burle as validações.

### Por que o e-mail é convertido para minúsculas?

Para evitar que `Ana@Empresa.com` e `ana@empresa.com` sejam tratados como dois
e-mails diferentes.

### Por que usar UUID?

O servidor gera um identificador que não depende da ordem dos registros e pode
ser criado sem consultar o próximo número de uma sequência.

### O que mudaria para produção?

PostgreSQL com constraints únicas, autenticação e autorização, logs estruturados,
rate limiting, migrations, observabilidade e pipeline de entrega.

### O que acontece se duas pessoas salvarem ao mesmo tempo?

O repositório organiza as escritas em uma fila dentro do processo. Para múltiplas
instâncias do backend, seria necessário um banco que controle transações e
restrições únicas.
