#!/bin/bash
# ============================================================================
# dev-local.sh
#
# 一键启动完整本地 Web3 开发环境
#
# 用法:
#   pnpm dev:local         # 启动基础环境 (chain + deploy + edge + web)
#   pnpm dev:local:full    # 启动完整环境 (包含 indexer + api)
#
# 流程:
#   1. 启动 Anvil 本地链
#   2. 等待链就绪
#   3. 部署智能合约
#   4. 自动更新 apps/web/.env.local
#   5. 启动服务 (edge, web, [indexer, api])
#
# 环境变量:
#   SKIP_DEPLOY=1     跳过合约部署 (链已部署过)
#   FULL_STACK=1      启动完整服务栈 (含 indexer/api)
# ============================================================================

set -euo pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "${CYAN}[STEP]${NC} $1"; }

# ============================================================================
# 配置
# ============================================================================
REPO_ROOT="$(git rev-parse --show-toplevel)"
ANVIL_PORT=8545
ANVIL_RPC="http://127.0.0.1:$ANVIL_PORT"
CHAIN_ID=31337

# 解析参数
FULL_STACK="${FULL_STACK:-0}"
SKIP_DEPLOY="${SKIP_DEPLOY:-0}"

for arg in "$@"; do
    case $arg in
        --full)
            FULL_STACK=1
            ;;
        --skip-deploy)
            SKIP_DEPLOY=1
            ;;
    esac
done

# ============================================================================
# 清理函数
# ============================================================================
PIDS=()

cleanup() {
    log_info "正在关闭所有服务..."
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
        fi
    done
    # 确保所有子进程都被终止
    jobs -p | xargs -r kill 2>/dev/null || true
    log_ok "清理完成"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# ============================================================================
# 前置检查
# ============================================================================
log_step "检查前置条件..."

check_command() {
    if ! command -v "$1" &>/dev/null; then
        log_error "未安装 $1"
        return 1
    fi
}

check_command anvil || { log_error "请安装 Foundry: https://book.getfoundry.sh/getting-started/installation"; exit 1; }
check_command forge || { log_error "请安装 Foundry: https://book.getfoundry.sh/getting-started/installation"; exit 1; }
check_command jq    || { log_error "请安装 jq: brew install jq"; exit 1; }
check_command pnpm  || { log_error "请安装 pnpm: npm install -g pnpm"; exit 1; }

log_ok "前置检查通过"

# ============================================================================
# Step 1: 启动 Anvil
# ============================================================================
log_step "启动 Anvil 本地链 (chainId: $CHAIN_ID, port: $ANVIL_PORT)..."

# 检查端口是否被占用
if lsof -i:$ANVIL_PORT -t &>/dev/null; then
    EXISTING_PID=$(lsof -i:$ANVIL_PORT -t | head -1)
    log_warn "端口 $ANVIL_PORT 已被占用 (PID: $EXISTING_PID)"
    read -p "是否终止现有进程? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill "$EXISTING_PID" 2>/dev/null || true
        sleep 1
    else
        log_info "使用现有 Anvil 实例"
        SKIP_ANVIL_START=1
    fi
fi

if [ "${SKIP_ANVIL_START:-0}" != "1" ]; then
    # 启动 Anvil (后台运行)
    anvil \
        --port $ANVIL_PORT \
        --chain-id $CHAIN_ID \
        --accounts 10 \
        --balance 10000 \
        --block-time 1 \
        > /tmp/anvil.log 2>&1 &
    ANVIL_PID=$!
    PIDS+=("$ANVIL_PID")

    # 等待 Anvil 就绪
    log_info "等待 Anvil 启动..."
    RETRIES=30
    while [ $RETRIES -gt 0 ]; do
        if cast chain-id --rpc-url "$ANVIL_RPC" &>/dev/null; then
            break
        fi
        sleep 0.5
        RETRIES=$((RETRIES - 1))
    done

    if [ $RETRIES -eq 0 ]; then
        log_error "Anvil 启动超时"
        cat /tmp/anvil.log
        exit 1
    fi

    log_ok "Anvil 已启动 (PID: $ANVIL_PID)"
fi

# ============================================================================
# Step 2: 部署合约
# ============================================================================
if [ "$SKIP_DEPLOY" != "1" ]; then
    log_step "部署智能合约..."

    cd "$REPO_ROOT"
    bash scripts/deploy-contracts-local.sh

    log_ok "合约部署完成"
else
    log_warn "跳过合约部署 (SKIP_DEPLOY=1)"
fi

# ============================================================================
# Step 3: 创建本地 Indexer/API 环境文件 (仅 --full 模式)
# ============================================================================
if [ "$FULL_STACK" = "1" ]; then
    log_step "配置本地 Indexer 环境..."

    # 读取部署信息
    DEPLOY_FILE="$REPO_ROOT/packages/contracts/deployments/$CHAIN_ID.json"
    if [ -f "$DEPLOY_FILE" ]; then
        FACTORY_ADDRESS=$(jq -r '.factory // .CampaignFactory // empty' "$DEPLOY_FILE")
    else
        log_error "部署文件不存在，请先部署合约"
        exit 1
    fi

    # 创建本地 indexer .env.local
    INDEXER_ENV="$REPO_ROOT/apps/indexer/.env.local"
    cat > "$INDEXER_ENV" << EOF
# 本地开发环境 (自动生成)
RPC_HTTP=http://127.0.0.1:$ANVIL_PORT
RPC_WSS=ws://127.0.0.1:$ANVIL_PORT
CHAIN_ID=$CHAIN_ID
FACTORY=$FACTORY_ADDRESS
DEPLOY_BLOCK=0
DATABASE_URL=\${DATABASE_URL:-postgresql://localhost:5432/fundr_local}
EOF
    log_ok "Indexer 环境已配置: $INDEXER_ENV"

    # 创建本地 edge .dev.vars
    EDGE_VARS="$REPO_ROOT/apps/edge/.dev.vars"
    cat > "$EDGE_VARS" << EOF
# 本地开发环境 (自动生成)
API_URL=http://127.0.0.1:3001
EOF
    log_ok "Edge 环境已配置: $EDGE_VARS"
fi

# ============================================================================
# Step 4: 启动服务
# ============================================================================
cd "$REPO_ROOT"

echo ""
log_step "启动开发服务..."
echo ""

if [ "$FULL_STACK" = "1" ]; then
    echo -e "${CYAN}============================================================================${NC}"
    echo -e "${CYAN}  启动完整服务栈 (Full Stack Mode)${NC}"
    echo -e "${CYAN}============================================================================${NC}"
    echo ""
    echo "  [chain]   Anvil           http://127.0.0.1:$ANVIL_PORT"
    echo "  [indexer] Event Indexer   (监听链事件)"
    echo "  [api]     Fastify API     http://127.0.0.1:3001"
    echo "  [edge]    Cloudflare Edge http://127.0.0.1:8787"
    echo "  [web]     Next.js         http://localhost:3000"
    echo ""
    echo -e "${YELLOW}注意: 完整模式需要本地 PostgreSQL 数据库${NC}"
    echo ""

    # 检查数据库连接
    if [ -z "${DATABASE_URL:-}" ]; then
        log_warn "DATABASE_URL 未设置，indexer/api 可能无法正常启动"
        log_info "请设置: export DATABASE_URL=postgresql://localhost:5432/fundr_local"
    fi

    # 使用 concurrently 并行启动所有服务
    exec npx concurrently \
        --kill-others \
        --names "chain,indexer,api,edge,web" \
        --prefix-colors "gray,magenta,yellow,blue,green" \
        "tail -f /tmp/anvil.log" \
        "pnpm --filter @apps/indexer dev" \
        "pnpm --filter @apps/api dev" \
        "pnpm --filter @apps/edge dev" \
        "pnpm --filter @apps/web dev"
else
    echo -e "${CYAN}============================================================================${NC}"
    echo -e "${CYAN}  启动基础服务栈 (UI Mode)${NC}"
    echo -e "${CYAN}============================================================================${NC}"
    echo ""
    echo "  [chain]   Anvil           http://127.0.0.1:$ANVIL_PORT"
    echo "  [edge]    Cloudflare Edge http://127.0.0.1:8787"
    echo "  [web]     Next.js         http://localhost:3000"
    echo ""
    echo -e "${YELLOW}提示: 前端将使用链上回退模式读取数据${NC}"
    echo -e "${YELLOW}如需完整服务栈 (含 indexer/api)，请使用: pnpm dev:local:full${NC}"
    echo ""

    # 使用 concurrently 并行启动服务
    exec npx concurrently \
        --kill-others \
        --names "chain,edge,web" \
        --prefix-colors "gray,blue,green" \
        "tail -f /tmp/anvil.log" \
        "pnpm --filter @apps/edge dev" \
        "pnpm --filter @apps/web dev"
fi
