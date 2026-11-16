<<<<<<< HEAD
# GoTicket - DevPool Edition

O GoTicket nasceu a partir de um problema real do atendimento: organizar quem
participa do fluxo de suporte e tornar as operações mais claras e rastreáveis.
Esta edição foi isolada do ambiente corporativo e adaptada para demonstrar os
fundamentos de uma aplicação Full-Stack com um CRUD completo de usuários.

> Este repositório utiliza somente dados fictícios. Ele não contém credenciais,
> endpoints privados, dados de clientes ou código de integrações internas.

## Tecnologias

- **Frontend:** HTML, CSS e JavaScript puro;
- **Backend:** Node.js e Express;
- **Persistência:** arquivo JSON acessado exclusivamente por uma camada de repositório;
- **Segurança:** hash de senha com BCrypt;
- **Testes:** Node Test Runner e Supertest.

O armazenamento em arquivo foi escolhido para que a banca consiga executar o
projeto sem instalar um banco de dados. A camada `FileUserRepository` isola a
persistência, permitindo uma futura troca por PostgreSQL sem modificar as rotas,
as regras de negócio ou o frontend.

## Funcionalidades

- Cadastro de usuário;
- Listagem e pesquisa de usuários;
- Consulta de usuário por identificador;
- Edição dos dados e do status;
- Exclusão com confirmação visual;
- Feedback de carregamento, sucesso e erro;
- Validação no frontend e no backend;
- E-mail e login únicos;
- Senha protegida e nunca exposta pela API;
- CORS habilitado para consumo do frontend.

## Regras de negócio

- O ID é um UUID gerado pelo servidor;
- O nome é obrigatório e possui no mínimo 3 caracteres;
- O e-mail é obrigatório, válido e único;
- O login é obrigatório, único e possui no mínimo 3 caracteres;
- A senha é obrigatória no cadastro e possui no mínimo 8 caracteres;
- A senha é armazenada somente como hash BCrypt;
- Um novo usuário é ativo por padrão;
- Payloads inválidos retornam HTTP `400` com uma mensagem explicativa;
- Usuários inexistentes retornam HTTP `404`;
- A exclusão é física e exige confirmação na interface.

## Como executar

### Pré-requisitos

- Node.js 20 ou superior;
- npm.

### Instalação

```bash
git clone URL_DO_REPOSITORIO
cd GoTicket-DevPool-Edition
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

O arquivo `data/users.json` será criado automaticamente na primeira execução.

### Variáveis opcionais

Copie `.env.example` para `.env` somente se quiser alterar a configuração. O
projeto funciona sem esse arquivo com os valores padrão.

| Variável | Padrão | Finalidade |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP da aplicação |
| `DATA_FILE` | `./data/users.json` | Arquivo usado pelo repositório |
| `PASSWORD_SALT_ROUNDS` | `10` | Custo do hash BCrypt |

Ao usar um arquivo `.env`, carregue-o no processo conforme a sua ferramenta ou
execute o Node com `--env-file=.env`.

## API REST

| Método | Endpoint | Descrição | Sucesso |
| --- | --- | --- | --- |
| `POST` | `/users` | Cadastra um usuário | `201 Created` |
| `GET` | `/users` | Lista todos os usuários | `200 OK` |
| `GET` | `/users/:id` | Consulta um usuário | `200 OK` |
| `PUT` | `/users/:id` | Atualiza um usuário | `200 OK` |
| `PATCH` | `/users/:id` | Atualiza campos do usuário | `200 OK` |
| `DELETE` | `/users/:id` | Exclui um usuário | `204 No Content` |
| `GET` | `/api/health` | Verifica a aplicação | `200 OK` |

### Cadastrar

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Souza",
    "email": "ana@empresa.com",
    "login": "ana.souza",
    "password": "senha-segura",
    "active": true
  }'
```

### Listar

```bash
curl http://localhost:3000/users
```

### Consultar por ID

```bash
curl http://localhost:3000/users/UUID_DO_USUARIO
```

### Atualizar

```bash
curl -X PATCH http://localhost:3000/users/UUID_DO_USUARIO \
  -H "Content-Type: application/json" \
  -d '{ "name": "Ana Souza Lima", "active": false }'
```

### Excluir

```bash
curl -X DELETE http://localhost:3000/users/UUID_DO_USUARIO
```

## Organização do código

```text
public/
  index.html                 interface e formulários
  styles.css                 identidade visual responsiva
  app.js                     estado da tela e chamadas à API
src/
  app.js                     criação e configuração do Express
  server.js                  inicialização do servidor
  config.js                  leitura das configurações
  routes/userRoutes.js       contrato HTTP do CRUD
  services/userService.js    regras de negócio
  validators/                validação e normalização do payload
  repositories/              leitura e escrita dos dados
  middleware/                tratamento centralizado de erros
test/
  users.api.test.js          testes do fluxo e da segurança
docs/
  architecture.drawio       desenho editável da arquitetura
  presentation-guide.md     roteiro sugerido para a banca
```

## Fluxo de uma informação

1. A pessoa preenche o formulário no navegador;
2. O JavaScript transforma os campos em JSON e chama a API REST;
3. A rota identifica a operação e entrega os dados ao serviço;
4. O serviço valida as regras, verifica duplicidades e protege a senha;
5. O repositório grava os dados no arquivo JSON;
6. A API devolve somente os campos públicos;
7. O frontend atualiza a tabela e apresenta um feedback visual.

## Decisões técnicas

### Por que separar rota, serviço e repositório?

Cada camada possui uma responsabilidade. A rota entende HTTP, o serviço entende
as regras do usuário e o repositório entende persistência. Isso reduz o impacto
de mudanças e facilita os testes.

### Por que exclusão física?

O desafio aceita exclusão física ou lógica. Para este CRUD demonstrativo, a
exclusão física deixa o comportamento mais simples de observar. Em uma aplicação
com auditoria, a escolha seria um soft delete por `deleted_at`.

### Por que validar novamente no backend?

A validação do navegador melhora a experiência, mas pode ser contornada. O
backend é a fonte de verdade e sempre valida o payload antes de persistir.

### Como a senha é protegida?

A senha é transformada em hash BCrypt antes da gravação. A API remove o campo
`passwordHash` de todas as respostas, inclusive após cadastro e edição.

## Testes

```bash
npm test
```

Os testes cobrem:

- fluxo completo do CRUD;
- retorno `404` para usuário inexistente;
- validação dos campos obrigatórios;
- rejeição de e-mail e login duplicados;
- armazenamento do hash e ausência da senha nas respostas.
- troca de senha sem exposição do novo valor;
- CORS e resposta JSON em rota de API inexistente.

## Checklist de teste manual

Antes de entregar, realize este roteiro no navegador:

1. Cadastre um usuário com dados válidos e confirme que começa **ativo**;
2. Tente usar nome curto, e-mail inválido, login curto e senha com menos de 8 caracteres;
3. Tente repetir um e-mail e um login já cadastrados;
4. Pesquise pelo nome, e-mail e login;
5. Edite o nome e marque o usuário como inativo sem informar uma nova senha;
6. Edite novamente e informe uma nova senha;
7. Clique em excluir, cancele e confirme que o registro continua na tabela;
8. Clique em excluir outra vez, confirme e verifique a atualização dos indicadores;
9. Atualize a página para confirmar a persistência dos dados;
10. Execute `npm test` uma última vez antes de publicar.

## Arquitetura visual

Abra [`docs/architecture.drawio`](docs/architecture.drawio) no
[diagrams.net](https://app.diagrams.net/) para editar ou apresentar o desenho.

## Checklist do desafio

- [x] Frontend e backend entregues;
- [x] Stack permitida: Vanilla JS + Node.js;
- [x] CRUD completo via API REST;
- [x] CORS;
- [x] Interface para cadastro, edição e exclusão;
- [x] Confirmação antes de excluir;
- [x] Loading, sucesso e erro;
- [x] UUID gerado no servidor;
- [x] Validação de nome, e-mail, login e senha;
- [x] E-mail e login únicos;
- [x] Status ativo por padrão;
- [x] Hash seguro de senha;
- [x] Senha e hash ausentes no JSON da API;
- [x] Persistência isolada da apresentação;
- [x] README com instalação e exemplos de chamadas.
=======
# devpool
projeto para devpool 2027
>>>>>>> 0d1bdf45fb6175ec6fe4f8b801e529a918162555
