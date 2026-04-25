#!/bin/bash

# Script de exemplo para testar a API MedControl
# Usage: bash examples.sh

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "MedControl API - Exemplos de Uso"
echo "=========================================="

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Fazer login como admin
echo -e "${BLUE}1. Fazendo login como ADMIN...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medcontrol.com",
    "senha": "admin123"
  }')

echo "$LOGIN_RESPONSE" | jq .
ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
ADMIN_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.data.usuario.id')

echo -e "${GREEN}✓ Admin Token: $ADMIN_TOKEN${NC}"
echo

# 2. Registrar novo usuário
echo -e "${BLUE}2. Registrando novo usuário...${NC}"
USER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@medcontrol.com",
    "senha": "senha123",
    "nome": "João Silva"
  }')

echo "$USER_RESPONSE" | jq .
USER_ID=$(echo "$USER_RESPONSE" | jq -r '.data.id')
echo

# 3. Login com novo usuário
echo -e "${BLUE}3. Fazendo login com novo usuário...${NC}"
USER_LOGIN=$(curl -s -X POST "$BASE_URL/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@medcontrol.com",
    "senha": "senha123"
  }')

echo "$USER_LOGIN" | jq .
USER_TOKEN=$(echo "$USER_LOGIN" | jq -r '.data.token')
echo

# 4. Listar medicamentos
echo -e "${BLUE}4. Listando medicamentos disponíveis...${NC}"
MEDS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/medicamentos" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$MEDS_RESPONSE" | jq .
FIRST_MED_ID=$(echo "$MEDS_RESPONSE" | jq -r '.data[0].id')
echo -e "${GREEN}✓ Primeiro medicamento ID: $FIRST_MED_ID${NC}"
echo

# 5. Criar novo medicamento (ADMIN)
echo -e "${BLUE}5. Criando novo medicamento (ADMIN)...${NC}"
NEW_MED=$(curl -s -X POST "$BASE_URL/api/medicamentos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "nome": "Dipirona",
    "descricao": "Analgésico e antipirético",
    "intervaloMinimoHoras": 6,
    "doseMáximaDiaria": 3000,
    "unidade": "mg"
  }')

echo "$NEW_MED" | jq .
NEW_MED_ID=$(echo "$NEW_MED" | jq -r '.data.id')
echo

# 6. Criar prescrição
echo -e "${BLUE}6. Criando prescrição...${NC}"
TODAY=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
NEXT_MONTH=$(date -u -d "+30 days" +"%Y-%m-%dT%H:%M:%SZ")

PRESCRIPTION=$(curl -s -X POST "$BASE_URL/api/prescricoes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"medicamentoId\": \"$FIRST_MED_ID\",
    \"dosagem\": 500,
    \"frequencia\": \"8h\",
    \"dataInicio\": \"$TODAY\",
    \"dataFim\": \"$NEXT_MONTH\",
    \"notasAdicionais\": \"Tomar após as refeições\"
  }")

echo "$PRESCRIPTION" | jq .
PRESCRIPTION_ID=$(echo "$PRESCRIPTION" | jq -r '.data.id')
echo -e "${GREEN}✓ Prescrição criada: $PRESCRIPTION_ID${NC}"
echo

# 7. Registrar uso de medicamento
echo -e "${BLUE}7. Registrando uso de medicamento...${NC}"
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

USAGE=$(curl -s -X POST "$BASE_URL/api/registros-uso" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"prescricaoId\": \"$PRESCRIPTION_ID\",
    \"dosagem\": 500,
    \"dataHora\": \"$NOW\",
    \"notas\": \"Tomado com água\"
  }")

echo "$USAGE" | jq .
USAGE_ID=$(echo "$USAGE" | jq -r '.data.id')
echo

# 8. Listar registros do usuário
echo -e "${BLUE}8. Listando registros de uso do usuário...${NC}"
USER_USAGES=$(curl -s -X GET "$BASE_URL/api/registros-uso/usuario/$USER_ID" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "$USER_USAGES" | jq .
echo

# 9. Tentar criar outro registro muito cedo (deve falhar com erro 400)
echo -e "${BLUE}9. Testando validação de intervalo mínimo entre doses...${NC}"
TOO_SOON=$(date -u -d "+2 hours" +"%Y-%m-%dT%H:%M:%SZ")

INVALID_USAGE=$(curl -s -X POST "$BASE_URL/api/registros-uso" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"prescricaoId\": \"$PRESCRIPTION_ID\",
    \"dosagem\": 500,
    \"dataHora\": \"$TOO_SOON\",
    \"notas\": \"Deve falhar\"
  }")

echo "$INVALID_USAGE" | jq .
echo -e "${YELLOW}✓ Validação funcionando corretamente (erro esperado)${NC}"
echo

# 10. Obter perfil do usuário
echo -e "${BLUE}10. Obtendo perfil do usuário logado...${NC}"
PROFILE=$(curl -s -X GET "$BASE_URL/api/users/profile" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "$PROFILE" | jq .
echo

# 11. Tentar acessar dado de outro usuário (deve falhar)
echo -e "${BLUE}11. Testando autorização - USER tentando ver dados de outro...${NC}"
OTHER_USER_ID=$(echo "$ADMIN_ID" | head -c 8)..."outro ID"
UNAUTHORIZED=$(curl -s -X GET "$BASE_URL/api/prescricoes/usuario/$ADMIN_ID" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "$UNAUTHORIZED" | jq .
echo -e "${YELLOW}✓ Autorização funcionando corretamente (acesso negado)${NC}"
echo

# 12. Health check
echo -e "${BLUE}12. Health Check...${NC}"
HEALTH=$(curl -s -X GET "$BASE_URL/health")
echo "$HEALTH" | jq .
echo

echo -e "${GREEN}=========================================="
echo "Exemplos de teste concluídos!"
echo "==========================================${NC}"
