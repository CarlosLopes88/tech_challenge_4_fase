# Tech Challenge Fase 4 - Order System App

Este é um sistema de gerenciamento de pedidos para uma lanchonete, desenvolvido como parte do Tech Challenge Fase 4. 

### [Link do video no youtube](https://www.youtube.com/watch?v=hgEq9UEUCjE)

O sistema é composto por uma API para gerenciamento de clientes, produtos, pedidos e pagamentos, implementada seguindo os princípios da Clean Architecture e utilizando infraestrutura escalável na AWS com EKS (Kubernetes), API GATEWAY, DocumentDB e Cognito como meio de autenticação agora quebrada em 3 microserviços.

Inicialmente foi corrigido os pontos sinalizados no feedback do Tech Challenge Fase 3

- **Erro do kubernetes que você mencionou no documento**: Ajustes de rede para o docdb e EKS rodar e integrar corrijindo os problemas anteriores.
- **Seria necessário gerar um token jwt que está como um exemplo o retorno no seu repositório**: Criação do Cognito para gerenciar o processo.

## Repositórios

Você pode acessar os repositórios do projeto nos seguintes links:

- **Infraestrutura do banco de dados (DocumentDB)**: [01_tcf4_infra_documentdb](https://github.com/CarlosLopes88/01_tcf4_infra_documentdb)
- **Infraestrutura do Kubernetes (EKS)**: [02_tcf4_infra_eks_cliente](https://github.com/CarlosLopes88/02_tcf4_infra_eks_cliente)
- **Infraestrutura do Kubernetes (EKS)**: [03_tcf4_infra_eks_produto](https://github.com/CarlosLopes88/03_tcf4_infra_eks_produto)
- **Infraestrutura do Kubernetes (EKS)**: [04_tcf4_infra_eks_pedidopgto](https://github.com/CarlosLopes88/04_tcf4_infra_eks_pedidopgto)
- **Cognito (JWT)**: [05_tcf4_infra_cognito](https://github.com/CarlosLopes88/05_tcf4_infra_cognito)
- **Apigateway**: [06_tcf4_infra_apigateway](https://github.com/CarlosLopes88/06_tcf4_infra_apigateway)

## Tecnologias Envolvidas

- **Node.js** e **Express.js**: Backend da aplicação.
- **MongoDB/DocumentDB**: Armazenamento de dados.
- **AWS Cognito**: Autenticação de clientes.
- **Kubernetes (EKS)**: Orquestração de containers para o sistema de pedidos.
- **AWS APIgateway**: Centralizar a entrada e validar token de login dos clientes.
- **Docker**: Containerização da aplicação.
- **Terraform**: Automação da infraestrutura.
- **GitHub Actions**: Automação do CI/CD.
- **Testes com jtest e Sonarqube cloud**: Utilizamos as duas ferramentas para criar testes automatizados e checar a qualidade do nosso código.

## Automação de Deploys

A infraestrutura é gerida pelo **Terraform**, que define e aplica os recursos de infraestrutura na AWS, como o **Amazon EKS** para Kubernetes, **DocumentDB** para o banco de dados e **AWS Cognito** para a autenticação e **AWS APIgateway**. O deploy da aplicação é automatizado com **GitHub Actions**, que dispara workflows para criar a infraestrutura e realizar o deploy do código sempre que houver um push na branch `main`.

Cada repositório possui workflows YAML dedicados para automatizar o processo:

- **deploy_documentdb**: Deploy do DocumentDB.
- **deploy_eks**: Provisionamento do cluster EKS e deploy dos 3 serviços eks_clientes, eks_produtos e eks_pedidopgto.
- **deploy_cognito**: Deploy da Cognito.
- **deploy_apigateway**: Deploy do nosso APIgateway.


# Explicação e Motivação das Partes da Aplicação

## 1. Infraestrutura do Banco de Dados (DocumentDB)

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

---

## 2. Kubernetes (EKS)

### Comportamento:
O **Amazon EKS** (Elastic Kubernetes Service) orquestra os contêineres que executam a aplicação de pedidos (**Order System App**). A aplicação é containerizada com **Docker** e gerida por **Kubernetes**. O EKS executa múltiplos pods, cada um contendo instâncias da aplicação, distribuindo a carga de trabalho entre eles.

Componentes principais:
- **Deployment**: Define quantas réplicas da aplicação serão executadas em pods.
- **Service (LoadBalancer)**: Exponibiliza os pods para a internet e distribui o tráfego entre as réplicas da aplicação.

O deploy é automatizado via **GitHub Actions**, que constrói a imagem Docker, envia ao **ECR (Elastic Container Registry)** e faz o deploy no Kubernetes.

---

## 3.  API Gateway e Amazon Cognito

### Comportamento:
O **Amazon Cognito** é utilizado para autenticar usuários através de CPF e senha, enquanto o **API Gateway** atua como ponto de entrada para as requisições, validando tokens e direcionando as chamadas para o backend.

O fluxo funciona da seguinte maneira:
- O cliente autentica no Amazon Cognito, que emite um token JWT.
- A requisição chega ao API Gateway, que valida o token JWT com o Cognito.
- O API Gateway encaminha a requisição para o Loadbalancer de cada serviço.

---

## 4. Automação com Terraform e GitHub Actions

### Comportamento:
O **Terraform** é utilizado para gerenciar toda a infraestrutura da aplicação, como DocumentDB, EKS e API Gateway. O **GitHub Actions** automatiza os processos de CI/CD, permitindo que a infraestrutura e a aplicação sejam implantadas automaticamente após cada push para a branch `main`.

Cada repositório possui workflows de GitHub Actions que:
- Aplicam as configurações de infraestrutura via Terraform.
- Fazem o deploy da aplicação no Kubernetes.

## Como Executar o Projeto

1. Clone os repositórios correspondentes.
2. Configure suas credenciais AWS e secrets no GitHub.
3. Construa e envie as imagens de cada serviço com o Docker para o **ECR**.
3. Realize um `git push` na branch `main` para disparar os workflows de CI/CD e provisionar a infraestrutura e a aplicação automaticamente.
4. O sistema estará disponível após o deploy no Kubernetes.

## SECRETS a serem criadas caso queria transferir os repositórios:

### 01_tcf4_infra_documentdb:
- **`AWS_ACCESS_KEY_ID`**: Chave de acesso AWS.
- **`AWS_SECRET_ACCESS_KEY`**: Chave secreta da AWS.
- **`AWS_REGION`**: Região AWS (ex: `us-east-1`).
- **`DB_MASTER_USERNAME`**: Nome de usuário do banco de dados DocumentDB.
- **`DB_MASTER_PASSWORD`**: Senha do banco de dados DocumentDB.
- **`DOCDB_USERNAME`**: Senha do banco de dados DocumentDB.

### 02_tcf4_infra_eks_cliente:
- **`AWS_ACCESS_KEY_ID`**: Chave de acesso AWS.
- **`AWS_SECRET_ACCESS_KEY`**: Chave secreta da AWS.
- **`AWS_REGION`**: Região AWS (ex: `us-east-1`).
- **`DB_MASTER_USERNAME`**: Nome de usuário do banco de dados DocumentDB.
- **`DB_MASTER_PASSWORD`**: Senha do banco de dados DocumentDB.
- **`DOCDB_USERNAME`**: Senha do banco de dados DocumentDB.
- **`DOCDB_CLUSTER_ENDPOINT_CLI`**: Endpoint banco de dados cliente.

### 03_tcf4_infra_eks_produto:
- **`AWS_ACCESS_KEY_ID`**: Chave de acesso AWS.
- **`AWS_SECRET_ACCESS_KEY`**: Chave secreta da AWS.
- **`AWS_REGION`**: Região AWS (ex: `us-east-1`).
- **`DB_MASTER_USERNAME`**: Nome de usuário do banco de dados DocumentDB.
- **`DB_MASTER_PASSWORD`**: Senha do banco de dados DocumentDB.
- **`DOCDB_USERNAME`**: Senha do banco de dados DocumentDB.
- **`DOCDB_CLUSTER_ENDPOINT_PRO`**: Endpoint banco de dados produtos.

### 04_tcf4_infra_eks_pedidopgto:
- **`AWS_ACCESS_KEY_ID`**: Chave de acesso AWS.
- **`AWS_SECRET_ACCESS_KEY`**: Chave secreta da AWS.
- **`AWS_REGION`**: Região AWS (ex: `us-east-1`).
- **`DB_MASTER_USERNAME`**: Nome de usuário do banco de dados DocumentDB.
- **`DB_MASTER_PASSWORD`**: Senha do banco de dados DocumentDB.
- **`DOCDB_USERNAME`**: Senha do banco de dados DocumentDB.
- **`DOCDB_CLUSTER_ENDPOINT_CLI`**: Endpoint banco de dados cliente.
- **`DOCDB_CLUSTER_ENDPOINT_PRO`**: Endpoint banco de dados produtos.
- **`DOCDB_CLUSTER_ENDPOINT_PED`**: Endpoint banco de dados pedidos e pagamento.
- **`PAGSEGURO_TOKEN`**: Token para integração do pagseguro.

### 05_tcf4_infra_cognito:
- **`AWS_ACCESS_KEY_ID`**: Chave de acesso AWS.
- **`AWS_SECRET_ACCESS_KEY`**: Chave secreta da AWS.
- **`AWS_REGION`**: Região AWS (ex: `us-east-1`).

### 06_tcf4_infra_apigateway:
- **`AWS_ACCESS_KEY_ID`**: Chave de acesso AWS.
- **`AWS_SECRET_ACCESS_KEY`**: Chave secreta da AWS.
- **`AWS_REGION`**: Região AWS (ex: `us-east-1`).
- **`URL_LB_CL`**: Endpoint loadbalancer eks cliente.
- **`URL_LB_PRO`**: Endpoint loadbalancer eks produtos.
- **`URL_LB_PED`**: Endpoint loadbalancer eks pedido pagamento.

---

## 6. Arquitetura do APP

<img align="center" src="https://github.com/CarlosLopes88/tech_challenge_4_fase/blob/main/Arquitetura.png">

