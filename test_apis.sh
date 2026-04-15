#!/bin/bash

# 配置参数
BASE_URL=${1:-"http://localhost:3000"}
FORMAT_MODE="pretty" # 默认美化输出

# 检查是否请求原始输出
if [[ "$2" == "--raw" ]]; then
    FORMAT_MODE="raw"
fi

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# 检查 jq 是否安装
HAS_JQ=false
if command -v jq >/dev/null 2>&1; then
    HAS_JQ=true
fi

echo -e "${CYAN}==================================================${NC}"
echo -e "${CYAN}   Qimi API 批量测试${NC}"
echo -e "${CYAN}   目标地址: $BASE_URL${NC}"
echo -e "${CYAN}   模式: $FORMAT_MODE (JQ 支持: $HAS_JQ)${NC}"
echo -e "${CYAN}==================================================${NC}"

# 测试函数
test_endpoint() {
    local name=$1
    local path=$2
    local url="$BASE_URL$path"
    
    echo -e "\n${YELLOW}测试项目: $name${NC}"
    echo -e "${CYAN}请求路径: $path${NC}"
    
    # 执行请求：获取响应体和状态码（最后三位）
    # 使用 -w "\n%{http_code}" 将状态码附加在最后一行
    raw_response=$(curl -s -w "\n%{http_code}" "$url")
    
    # 分离状态码和响应体
    http_code=$(echo "$raw_response" | tail -n 1)
    body=$(echo "$raw_response" | head -n -1)
    
    # 输出状态
    if [[ "$http_code" == "200" ]]; then
        echo -e "状态: ${GREEN}成功 (200)${NC}"
    else
        echo -e "状态: ${RED}失败 ($http_code)${NC}"
    fi
    
    # 输出响应内容
    echo -e "响应内容:"
    if [[ "$FORMAT_MODE" == "pretty" && "$HAS_JQ" == "true" ]]; then
        echo "$body" | jq .
    else
        echo "$body"
    fi
    echo -e "${CYAN}--------------------------------------------------${NC}"
}

# 1. 基础文档
test_endpoint "OpenAPI JSON" "/api/openapi.json"

# 2. 天气接口 (测试自动定位)
test_endpoint "天气 (自动定位)" "/api/weather"

# 3. 天气接口 (测试指定经纬度)
test_endpoint "天气 (上海)" "/api/weather?latitude=31.23&longitude=121.47"

# 4. IP 定位接口 (测试中文)
test_endpoint "IP 定位 (中文)" "/api/ip?lang=zh-CN"

# 5. 搜索接口 (测试 Bing)
test_endpoint "搜索 (Bing)" "/api/search?q=javascript&count=5"

# 6. 百度热搜
test_endpoint "百度热搜" "/api/hot"

# 7. 历史接口 (测试指定日期)
test_endpoint "历史今天 (10月1日)" "/api/history?month=10&day=01"

echo -e "\n${GREEN}所有测试执行完毕！${NC}"
