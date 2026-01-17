#!/bin/bash
# ============================================================================
# deploy-contracts-local.sh
#
# 部署合约到本地 Anvil 链，并自动更新前端环境变量
#
# 用法:
#   bash scripts/deploy-contracts-local.sh
#
# 前提条件:
#   - Anvil 已在 127.0.0.1:8545 运行
#   - 已安装 forge, cast, jq
# ============================================================================

set -euo pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ============================================================================
# 配置
# ============================================================================
REPO_ROOT="$(git rev-parse --show-toplevel)"
RPC_URL="${RPC_URL:-http://127.0.0.1:8545}"
CHAIN_ID="31337"

# Anvil 默认账户
PRIVATE_KEY="${PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"
TREASURY="${TREASURY:-0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266}"
FEE_BPS="${FEE_BPS:-250}"

# 路径
CONTRACTS_DIR="$REPO_ROOT/packages/contracts"
DEPLOY_FILE="$CONTRACTS_DIR/deployments/$CHAIN_ID.json"
ENV_LOCAL_FILE="$REPO_ROOT/apps/web/.env.local"

# ============================================================================
# 前置检查
# ============================================================================
log_info "检查前置条件..."

# 检查 jq
if ! command -v jq &>/dev/null; then
    log_error "未安装 jq，请执行: brew install jq"
    exit 1
fi

# 检查 forge
if ! command -v forge &>/dev/null; then
    log_error "未安装 forge，请参考: https://book.getfoundry.sh/getting-started/installation"
    exit 1
fi

# 检查 Anvil 是否运行
if ! cast chain-id --rpc-url "$RPC_URL" &>/dev/null; then
    log_error "无法连接到 Anvil (${RPC_URL})"
    log_error "请先运行: pnpm chain:local:start"
    exit 1
fi

ACTUAL_CHAIN_ID=$(cast chain-id --rpc-url "$RPC_URL")
if [ "$ACTUAL_CHAIN_ID" != "$CHAIN_ID" ]; then
    log_error "Chain ID 不匹配: 期望 $CHAIN_ID, 实际 $ACTUAL_CHAIN_ID"
    exit 1
fi

log_ok "Anvil 运行中 (chainId: $CHAIN_ID)"

# ============================================================================
# 编译合约
# ============================================================================
log_info "编译合约..."
cd "$CONTRACTS_DIR"
forge build --silent
log_ok "合约编译完成"

# ============================================================================
# 部署合约
# ============================================================================
log_info "部署合约到本地链..."

# 获取当前区块高度作为 deploy block
DEPLOY_BLOCK=$(cast block-number --rpc-url "$RPC_URL")

# 设置部署环境变量
export PRIVATE_KEY
export TREASURY
export FEE_BPS

# 可选: 创建示例 Campaign
now=$(date +%s)
export GOAL="${GOAL:-1000000000000000000}"
export DEADLINE="${DEADLINE:-$((now + 7*24*3600))}"
export METADATA_URI="${METADATA_URI:-ipfs://QmExample}"

# 执行部署
forge script script/DeployAll.s.sol:DeployAll \
    --rpc-url "$RPC_URL" \
    --broadcast \
    --silent

log_ok "合约部署完成"

# ============================================================================
# 解析部署结果
# ============================================================================
log_info "解析部署结果..."

if [ ! -f "$DEPLOY_FILE" ]; then
    log_error "部署文件不存在: $DEPLOY_FILE"
    exit 1
fi

FACTORY_ADDRESS=$(jq -r '.factory // .CampaignFactory // empty' "$DEPLOY_FILE")
SAMPLE_CAMPAIGN=$(jq -r '.SampleCampaign // empty' "$DEPLOY_FILE")

if [ -z "$FACTORY_ADDRESS" ]; then
    log_error "无法从部署文件中解析 Factory 地址"
    exit 1
fi

log_ok "Factory 地址: $FACTORY_ADDRESS"
log_ok "部署区块: $DEPLOY_BLOCK"
[ -n "$SAMPLE_CAMPAIGN" ] && log_ok "示例 Campaign: $SAMPLE_CAMPAIGN"

# ============================================================================
# 复制 ABI 文件
# ============================================================================
log_info "同步 ABI 文件..."

ABI_DEST_WEB="$REPO_ROOT/apps/web/lib/abi"
ABI_DEST_SHARED="$REPO_ROOT/packages/contracts/abi"

mkdir -p "$ABI_DEST_WEB" "$ABI_DEST_SHARED"

cp out/CampaignFactory.sol/CampaignFactory.json "$ABI_DEST_WEB/" 2>/dev/null || true
cp out/Campaign.sol/Campaign.json "$ABI_DEST_WEB/" 2>/dev/null || true
cp out/CampaignFactory.sol/CampaignFactory.json "$ABI_DEST_SHARED/" 2>/dev/null || true
cp out/Campaign.sol/Campaign.json "$ABI_DEST_SHARED/" 2>/dev/null || true

log_ok "ABI 文件同步完成"

# ============================================================================
# 更新 apps/web/.env.local
# ============================================================================
log_info "更新前端环境变量..."

# 读取现有的 PINATA_JWT 和 GATEWAY_URL (如果存在)
EXISTING_PINATA_JWT=""
EXISTING_GATEWAY_URL=""

if [ -f "$ENV_LOCAL_FILE" ]; then
    EXISTING_PINATA_JWT=$(grep "^PINATA_JWT=" "$ENV_LOCAL_FILE" 2>/dev/null | cut -d '=' -f2- || echo "")
    EXISTING_GATEWAY_URL=$(grep "^NEXT_PUBLIC_GATEWAY_URL=" "$ENV_LOCAL_FILE" 2>/dev/null | cut -d '=' -f2- || echo "")
fi

# 写入新的 .env.local 文件
cat > "$ENV_LOCAL_FILE" << EOF
# ============================================================================
# 本地开发环境变量 (由 deploy-contracts-local.sh 自动生成)
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
# ============================================================================

# Edge Worker (本地)
NEXT_PUBLIC_EDGE=http://127.0.0.1:8787

# 区块链配置 (Anvil 本地链)
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=$CHAIN_ID
NEXT_PUBLIC_FACTORY=$FACTORY_ADDRESS
NEXT_PUBLIC_DEPLOY_BLOCK=$DEPLOY_BLOCK

# Pinata IPFS (请勿删除)
PINATA_JWT=${EXISTING_PINATA_JWT:-YOUR_PINATA_JWT_HERE}
NEXT_PUBLIC_GATEWAY_URL=${EXISTING_GATEWAY_URL:-YOUR_GATEWAY_URL_HERE}
EOF

log_ok "环境变量已写入: $ENV_LOCAL_FILE"

# ============================================================================
# 输出摘要
# ============================================================================
echo ""
echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}  本地合约部署完成!${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo "  Chain ID:        $CHAIN_ID"
echo "  RPC URL:         $RPC_URL"
echo "  Factory:         $FACTORY_ADDRESS"
echo "  Deploy Block:    $DEPLOY_BLOCK"
[ -n "$SAMPLE_CAMPAIGN" ] && echo "  Sample Campaign: $SAMPLE_CAMPAIGN"
echo ""
echo "  配置文件已更新:"
echo "    - $ENV_LOCAL_FILE"
echo "    - $DEPLOY_FILE"
echo ""
echo -e "${YELLOW}提示: 每次重启 Anvil 后需要重新部署合约${NC}"
echo ""
