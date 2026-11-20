# Roadmap de Segurança — 14 Princípios

> Esta é uma lista específica do projeto que combina princípios clássicos de engenharia de segurança e práticas modernas; não é uma lista oficial padronizada de 14.

**Avaliação:** somente revisão estática; os itens não representam certificação de segurança.

## Checklist de implementação

### 01. Privilégio mínimo

**Status:** Pendente  
**Evidência atual:** O acesso aos chunks é restrito por perfis; permissões das APIs não são geradas.

**Tarefas**

- [ ] Adicionar permissões por recurso e ação além das rotas
- [ ] Aplicar permissões nas APIs de negócio
- [ ] Testar matrizes de menor privilégio
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 02. Negação por padrão

**Status:** Pendente  
**Evidência atual:** Chunks desconhecidos e perfis não autorizados são negados; casos extremos da DSL precisam ser rejeitados.

**Tarefas**

- [ ] Rejeitar rotas protegidas sem perfis
- [ ] Falhar o build em erros semânticos e módulos ausentes
- [ ] Testar perfis desconhecidos e políticas ausentes
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 03. Defesa em profundidade

**Status:** Pendente  
**Evidência atual:** JWT e RBAC protegem a entrega; APIs de negócio exigem proteção independente.

**Tarefas**

- [ ] Integrar adaptadores de autorização para APIs
- [ ] Adicionar orientação e testes de CSP e headers
- [ ] Adicionar prevenção de abuso e monitoramento
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 04. Mediação completa

**Status:** Pendente  
**Evidência atual:** O endpoint gerado verifica acesso a cada requisição.

**Tarefas**

- [ ] Verificar cada operação sensível das APIs
- [ ] Auditar hospedagem estática e exposição via CDN
- [ ] Configurar cache private/no-store para respostas protegidas
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 05. Separação de funções

**Status:** Pendente  
**Evidência atual:** A DSL atual não representa políticas explícitas de separação de funções.

**Tarefas**

- [ ] Definir restrições de perfis incompatíveis quando necessário
- [ ] Exigir revisão de mudanças críticas nas políticas
- [ ] Testar combinações proibidas de perfis
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 06. Projeto aberto

**Status:** Pendente  
**Evidência atual:** O compilador DSL e o servidor gerado são inspecionáveis.

**Tarefas**

- [ ] Publicar modelo de ameaças e limites de segurança
- [ ] Documentar semântica da DSL e premissas de confiança
- [ ] Publicar exemplos reproduzíveis de ataques e defesas
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 07. Economia de mecanismos

**Status:** Pendente  
**Evidência atual:** CLI, compilador e runtime são separados; o carregamento dinâmico aumenta a complexidade.

**Tarefas**

- [ ] Simplificar Blob URLs e integração com React global
- [ ] Usar uma pipeline de compilação validada
- [ ] Remover caminhos duplicados de autorização
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 08. Mínimo mecanismo comum

**Status:** Pendente  
**Evidência atual:** O isolamento entre tenants ou contextos de aplicação não está explicitamente implementado.

**Tarefas**

- [ ] Isolar políticas e caches por aplicação/tenant se necessário
- [ ] Evitar estado mutável de autenticação compartilhado
- [ ] Documentar limites entre origens e tenants
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 09. Aceitabilidade de uso

**Status:** Pendente  
**Evidência atual:** A DSL e a CLI reduzem configuração manual.

**Tarefas**

- [ ] Exibir diagnósticos com arquivo/linha/coluna
- [ ] Criar comando doctor para verificar integração
- [ ] Publicar guias rápidos e exemplos mínimos
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 10. Confiança zero

**Status:** Pendente  
**Evidência atual:** JWT é verificado no servidor antes da entrega de chunks.

**Tarefas**

- [ ] Validar issuer/audience para provedores configurados
- [ ] Nunca confiar em perfis fornecidos pelo cliente
- [ ] Definir expiração, revogação e rotação de tokens
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 11. Segurança desde a concepção

**Status:** Pendente  
**Evidência atual:** A análise semântica verifica duplicidade de rotas, perfis e chunks.

**Tarefas**

- [ ] Criar modelo de ameaças STRIDE
- [ ] Adicionar fuzzing do parser e testes baseados em propriedades
- [ ] Executar testes de segurança no CI
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 12. Segurança por padrão

**Status:** Pendente  
**Evidência atual:** JWT_SECRET e CORS_ORIGIN são obrigatórios e a verificação JWT restringe HS256.

**Tarefas**

- [ ] Configurar cache e headers seguros por padrão
- [ ] Validar issuer/audience ao configurar um IdP
- [ ] Definir limites de requisição e defaults de produção
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 13. Responsabilização e auditoria

**Status:** Pendente  
**Evidência atual:** Não há evidência de auditoria estruturada das decisões de autorização no backend gerado.

**Tarefas**

- [ ] Registrar decisões allow/deny com IDs de correlação
- [ ] Ocultar tokens e dados pessoais
- [ ] Testar completude dos logs e política de retenção
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

### 14. Resiliência

**Status:** Pendente  
**Evidência atual:** Existe tratamento básico de erros; carregamento assíncrono e recuperação precisam de garantias.

**Tarefas**

- [ ] Cancelar requisições antigas ao sair/trocar rota
- [ ] Testar falhas de rede e sessões expiradas
- [ ] Adicionar testes de build determinístico e recuperação
- [ ] Verificar com testes automatizados e evidências documentadas

**Aceite:** Todas as tarefas aplicáveis implementadas, testes negativos aprovados e evidências vinculadas ao PR.

## Validação acadêmica

- [ ] Comparar entrega React convencional e entrega protegida
- [ ] Medir tentativas de bypass e aceitações indevidas
- [ ] Medir latência, tamanho e memória dos chunks
- [ ] Publicar modelo de ameaças, limitações e resultados reproduzíveis
