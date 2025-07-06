#!/bin/bash

# Pre-commit Hook 管理脚本
# 用于管理 Git pre-commit hook 的启用、禁用和配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 路径定义
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOK_FILE="$PROJECT_ROOT/.git/hooks/pre-commit"
CONFIG_FILE="$PROJECT_ROOT/.git/hooks/pre-commit-config"

# 检查是否在 git 仓库中
check_git_repo() {
    if [ ! -d "$PROJECT_ROOT/.git" ]; then
        echo -e "${RED}错误: 当前不在 Git 仓库中${NC}"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo -e "${BLUE}Pre-commit Hook 管理脚本${NC}"
    echo ""
    echo "使用方法:"
    echo "  $0 [命令]"
    echo ""
    echo "可用命令:"
    echo -e "  ${GREEN}install${NC}     安装 pre-commit hook"
    echo -e "  ${GREEN}uninstall${NC}   卸载 pre-commit hook"
    echo -e "  ${GREEN}enable${NC}      启用 pre-commit hook"
    echo -e "  ${GREEN}disable${NC}     禁用 pre-commit hook"
    echo -e "  ${GREEN}status${NC}      查看 hook 状态"
    echo -e "  ${GREEN}config${NC}      编辑配置文件"
    echo -e "  ${GREEN}test${NC}        测试 hook 是否正常工作"
    echo -e "  ${GREEN}help${NC}        显示此帮助信息"
}

# 安装 hook
install_hook() {
    echo -e "${BLUE}安装 pre-commit hook...${NC}"
    
    if [ -f "$HOOK_FILE" ]; then
        echo -e "${YELLOW}Hook 已存在，正在更新...${NC}"
    fi
    
    # 创建 hook 文件
    cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash

# Pre-commit hook for running unit tests
# This script will run tests in specified directories before allowing a commit

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置文件路径
CONFIG_FILE=".git/hooks/pre-commit-config"

# 默认配置
DEFAULT_TEST_DIRS="src/components/schema-form/widgets/__tests__"
DEFAULT_TEST_COMMAND="pnpm run test:unit"

# 加载配置
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
    else
        # 使用默认配置
        TEST_DIRS="$DEFAULT_TEST_DIRS"
        TEST_COMMAND="$DEFAULT_TEST_COMMAND"
        
        # 创建默认配置文件
        cat > "$CONFIG_FILE" << EOFCONFIG
# Pre-commit hook 配置文件
# 可以通过编辑此文件来修改测试设置

# 要测试的目录（用空格分隔多个目录）
TEST_DIRS="$DEFAULT_TEST_DIRS"

# 测试命令
TEST_COMMAND="$DEFAULT_TEST_COMMAND"

# 是否启用hook（true/false）
ENABLED=true

# 是否显示详细输出（true/false）
VERBOSE=false
EOFCONFIG
        echo -e "${YELLOW}已创建配置文件: $CONFIG_FILE${NC}"
    fi
}

# 检查是否启用
is_enabled() {
    [ "$ENABLED" = "true" ]
}

# 检查测试目录是否存在
check_test_dirs() {
    local missing_dirs=()
    
    for dir in $TEST_DIRS; do
        if [ ! -d "$dir" ]; then
            missing_dirs+=("$dir")
        fi
    done
    
    if [ ${#missing_dirs[@]} -gt 0 ]; then
        echo -e "${YELLOW}警告: 以下测试目录不存在:${NC}"
        for dir in "${missing_dirs[@]}"; do
            echo -e "  - $dir"
        done
        echo -e "${YELLOW}将跳过这些目录的测试${NC}"
    fi
}

# 运行指定目录的测试
run_tests() {
    local test_files=()
    
    # 收集所有测试文件
    for dir in $TEST_DIRS; do
        if [ -d "$dir" ]; then
            while IFS= read -r -d '' file; do
                test_files+=("$file")
            done < <(find "$dir" -name "*.spec.ts" -o -name "*.spec.js" -o -name "*.test.ts" -o -name "*.test.js" -print0)
        fi
    done
    
    if [ ${#test_files[@]} -eq 0 ]; then
        echo -e "${YELLOW}未找到测试文件，跳过测试${NC}"
        return 0
    fi
    
    echo -e "${GREEN}找到 ${#test_files[@]} 个测试文件${NC}"
    
    if [ "$VERBOSE" = "true" ]; then
        echo "测试文件列表:"
        for file in "${test_files[@]}"; do
            echo "  - $file"
        done
    fi
    
    # 运行测试
    echo -e "${GREEN}正在运行测试...${NC}"
    
    if [ "$VERBOSE" = "true" ]; then
        $TEST_COMMAND "${test_files[@]}"
    else
        $TEST_COMMAND "${test_files[@]}" > /dev/null 2>&1
    fi
    
    return $?
}

# 主函数
main() {
    echo -e "${GREEN}Pre-commit Hook: 运行单元测试${NC}"
    
    # 加载配置
    load_config
    
    # 检查是否启用
    if ! is_enabled; then
        echo -e "${YELLOW}Pre-commit hook 已禁用${NC}"
        exit 0
    fi
    
    # 检查测试目录
    check_test_dirs
    
    # 运行测试
    if run_tests; then
        echo -e "${GREEN}✅ 所有测试通过！${NC}"
        exit 0
    else
        echo -e "${RED}❌ 测试失败！提交被阻止。${NC}"
        echo -e "${RED}请修复测试错误后重新提交。${NC}"
        echo ""
        echo -e "${YELLOW}提示:${NC}"
        echo -e "  - 运行 'pnpm run test:unit' 查看详细测试结果"
        echo -e "  - 编辑 '$CONFIG_FILE' 修改测试配置"
        echo -e "  - 运行 'git commit --no-verify' 跳过此hook（不推荐）"
        exit 1
    fi
}

# 运行主函数
main "$@"
EOF
    
    # 添加执行权限
    chmod +x "$HOOK_FILE"
    
    echo -e "${GREEN}✅ Pre-commit hook 安装成功！${NC}"
}

# 卸载 hook
uninstall_hook() {
    echo -e "${BLUE}卸载 pre-commit hook...${NC}"
    
    if [ -f "$HOOK_FILE" ]; then
        rm "$HOOK_FILE"
        echo -e "${GREEN}✅ Pre-commit hook 已卸载${NC}"
    else
        echo -e "${YELLOW}Hook 不存在，无需卸载${NC}"
    fi
    
    if [ -f "$CONFIG_FILE" ]; then
        read -p "是否也删除配置文件？(y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm "$CONFIG_FILE"
            echo -e "${GREEN}✅ 配置文件已删除${NC}"
        fi
    fi
}

# 启用 hook
enable_hook() {
    if [ ! -f "$HOOK_FILE" ]; then
        echo -e "${RED}错误: Hook 未安装，请先运行 'install' 命令${NC}"
        exit 1
    fi
    
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${YELLOW}配置文件不存在，将创建默认配置${NC}"
        install_hook
    fi
    
    # 修改配置文件
    sed -i.bak 's/ENABLED=false/ENABLED=true/g' "$CONFIG_FILE" || {
        echo 'ENABLED=true' >> "$CONFIG_FILE"
    }
    
    echo -e "${GREEN}✅ Pre-commit hook 已启用${NC}"
}

# 禁用 hook
disable_hook() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${YELLOW}配置文件不存在${NC}"
        return
    fi
    
    # 修改配置文件
    sed -i.bak 's/ENABLED=true/ENABLED=false/g' "$CONFIG_FILE"
    
    echo -e "${GREEN}✅ Pre-commit hook 已禁用${NC}"
}

# 查看状态
show_status() {
    echo -e "${BLUE}Pre-commit Hook 状态:${NC}"
    echo ""
    
    if [ -f "$HOOK_FILE" ]; then
        echo -e "  Hook 文件: ${GREEN}已安装${NC}"
        echo -e "  位置: $HOOK_FILE"
        
        if [ -x "$HOOK_FILE" ]; then
            echo -e "  权限: ${GREEN}可执行${NC}"
        else
            echo -e "  权限: ${RED}不可执行${NC}"
        fi
    else
        echo -e "  Hook 文件: ${RED}未安装${NC}"
    fi
    
    if [ -f "$CONFIG_FILE" ]; then
        echo -e "  配置文件: ${GREEN}存在${NC}"
        echo -e "  位置: $CONFIG_FILE"
        
        # 读取配置
        source "$CONFIG_FILE" 2>/dev/null || true
        
        if [ "$ENABLED" = "true" ]; then
            echo -e "  状态: ${GREEN}已启用${NC}"
        else
            echo -e "  状态: ${RED}已禁用${NC}"
        fi
        
        echo -e "  测试目录: ${YELLOW}$TEST_DIRS${NC}"
        echo -e "  测试命令: ${YELLOW}$TEST_COMMAND${NC}"
        echo -e "  详细输出: ${YELLOW}$VERBOSE${NC}"
    else
        echo -e "  配置文件: ${RED}不存在${NC}"
    fi
}

# 编辑配置
edit_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${YELLOW}配置文件不存在，将创建默认配置${NC}"
        install_hook
    fi
    
    echo -e "${BLUE}打开配置文件...${NC}"
    
    # 尝试使用不同的编辑器
    if command -v code > /dev/null 2>&1; then
        code "$CONFIG_FILE"
    elif command -v vim > /dev/null 2>&1; then
        vim "$CONFIG_FILE"
    elif command -v nano > /dev/null 2>&1; then
        nano "$CONFIG_FILE"
    else
        echo -e "${RED}未找到合适的编辑器${NC}"
        echo -e "${YELLOW}请手动编辑文件: $CONFIG_FILE${NC}"
    fi
}

# 测试 hook
test_hook() {
    echo -e "${BLUE}测试 pre-commit hook...${NC}"
    
    if [ ! -f "$HOOK_FILE" ]; then
        echo -e "${RED}错误: Hook 未安装${NC}"
        exit 1
    fi
    
    if [ ! -x "$HOOK_FILE" ]; then
        echo -e "${RED}错误: Hook 文件不可执行${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}模拟运行 pre-commit hook...${NC}"
    "$HOOK_FILE"
}

# 主函数
main() {
    check_git_repo
    
    case "${1:-help}" in
        install)
            install_hook
            ;;
        uninstall)
            uninstall_hook
            ;;
        enable)
            enable_hook
            ;;
        disable)
            disable_hook
            ;;
        status)
            show_status
            ;;
        config)
            edit_config
            ;;
        test)
            test_hook
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}错误: 未知命令 '$1'${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@" 