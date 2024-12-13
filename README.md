# Tech Challenge Fase 3 - Order System App

Este é um sistema de gerenciamento de pedidos para uma lanchonete, desenvolvido como parte do Tech Challenge Fase 3. 

### [Link Miro Tech Chalenge Arquitetura K8S](https://miro.com/app/board/uXjVKR4zMmM=/)

### [Link do video no youtube](https://youtu.be/gQWF_ncrUnA)

O sistema é composto por uma API para gerenciamento de clientes, produtos, pedidos e pagamentos, implementada seguindo os princípios da Clean Architecture e utilizando infraestrutura escalável na AWS com Kubernetes, Lambda com API GATEWAY, e DocumentDB.

Inicialmente foi corrigido os pontos sinalizados no feedback do Tech Challenge Fase 2:

- **O uso direto do axios dentro de usecases (core) que faz uma chamada HTTP (serviço externo) fere o isolamento proposto no CA**: Ajuste com a criação do pagamentoHttpClient.js.
- **está acessando diretamente os Repositorys**: Criação na camada core clienteRepositoryInterface.js, pedidoRepositoryInterface.js e produtoRepositoryInterface.js para garantirmos o isolamento.

## Repositórios

Você pode acessar os repositórios do projeto nos seguintes links:

- **Infraestrutura do banco de dados (DocumentDB)**: [tcf3_infra_database](https://github.com/CarlosLopes88/tcf3_infra_database)
- **Infraestrutura do Kubernetes (EKS)**: [tcf3_infra_kubernetes](https://github.com/CarlosLopes88/tcf3_infra_kubernetes)
- **Função de autenticação (Lambda)**: [tcf3_auth-lambda](https://github.com/CarlosLopes88/tcf3_auth-lambda)
- **Aplicação de pedidos (Node.js)**: [tcf3_order_system_app](https://github.com/CarlosLopes88/tcf3_order_system_app)

## Tecnologias Envolvidas

- **Node.js** e **Express.js**: Backend da aplicação.
- **MongoDB/DocumentDB**: Armazenamento de dados.
- **AWS Lambda**: Função de autenticação de clientes.
- **Kubernetes (EKS)**: Orquestração de containers para o sistema de pedidos.
- **Docker**: Containerização da aplicação.
- **Terraform**: Automação da infraestrutura.
- **GitHub Actions**: Automação do CI/CD.

## Automação de Deploys

A infraestrutura é gerida pelo **Terraform**, que define e aplica os recursos de infraestrutura na AWS, como o **Amazon EKS** para Kubernetes, **DocumentDB** para o banco de dados e **AWS Lambda** para a função de autenticação. O deploy da aplicação é automatizado com **GitHub Actions**, que dispara workflows para criar a infraestrutura e realizar o deploy do código sempre que houver um push na branch `main`.

Cada repositório possui workflows YAML dedicados para automatizar o processo:

- **Infraestrutura do banco de dados**: Deploy do DocumentDB.
- **Infraestrutura Kubernetes**: Provisionamento do cluster EKS.
- **Autenticação Lambda**: Deploy da função Lambda.
- **Order System App**: Build e deploy da aplicação Node.js no Kubernetes.


# Explicação e Motivação das Partes da Aplicação

## 1. Auth Lambda com API Gateway

### Comportamento:
O **AWS Lambda** é utilizado para criar uma função de autenticação (`authLambda.js`) que valida usuários através do CPF. O **API Gateway** funciona como ponto de entrada para a função Lambda, recebendo as requisições HTTP e repassando para o Lambda processá-las. O Lambda verifica no banco de dados (DocumentDB/MongoDB) se o CPF existe e retorna uma resposta com um token de autenticação.

O fluxo funciona da seguinte maneira:
- O cliente faz uma requisição HTTP para a API via **API Gateway**.
- O **API Gateway** recebe a requisição e repassa para o **Lambda**.
- O Lambda processa a requisição, consulta o banco de dados (DocumentDB), autentica o usuário e retorna a resposta para o API Gateway.
- O API Gateway então responde ao cliente.

---

## 2. Kubernetes (EKS)

### Comportamento:
O **Amazon EKS** (Elastic Kubernetes Service) orquestra os contêineres que executam a aplicação de pedidos (**Order System App**). A aplicação é containerizada com **Docker** e gerida por **Kubernetes**. O EKS executa múltiplos pods, cada um contendo instâncias da aplicação, distribuindo a carga de trabalho entre eles.

Componentes principais:
- **Deployment**: Define quantas réplicas da aplicação serão executadas em pods.
- **Service (LoadBalancer)**: Exponibiliza os pods para a internet e distribui o tráfego entre as réplicas da aplicação.

O deploy é automatizado via **GitHub Actions**, que constrói a imagem Docker, envia ao **ECR (Elastic Container Registry)** e faz o deploy no Kubernetes.

---

## 3. Infraestrutura do Banco de Dados (DocumentDB)

### Comportamento:
O **Amazon DocumentDB** é usado para armazenar informações sobre clientes, pedidos e produtos. É uma solução compatível com MongoDB, totalmente gerenciada pela AWS, o que elimina a necessidade de gerenciar a infraestrutura de banco de dados.

A configuração da infraestrutura é automatizada via **Terraform**, que cria os recursos necessários, incluindo:
- **VPC**: Para isolar a comunicação da instância DocumentDB.
- **Security Groups**: Para controlar o acesso ao banco de dados.
- **Subnets** e **Internet Gateway**: Para conectar o banco de dados com a aplicação no EKS.

Os dados da aplicação são armazenados no **Amazon DocumentDB**, compatível com MongoDB, utilizado para manter informações sobre clientes, pedidos e produtos. As conexões e credenciais para o banco de dados são gerenciadas via **SECRETS DO GUTHUB ACTION** e configuradas nos workflows de deploy.

### Estrutura das Tabelas:

- **Clientes**: Informações dos clientes como CPF, nome, e email.
- **Pedidos**: Informações sobre o cliente, produtos pedidos, status do pedido e pagamento.
- **Produtos**: Nome, descrição e preço dos produtos disponíveis.

<img align="center" src="https://github.com/CarlosLopes88/tech_challenge_3_fase/blob/520d73f550dcb7bae29dbf32446d6eaec72f6f67/estrutura_de_banco_de_dados_nosql_-_documentdb%20(1).png">

---

## 4. Order System App (Node.js no Kubernetes)

### Comportamento:
A **Order System App** é uma API construída com **Node.js** e **Express.js** para gerenciar clientes, produtos e pedidos. A aplicação segue os princípios da **Clean Architecture**, com camadas bem definidas:
- **Core**: Regras de negócio e entidades principais.
- **Interfaces**: Definem como as interações externas ocorrem.
- **Use Cases**: Implementam a lógica dos casos de uso.
- **Infrastructure**: Implementa os repositórios e clientes HTTP.

A aplicação é implantada no **Kubernetes**, que gerencia a escalabilidade e resiliência, distribuindo o tráfego entre os pods e mantendo alta disponibilidade.

---

## 5. Automação com Terraform e GitHub Actions

### Comportamento:
O **Terraform** é utilizado para gerenciar toda a infraestrutura da aplicação, como DocumentDB, EKS e API Gateway. O **GitHub Actions** automatiza os processos de CI/CD, permitindo que a infraestrutura e a aplicação sejam implantadas automaticamente após cada push para a branch `main`.

Cada repositório possui workflows de GitHub Actions que:
- Constroem e enviam imagens Docker para o **ECR**.
- Aplicam as configurações de infraestrutura via Terraform.
- Fazem o deploy da aplicação no Kubernetes.

## Como Executar o Projeto

1. Clone os repositórios correspondentes.
2. Configure suas credenciais AWS e secrets no GitHub.
3. Realize um `git push` na branch `main` para disparar os workflows de CI/CD e provisionar a infraestrutura e a aplicação automaticamente.
4. O sistema estará disponível após o deploy no Kubernetes.

## SECRETS a serem criadas caso queria transferir os repositórios:

- **`AWS_ACCESS_KEY_ID`**: Chave de acesso AWS.
- **`AWS_SECRET_ACCESS_KEY`**: Chave secreta da AWS.
- **`AWS_REGION`**: Região AWS (ex: `us-east-1`).
- **`AWS_ACCOUNT_ID`**: ID da conta AWS para empurrar imagens Docker.
- **`DB_MASTER_USERNAME`**: Nome de usuário do banco de dados DocumentDB.
- **`DB_MASTER_PASSWORD`**: Senha do banco de dados DocumentDB.
- **`DB_URI`**: URI de conexão do banco de dados.
- **`PAGSEGURO_AUTH_TOKEN`**: Token de autenticação para o PagSeguro (se aplicável).

---

## 6. Arquitetura do APP

<img align="center" src="https://github.com/CarlosLopes88/tech_challenge_3_fase/blob/91e3e2f5f40cbb2074339a7f184dc1d972b8cdc6/arquitetura_do_sistema_-_tech_challenge_fase_3.png">

---

## 7. Estrutura de Pastas

Abaixo está a estrutura básica da pasta principal do projeto:

/tech_chalenge_fase_3  

├── /tcf3_infra_database  
│   ├── /.github  
│   │   └── /workflows  
│   │       └── deploy_documentdb.yaml  
│   └── /db-infra  
│       └── /terraform  
│           └── documentdb.tf  
  
├── /tcf3_infra_kubernetes  
│   ├── /.github  
│   │   └── /workflows  
│   │       └── deploy_eks_Infrastructure.yaml  
│   └── /kubernetes-infra  
│       └── /terraform  
│           └── eks-cluster.tf  

├── /tcf3_auth-lambda  
│   ├── /.github  
│   │   └── deploy_lambda_function.yaml  
│   ├── /workflows  
│   ├── /auth-lambda  
│   │   ├── /src  
│   │   │   └── /lambda  
│   │   │       └── authLambda.js  
│   │   └── /terraform  
│   │       ├── main.tf  
│   │       ├── outputs.tf  
│   │       └── variables.tf  
│   └── package.json  

├── /tcf3_order_system_app  
│   ├── /.github  
│   │   └── /workflows  
│   │       └── deploy_order_system_app.yaml  
│   └── /order-system-app  
│       ├── /docs  
│       │   └── openapi.yaml  
│       ├── /k8s  
│       │   ├── appnode-deployment.yaml  
│       │   └── appnode-service.yaml  
│       ├── /src  
│       │   ├── /core  
│       │   │   ├── /domain  
│       │   │   │   ├── cliente.js  
│       │   │   │   ├── pagamento.js  
│       │   │   │   ├── pedido.js  
│       │   │   │   └── produto.js  
│       │   │   ├── /interfaces  
│       │   │   │   ├── clienteRepositoryInterface.js  
│       │   │   │   ├── pedidoRepositoryInterface.js  
│       │   │   │   └── produtoRepositoryInterface.js   
│       │   │   ├── /use_cases  
│       │   │       ├── pagamentoServices.js  
│       │   │       └── pedidoUseServices.js  
│       │   ├── /application  
│       │   │   ├── /interfaces  
│       │   │   │   ├── api  
│       │   │   │   │   ├── clienteRoutes.js  
│       │   │   │   │   ├── pagamentoRoutes.js  
│       │   │   │   │   ├── pedidoRoutes.js  
│       │   │   │   │   ├── produtoRoutes.js  
│       │   │   │   │   └── webhookRoutes.js  
│       │   │   │   └── web  
│       │   │   │       └── server.js  
│       │   ├── /infrastructure  
│       │   │   ├── /http  
│       │   │   │   └── pagamentoHttpClient.js  
│       │   │   ├── /repositories  
│       │   │   │   ├── clienteRepository.js  
│       │   │   │   ├── pedidoRepository.js  
│       │   │   │   └── produtoRepository.js  
│       │   │   └── dbconnect.js  
│       ├── dockerfile  
│       └── package.json  

