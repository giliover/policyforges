# Trello — PolicyForges Security Roadmap

Suggested lists: **Backlog → Ready → In Progress → Security Review → Done**.

Copy each heading as a Trello card and its checkboxes into the card description. Do not mark cards complete until tests/evidence are linked.

## P0 — Immediate security hardening

### PF-SEC-02 — Fail-Safe Defaults / Negação por padrão

**Checklist**

- [ ] Rejeitar rotas protegidas sem perfis
- [ ] Falhar o build em erros semânticos e módulos ausentes
- [ ] Testar perfis desconhecidos e políticas ausentes
- [ ] Testes negativos aprovados e evidências anexadas

**Labels:** security, P0

### PF-SEC-04 — Complete Mediation / Mediação completa

**Checklist**

- [ ] Verificar cada operação sensível das APIs
- [ ] Auditar hospedagem estática e exposição via CDN
- [ ] Configurar cache private/no-store para respostas protegidas
- [ ] Testes negativos aprovados e evidências anexadas

**Labels:** security, P0

### PF-SEC-10 — Zero Trust / Confiança zero

**Checklist**

- [ ] Validar issuer/audience para provedores configurados
- [ ] Nunca confiar em perfis fornecidos pelo cliente
- [ ] Definir expiração, revogação e rotação de tokens
- [ ] Testes negativos aprovados e evidências anexadas

**Labels:** security, P0

### PF-SEC-12 — Secure by Default / Segurança por padrão

**Checklist**

- [ ] Configurar cache e headers seguros por padrão
- [ ] Validar issuer/audience ao configurar um IdP
- [ ] Definir limites de requisição e defaults de produção
- [ ] Testes negativos aprovados e evidências anexadas

**Labels:** security, P0

### PF-SEC-14 — Resilience / Resiliência

**Checklist**

- [ ] Cancelar requisições antigas ao sair/trocar rota
- [ ] Testar falhas de rede e sessões expiradas
- [ ] Adicionar testes de build determinístico e recuperação
- [ ] Testes negativos aprovados e evidências anexadas

**Labels:** security, P0

## P1 — Policy correctness and verification

### PF-SEC-01 — Least Privilege / Privilégio mínimo

**Checklist**

- [ ] Adicionar permissões por recurso e ação além das rotas
- [ ] Aplicar permissões nas APIs de negócio
- [ ] Testar matrizes de menor privilégio
- [ ] Testes e documentação revisados

**Labels:** security, P1

### PF-SEC-03 — Defense in Depth / Defesa em profundidade

**Checklist**

- [ ] Integrar adaptadores de autorização para APIs
- [ ] Adicionar orientação e testes de CSP e headers
- [ ] Adicionar prevenção de abuso e monitoramento
- [ ] Testes e documentação revisados

**Labels:** security, P1

### PF-SEC-06 — Open Design / Projeto aberto

**Checklist**

- [ ] Publicar modelo de ameaças e limites de segurança
- [ ] Documentar semântica da DSL e premissas de confiança
- [ ] Publicar exemplos reproduzíveis de ataques e defesas
- [ ] Testes e documentação revisados

**Labels:** security, P1

### PF-SEC-07 — Economy of Mechanism / Economia de mecanismos

**Checklist**

- [ ] Simplificar Blob URLs e integração com React global
- [ ] Usar uma pipeline de compilação validada
- [ ] Remover caminhos duplicados de autorização
- [ ] Testes e documentação revisados

**Labels:** security, P1

### PF-SEC-11 — Secure by Design / Segurança desde a concepção

**Checklist**

- [ ] Criar modelo de ameaças STRIDE
- [ ] Adicionar fuzzing do parser e testes baseados em propriedades
- [ ] Executar testes de segurança no CI
- [ ] Testes e documentação revisados

**Labels:** security, P1

### PF-SEC-13 — Accountability / Responsabilização e auditoria

**Checklist**

- [ ] Registrar decisões allow/deny com IDs de correlação
- [ ] Ocultar tokens e dados pessoais
- [ ] Testar completude dos logs e política de retenção
- [ ] Testes e documentação revisados

**Labels:** security, P1

## P2 — Usability and advanced isolation

### PF-SEC-05 — Separation of Duties / Separação de funções

**Checklist**

- [ ] Definir restrições de perfis incompatíveis quando necessário
- [ ] Exigir revisão de mudanças críticas nas políticas
- [ ] Testar combinações proibidas de perfis
- [ ] Critérios de aceite e evidências revisados

**Labels:** security, P2

### PF-SEC-08 — Least Common Mechanism / Mínimo mecanismo comum

**Checklist**

- [ ] Isolar políticas e caches por aplicação/tenant se necessário
- [ ] Evitar estado mutável de autenticação compartilhado
- [ ] Documentar limites entre origens e tenants
- [ ] Critérios de aceite e evidências revisados

**Labels:** security, P2

### PF-SEC-09 — Psychological Acceptability / Aceitabilidade de uso

**Checklist**

- [ ] Exibir diagnósticos com arquivo/linha/coluna
- [ ] Criar comando doctor para verificar integração
- [ ] Publicar guias rápidos e exemplos mínimos
- [ ] Critérios de aceite e evidências revisados

**Labels:** security, P2

## Research / TCC — Validation

### PF-RESEARCH-01 — Experimental evaluation

- [ ] Modelar ameaças com STRIDE
- [ ] Comparar React convencional versus entrega RBAC
- [ ] Testar acesso sem token, token inválido, perfis incorretos e acesso direto
- [ ] Medir latência p50/p95, tamanho do bundle e memória
- [ ] Documentar limites: código entregue pode ser copiado; APIs exigem autorização própria
- [ ] Publicar resultados reproduzíveis

**Labels:** research, P1
