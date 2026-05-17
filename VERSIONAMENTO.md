# Versionamento do App

Este documento descreve o controle de versão usado para integração com o sistema "O que há de novo" do Hub Analytical X.

## Regras de Uso Futuro

- A cada nova feature relevante, o agente irá bump a `version` (semver: MAJOR.MINOR.PATCH) e atualizar o `whatsNew` em `public/version.json`.

- O Hub lê esse arquivo a cada login e mostra automaticamente um pop-up "O que há de novo" para os usuários.

## Exemplo de Bump

```json
{
  "version": "1.1.0",
  "whatsNew": "Adicionado filtro por categoria e exportação em Excel."
}
```
